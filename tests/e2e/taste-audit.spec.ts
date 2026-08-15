import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { type Page, expect, test } from "@playwright/test";

const captureDir = process.env.TASTE_AUDIT_CAPTURE_DIR;

function requireCaptureDir() {
	if (!captureDir) {
		throw new Error("TASTE_AUDIT_CAPTURE_DIR must be set to capture evidence.");
	}

	return captureDir;
}

const surfaces = [
	{ label: "home", path: "/" },
	{ label: "work", path: "/work/" },
	{ label: "work-cryo", path: "/work/cryo-flow-sim/" },
	{
		label: "work-cli-fleet",
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		label: "work-remote-recovery",
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
	},
	{ label: "work-black-scholes", path: "/work/black-scholes-wasm/" },
	{ label: "about", path: "/about/" },
	{ label: "resume", path: "/resume/" },
	{ label: "contact", path: "/contact/" },
	{ label: "notes", path: "/notes/" },
] as const;

const viewports = [
	{ label: "desktop", size: { width: 1440, height: 1200 } },
	{ label: "mobile", size: { width: 390, height: 844 } },
] as const;

async function waitForStableMedia(page: Page) {
	await page.locator(".media-frame img").evaluateAll(async (elements) => {
		for (const element of elements) {
			const image = element as HTMLImageElement;
			if (!image.complete || image.naturalWidth === 0) {
				await new Promise<void>((resolve, reject) => {
					image.addEventListener("load", () => resolve(), { once: true });
					image.addEventListener(
						"error",
						() => reject(new Error("media image failed to load")),
						{ once: true },
					);
				});
			}
			await image.decode();
		}
	});
	await page
		.locator(".media-frame video[poster]")
		.evaluateAll(async (elements) => {
			for (const element of elements) {
				const video = element as HTMLVideoElement;
				const poster = new Image();
				poster.src = video.poster;
				if (!poster.complete || poster.naturalWidth === 0) {
					await new Promise<void>((resolve, reject) => {
						poster.addEventListener("load", () => resolve(), { once: true });
						poster.addEventListener(
							"error",
							() => reject(new Error("video poster failed to load")),
							{ once: true },
						);
					});
				}
				await poster.decode();

				if (video.readyState < HTMLMediaElement.HAVE_METADATA) {
					await new Promise<void>((resolve, reject) => {
						video.addEventListener("loadedmetadata", () => resolve(), {
							once: true,
						});
						video.addEventListener(
							"error",
							() => reject(new Error("video metadata failed to load")),
							{ once: true },
						);
						video.preload = "metadata";
						video.load();
					});
				}
			}
		});
	await page.evaluate(
		() =>
			new Promise<void>((resolve) =>
				requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
			),
	);
}

test("keeps the homepage hierarchy compact at desktop and mobile @taste-audit", async ({
	page,
}) => {
	await page.setViewportSize({ width: 1440, height: 1200 });
	await page.goto("/", { waitUntil: "networkidle" });

	const desktopMetrics = await page
		.locator("#hero-title")
		.evaluate((heading) => {
			const styles = getComputedStyle(heading);
			return {
				height: heading.getBoundingClientRect().height,
				lineHeight: Number.parseFloat(styles.lineHeight),
			};
		});
	expect(desktopMetrics.height / desktopMetrics.lineHeight).toBeLessThanOrEqual(
		4.1,
	);
	await expect(
		page.getByRole("link", { name: /View selected work/i }),
	).toBeVisible();
	await expect(page.locator(".project-stage")).toBeVisible();

	await page.setViewportSize({ width: 390, height: 844 });
	await page.reload({ waitUntil: "networkidle" });
	const navRows = await page
		.getByLabel("Primary navigation")
		.locator("a")
		.evaluateAll(
			(links) =>
				new Set(
					links.map((link) => Math.round(link.getBoundingClientRect().top)),
				).size,
		);
	expect(navRows).toBeLessThanOrEqual(2);
	await expect(page.locator("#hero-title")).toBeVisible();
});

test.describe("Signal / Proof capture audit @taste-audit", () => {
	test.skip(
		!captureDir,
		"Set TASTE_AUDIT_CAPTURE_DIR to capture local evidence.",
	);

	for (const viewport of viewports) {
		for (const surface of surfaces) {
			test(`captures ${surface.label} at ${viewport.label}`, async ({
				page,
			}) => {
				const outputDir = requireCaptureDir();
				mkdirSync(outputDir, { recursive: true });
				await page.setViewportSize(viewport.size);
				const response = await page.goto(surface.path, {
					waitUntil: "networkidle",
				});

				expect(response?.status()).toBe(200);
				await expect(page.locator("main")).toBeVisible();
				await waitForStableMedia(page);
				if (surface.path === "/" && viewport.label === "mobile") {
					expect(
						await page.locator("[data-stage-pair]").evaluateAll((pairs) =>
							pairs.map((pair) => {
								const trigger = pair.querySelector<HTMLElement>(
									"[data-stage-trigger]",
								);
								const panel =
									pair.querySelector<HTMLElement>("[data-stage-panel]");
								return `${trigger?.dataset.stageTrigger}:${panel?.dataset.stagePanel}:${pair.children[1] === panel}`;
							}),
						),
					).toEqual([
						"cryo-flow-sim:cryo-flow-sim:true",
						"cli-fleet-synchronization-and-mcp-rollout:cli-fleet-synchronization-and-mcp-rollout:true",
						"remote-workstation-recovery-and-operational-debugging:remote-workstation-recovery-and-operational-debugging:true",
					]);
				}
				if (surface.path === "/work/black-scholes-wasm/") {
					await page.locator(".bs-demo").scrollIntoViewIfNeeded();
					await expect(page.locator("#bs-controls")).not.toHaveAttribute(
						"aria-hidden",
						"true",
					);
					await expect(page.locator("#bs-price")).not.toHaveText("—");
				}
				await page.screenshot({
					fullPage: true,
					path: join(outputDir, `${surface.label}-${viewport.label}.png`),
				});
			});
		}
	}
});
