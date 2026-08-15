import { mkdirSync } from "node:fs";
import { join } from "node:path";

import { expect, test } from "@playwright/test";

const captureDir = process.env.TASTE_AUDIT_CAPTURE_DIR;

function requireCaptureDir() {
	if (!captureDir) {
		throw new Error("TASTE_AUDIT_CAPTURE_DIR must be set to capture evidence.");
	}

	return captureDir;
}

const surfaces = [
	{ label: "home", path: "/" },
	{ label: "projects", path: "/projects/" },
	{ label: "resume", path: "/resume/" },
	{ label: "contact", path: "/contact/" },
	{ label: "now", path: "/now/" },
	{ label: "uses", path: "/uses/" },
	{ label: "reading", path: "/reading/" },
	{
		label: "project-detail",
		path: "/projects/cli-fleet-synchronization-and-mcp-rollout/",
	},
] as const;

const viewports = [
	{ label: "desktop", size: { width: 1440, height: 1200 } },
	{ label: "mobile", size: { width: 390, height: 844 } },
] as const;

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
		3.1,
	);
	await expect(
		page.getByRole("navigation", { name: "Primary calls to action" }),
	).toBeVisible();

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
});

test.describe("taste-audit @taste-audit", () => {
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

				expect(response?.status()).toBeLessThan(400);
				await expect(page.locator("main")).toBeVisible();
				await page.screenshot({
					fullPage: true,
					path: join(outputDir, `${surface.label}-${viewport.label}.png`),
				});
			});
		}
	}
});
