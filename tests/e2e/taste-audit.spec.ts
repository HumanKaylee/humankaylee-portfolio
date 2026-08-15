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
	{ label: "about", path: "/about/" },
	{ label: "resume", path: "/resume/" },
	{ label: "contact", path: "/contact/" },
	{ label: "notes", path: "/notes/" },
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
				await page.screenshot({
					fullPage: true,
					path: join(outputDir, `${surface.label}-${viewport.label}.png`),
				});
			});
		}
	}
});
