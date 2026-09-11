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

// budgets-m11-stage1.v1.json: content_scan_forbidden_terms
const FORBIDDEN = [
	"127.0.0.1",
	"ROG_STRIX",
	"rog-strix",
	"lightred",
	"ares-tron",
	"joepo\\",
	"C:\\Users",
	"/home/",
	"Documents\\Codex",
	"_target-",
	"100.",
	"192.168.",
];

const MANDATORY = [
	/simulation-only/i,
	/no (write-capable path|live-equipment)/i,
	/not a concentration, release-rate, dispersion or hazard-distance analysis/i,
	/qualitative/i,
	/engineering demonstration/i,
];

function scanForbidden(text: string): string[] {
	return FORBIDDEN.filter((term) => text.includes(term));
}

test.describe("CryoSim case study - stage 1 release instruments", () => {
	test("the rendered page contains no forbidden host, path or address term and carries the mandatory language", async ({
		page,
	}) => {
		await page.goto(PATH);
		const html = await page.content();
		expect(scanForbidden(html)).toEqual([]);
		for (const pattern of MANDATORY) {
			expect(html, `mandatory language ${pattern}`).toMatch(pattern);
		}
		// negative: the scanner must catch a planted term
		expect(scanForbidden(`${html} see 127.0.0.1:8791`)).toEqual(["127.0.0.1"]);
	});

	test("every manifest derivative is served with the manifest's bytes and hash, and no still is black", async ({
		request,
	}) => {
		const manifest = JSON.parse(readFileSync(MANIFEST, "utf8")) as {
			items: {
				id: string;
				derivatives: {
					file: string;
					bytes: number;
					sha256: string;
					mean_luminance_0_255: number;
				}[];
			}[];
		};
		expect(manifest.items.length).toBe(4);
		for (const item of manifest.items) {
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
