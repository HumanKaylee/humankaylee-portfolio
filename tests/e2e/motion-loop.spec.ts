import { expect, test } from "@playwright/test";

const loopSource = "/media/cryo-flow-sim-loop-960.mp4";
const loopPoster = "/media/cryo-flow-sim-loop-960.webp";
const loopDescription =
	"A ten-second silent loop: the overview transitions into coordinated valve movement, active transfer flow, and changing tank telemetry before returning to a stable frame.";

test.describe("Cryogenic Flow motion loop @motion-loop", () => {
	test("starts in view, pauses offscreen and while hidden, and honors user pause", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto("/");

		const loop = page.locator("[data-motion-loop]").first();
		const video = loop.locator("[data-motion-video]");
		const toggle = loop.locator("[data-motion-toggle]");

		await expect(loop).toHaveAttribute("data-motion-ready", "true");
		await expect(video).toHaveJSProperty("muted", true);
		await expect(video).toHaveAttribute("loop", "");
		await expect(video).toHaveAttribute("playsinline", "");
		await expect(video).toHaveAttribute("preload", "none");
		await expect(video).toHaveAttribute("width", "960");
		await expect(video).toHaveAttribute("height", "540");
		await expect(video).toHaveAttribute("poster", loopPoster);
		await expect(video).toHaveAttribute("src", loopSource);
		await expect(toggle).toBeVisible();
		await expect(toggle).toHaveAccessibleName(/pause animation/i);
		expect((await toggle.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(
			44,
		);
		await expect
			.poll(() =>
				video.evaluate((element) => !(element as HTMLVideoElement).paused),
			)
			.toBe(true);

		await page.locator(".home-contact").scrollIntoViewIfNeeded();
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).paused),
			)
			.toBe(true);
		await loop.scrollIntoViewIfNeeded();
		await expect
			.poll(() =>
				video.evaluate((element) => !(element as HTMLVideoElement).paused),
			)
			.toBe(true);

		await page.evaluate(() => {
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				get: () => "hidden",
			});
			document.dispatchEvent(new Event("visibilitychange"));
		});
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).paused),
			)
			.toBe(true);
		await page.evaluate(() => {
			Object.defineProperty(document, "visibilityState", {
				configurable: true,
				get: () => "visible",
			});
			document.dispatchEvent(new Event("visibilitychange"));
		});
		await expect
			.poll(() =>
				video.evaluate((element) => !(element as HTMLVideoElement).paused),
			)
			.toBe(true);

		await toggle.click();
		await expect(loop).toHaveAttribute("data-user-paused", "true");
		await expect(toggle).toHaveAccessibleName(/play animation/i);
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).paused),
			)
			.toBe(true);

		await page.locator(".home-contact").scrollIntoViewIfNeeded();
		await loop.scrollIntoViewIfNeeded();
		await expect(loop).toHaveAttribute("data-user-paused", "true");
		await expect(toggle).toHaveAccessibleName(/play animation/i);
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).paused),
			)
			.toBe(true);

		await toggle.click();
		await expect(loop).toHaveAttribute("data-user-paused", "false");
		await expect(toggle).toHaveAccessibleName(/pause animation/i);
		await expect
			.poll(() =>
				video.evaluate((element) => !(element as HTMLVideoElement).paused),
			)
			.toBe(true);
	});

	test("allows at most one visible project loop to play", async ({ page }) => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto("/");

		const loops = page.locator("[data-motion-loop]");
		await expect(loops).toHaveCount(4);
		await loops.nth(1).scrollIntoViewIfNeeded();

		await expect
			.poll(() =>
				page
					.locator("[data-motion-video]")
					.evaluateAll(
						(videos) =>
							videos.filter((video) => !(video as HTMLVideoElement).paused)
								.length,
					),
			)
			.toBeLessThanOrEqual(1);
	});

	test("keeps the poster and description without JavaScript", async ({
		browser,
		baseURL,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();

		try {
			await page.goto(new URL("/", baseURL).toString());
			const loop = page.locator("[data-motion-loop]").first();
			const video = loop.locator("[data-motion-video]");

			await expect(loop).toBeVisible();
			await expect(video).toHaveAttribute("poster", loopPoster);
			await expect(video).toHaveAttribute("data-src", loopSource);
			await expect(video).not.toHaveAttribute("src", /.+/);
			await expect(loop.locator("[data-motion-description]")).toHaveText(
				loopDescription,
			);
			await expect(loop.locator("[data-motion-toggle]")).toBeHidden();
		} finally {
			await context.close();
		}
	});

	test("does not request the MP4 when reduced motion is preferred", async ({
		page,
	}) => {
		const mediaRequests: string[] = [];
		page.on("request", (request) => {
			if (new URL(request.url()).pathname === loopSource) {
				mediaRequests.push(request.url());
			}
		});
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		const loop = page.locator("[data-motion-loop]").first();
		const video = loop.locator("[data-motion-video]");
		await expect(loop).toHaveAttribute("data-motion-ready", "true");
		await expect(video).toHaveAttribute("data-src", loopSource);
		await expect(video).not.toHaveAttribute("src", /.+/);
		await expect(video).toHaveJSProperty("currentSrc", "");
		await expect(loop.locator("[data-motion-toggle]")).toBeHidden();
		await page.waitForTimeout(250);
		expect(mediaRequests).toEqual([]);
	});
});
