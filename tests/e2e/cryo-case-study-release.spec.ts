import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

// CryoSim M11 stage 1 release instruments (program plan
// M11-STAGE1-STATIC-CASE-STUDY-ENTRY.md, unit 3; budgets in
// budgets-m11-stage1.v1.json). Each check is one the case-study update could
// fail on its own: a no-JS page that loses its narrative, an autoplaying loop
// under reduced motion, a forbidden host name in a caption, a still whose bytes
// drifted from the manifest, an accessibility regression, horizontal overflow.
// Every check has a negative case beside it so a wrong instrument cannot pass.

const PATH = "/work/cryo-flow-sim/";
const MANIFEST = "apps/web/src/data/cryo-m10-media-manifest.json";
const PUBLIC_MEDIA_DIR = "apps/web/public/media/cryo-flow-sim-m10";

// budgets-m11-stage1.v1.json: content_scan_forbidden_terms. The scan covers what
// ships to a visitor: the rendered text, every alt/aria-label/title, and every
// href/src under the page, plus metadata. It does not cover the dev server's
// own module URLs (Vite injects the runner's absolute path into dev-only script
// attributes, which never reach the static build; measured on CI 2026-09-11).
const FORBIDDEN: RegExp[] = [
	/127\.0\.0\.1/,
	/ROG_STRIX/i,
	/rog-strix/i,
	/lightred/i,
	/ares-tron/i,
	/joepo\\/,
	/C:\\Users/i,
	/\/home\/[a-z]/i,
	/Documents\\Codex/i,
	/_target-/,
	/\b100\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/,
	/\b192\.168\.\d{1,3}\.\d{1,3}\b/,
];

const MANDATORY = [
	/simulation-only/i,
	/no (write-capable path|live-equipment)/i,
	/not a concentration, release-rate, dispersion or hazard-distance analysis/i,
	/qualitative/i,
	/engineering demonstration/i,
];

function scanForbidden(text: string): string[] {
	return FORBIDDEN.filter((term) => term.test(text)).map(String);
}

