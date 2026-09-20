import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";

const route = "/work/cryo-flow-sim/";
const family = "/media/cryo-flow-sim-process/";

test("explains three concurrent circuits and their physical and visual limits", async ({
	page,
}) => {
	await page.goto(route);
	const main = page.locator("main");
	for (const name of [
		"liquid nitrogen",
		"liquid argon",
		"pure liquid methane",
	]) {
		await expect(main).toContainText(new RegExp(name, "i"));
	}
	await expect(main).toContainText(/continue.*page|page.*continue/i);
	await expect(main).toContainText(/mass and energy/i);
	await expect(main).toContainText(/LNG surrogate/i);
	await expect(main).toContainText(/replay/i);
	await expect(main).not.toContainText(
		/validated explosion|accurate hazard distance/i,
	);
	await expect(page.locator(`video:has(source[src^="${family}"])`)).toHaveCount(
		2,
	);
});

test("new process media matches its reviewed manifest", async ({ request }) => {
	const manifest = JSON.parse(
		readFileSync("apps/web/src/data/cryo-process-media-manifest.json", "utf8"),
	) as {
		items: {
			file: string;
			bytes: number;
			sha256: string;
			capture_class: string;
		}[];
	};
	expect(manifest.items.length).toBeGreaterThanOrEqual(6);
	for (const item of manifest.items) {
		expect(item.capture_class.length).toBeGreaterThan(10);
		const disk = readFileSync(join("apps/web/public", family, item.file));
		expect(disk.length).toBe(item.bytes);
		expect(createHash("sha256").update(disk).digest("hex")).toBe(item.sha256);
		const served = await request.get(`${family}${item.file}`);
		expect(served.status()).toBe(200);
		expect(
			createHash("sha256")
				.update(await served.body())
				.digest("hex"),
		).toBe(item.sha256);
	}
});

test("both new videos play, seek and resume through native controls", async ({
	page,
}) => {
	await page.goto(route);
	const clips = page.locator(`video:has(source[src^="${family}"])`);
	await expect(clips).toHaveCount(2);
	for (const clip of await clips.all()) {
		await expect(clip).toHaveAttribute("controls", "");
		await expect(clip).not.toHaveAttribute("autoplay", "");
		await clip.scrollIntoViewIfNeeded();
		await clip.evaluate(async (element) => {
			const video = element as HTMLVideoElement;
			video.muted = true;
			await video.play();
		});
		await expect
			.poll(() => clip.evaluate((el) => (el as HTMLVideoElement).currentTime))
			.toBeGreaterThan(0.1);
		const target = await clip.evaluate((el) => {
			const video = el as HTMLVideoElement;
			video.pause();
			video.currentTime = video.duration * 0.65;
			return video.currentTime;
		});
		expect(target).toBeGreaterThan(1);
		await clip.evaluate(async (el) => {
			await (el as HTMLVideoElement).play();
		});
		await expect
			.poll(() => clip.evaluate((el) => (el as HTMLVideoElement).currentTime))
			.toBeGreaterThan(target + 0.1);
		await clip.evaluate((el) => {
			(el as HTMLVideoElement).pause();
		});
	}
});