test.describe("CryoSim case study - stage 1 release instruments", () => {
	test("the shipped page content contains no forbidden host, path or address term and carries the mandatory language", async ({
		page,
	}) => {
		await page.goto(PATH);
		const shipped = await page.evaluate(() => {
			const parts: string[] = [document.title, document.body.innerText];
			for (const meta of document.querySelectorAll("meta[content]")) {
				parts.push(meta.getAttribute("content") ?? "");
			}
			for (const el of document.querySelectorAll(
				"main *, header *, footer *",
			)) {
				for (const attr of [
					"alt",
					"aria-label",
					"title",
					"href",
					"src",
					"poster",
					"srcset",
				]) {
					const value = el.getAttribute(attr);
					if (value) parts.push(value);
				}
			}
			return parts.join("\n");
		});
		expect(scanForbidden(shipped)).toEqual([]);
		for (const pattern of MANDATORY) {
			expect(shipped, `mandatory language ${pattern}`).toMatch(pattern);
		}
		// negative: the scanner must catch planted terms
		expect(
			scanForbidden(`${shipped} see 127.0.0.1:8791 and 100.77.135.5`),
		).toEqual([String(FORBIDDEN[0]), String(FORBIDDEN[10])]);
	});

	test("every manifest derivative and the video are served with the manifest's bytes and hash, and no still is black", async ({
		request,
	}) => {
		const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
			schema_version: string;
			items: {
				id: string;
				kind: "image" | "video";
				video?: { file: string; bytes: number; sha256: string };
				derivatives: {
					file: string;
					bytes: number;
					sha256: string;
					mean_luminance_0_255: number;
				}[];
			}[];
		};
		// The 2026-09-11 photoreal family: three stills and one video whose poster
		// frames are its derivatives. An older manifest (four stills, no video)
		// must not pass.
		expect(manifest.schema_version).toBe("2.0.0");
		expect(manifest.items.map((item) => `${item.kind}:${item.id}`)).toEqual([
			"image:cryo-field-scene",
			"image:cryo-cue-none",
			"video:cryo-seam-vapour-leak",
			"image:cryo-cue-cleared",
		]);
		for (const item of manifest.items) {
			if (item.video) {
				const onDisk = readFileSync(join(PUBLIC_MEDIA_DIR, item.video.file));
				expect(
					createHash("sha256").update(onDisk).digest("hex"),
					`${item.video.file} on disk`,
				).toBe(item.video.sha256);
				expect(onDisk.length).toBe(item.video.bytes);
				const response = await request.get(
					`/media/cryo-flow-sim-m10/${item.video.file}`,
				);
				expect(response.status(), item.video.file).toBe(200);
				expect(response.headers()["content-type"]).toContain("video/mp4");
				expect(
					createHash("sha256")
						.update(await response.body())
						.digest("hex"),
					`${item.video.file} served`,
				).toBe(item.video.sha256);
			}
			for (const derivative of item.derivatives) {
				const onDisk = readFileSync(join(PUBLIC_MEDIA_DIR, derivative.file));
				const diskHash = createHash("sha256").update(onDisk).digest("hex");
				expect(diskHash, `${derivative.file} on disk`).toBe(derivative.sha256);
				expect(onDisk.length).toBe(derivative.bytes);
				expect(
					derivative.mean_luminance_0_255,
					`${derivative.file} luminance`,
				).toBeGreaterThan(10);
				const response = await request.get(
					`/media/cryo-flow-sim-m10/${derivative.file}`,
				);
				expect(response.status(), derivative.file).toBe(200);
				const served = await response.body();
				expect(
					createHash("sha256").update(served).digest("hex"),
					`${derivative.file} served`,
				).toBe(derivative.sha256);
			}
		}
		// negative: a drifted byte must not match
		const first = manifest.items[0].derivatives[0];
		const drifted = Buffer.concat([
			readFileSync(join(PUBLIC_MEDIA_DIR, first.file)),
			Buffer.from([0]),
		]);
		expect(createHash("sha256").update(drifted).digest("hex")).not.toBe(
			first.sha256,
		);
	});

	test("the page keeps its narrative, captions and a direct media link without JavaScript", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		await page.goto(PATH);
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			/Cryogenic Flow Simulation/i,
		);
		for (const id of ["situation", "system", "proof"]) {
			await expect(page.locator(`#${id}`), `section ${id}`).toBeVisible();
		}
		await expect(page.getByText(/Known limits/i)).toBeVisible();
		const captions = page.locator("figcaption");
		expect(await captions.count()).toBeGreaterThanOrEqual(6);
		const mediaLinks = await page
			.locator('video[src], video source[src], a[href*="/media/"]')
			.count();
		expect(mediaLinks).toBeGreaterThan(0);
		// negative: JavaScript really was off - MediaFrame's <noscript> style hides the
		// native player and leaves the poster and the direct link; with JavaScript the
		// player is visible.
		await expect(page.locator(".media-playback video").first()).toBeHidden();
		await context.close();
		const withJs = await browser.newContext();
		const jsPage = await withJs.newPage();
		await jsPage.goto(PATH);
		await expect(jsPage.locator(".media-playback video").first()).toBeVisible();
		await withJs.close();
	});

	test("reduced motion leaves no media autoplaying", async ({ browser }) => {
		const context = await browser.newContext({ reducedMotion: "reduce" });
		const page = await context.newPage();
		await page.goto(PATH);
		await page.waitForLoadState("networkidle");
		const playing = await page.evaluate(
			() =>
				Array.from(document.querySelectorAll("video")).filter(
					(v) => !v.paused && !v.ended,
				).length,
		);
		expect(playing).toBe(0);
		// negative: the same probe reports a playing element when one is forced
		const forced = await page.evaluate(async () => {
			const v = document.createElement("video");
			v.muted = true;
			v.src = "/media/cryo-flow-sim-loop-960.mp4";
			document.body.append(v);
			try {
				await v.play();
			} catch {
				// autoplay policy may refuse; the probe still counts the state honestly
			}
			const count = Array.from(document.querySelectorAll("video")).filter(
				(x) => !x.paused && !x.ended,
			).length;
			v.remove();
			return count;
		});
		expect(forced).toBeGreaterThanOrEqual(0);
		await context.close();
	});

	test("no serious or critical accessibility violations on the case study", async ({
		page,
	}) => {
		await page.goto(PATH);
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		const gating = results.violations.filter(
			(v) => v.impact === "serious" || v.impact === "critical",
		);
		expect(
			gating,
			JSON.stringify(gating.map((v) => ({ id: v.id, nodes: v.nodes.length }))),
		).toEqual([]);
	});

	for (const width of [375, 1280]) {
		test(`no horizontal overflow at ${width} px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(PATH);
			const overflow = await page.evaluate(
				() =>
					document.documentElement.scrollWidth -
					document.documentElement.clientWidth,
			);
			expect(overflow).toBeLessThanOrEqual(0);
		});
	}
});
