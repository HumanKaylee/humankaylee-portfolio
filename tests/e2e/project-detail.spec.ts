import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const workDetails = [
	{
		slug: "cryo-flow-sim",
		title: "Cryogenic Flow Simulation",
		marker: /deterministic simulation of cryogenic valve transients/i,
	},
	{
		slug: "cli-fleet-synchronization-and-mcp-rollout",
		title: "CLI Fleet Synchronization",
		marker: /cross-machine CLI rollout standardized local tool behavior/i,
	},
	{
		slug: "remote-workstation-recovery-and-operational-debugging",
		title: "Remote Workstation Recovery",
		marker: /practical recovery workflow for a remote workstation/i,
	},
	{
		slug: "black-scholes-wasm",
		title: "Black-Scholes Options Pricer in Rust and WASM",
		marker: /Rust crate compiled to WebAssembly powers a live/i,
	},
] as const;

test("keeps responsive primary posters driven by Work record data", () => {
	const mediaFrameSource = readFileSync(
		"apps/web/src/components/MediaFrame.astro",
		"utf8",
	);

	expect(mediaFrameSource).toContain("media.responsivePosterSources");
	expect(mediaFrameSource).not.toMatch(/cryo-flow-sim-stage1-\d+\.webp/);
});

test.describe("Work detail routes @work @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const work of workDetails) {
		test(`renders the static-first Work detail page for ${work.slug}`, async ({
			page,
		}) => {
			const response = await page.goto(`/work/${work.slug}/`);

			expect(response?.status(), work.slug).toBe(200);
			await expect(
				page.getByRole("heading", { level: 1, name: work.title }),
			).toBeVisible();
			await expect(page.getByText(work.marker).first()).toBeVisible();
			await expect(page.getByRole("heading", { name: "Proof" })).toBeVisible();
			await expect(
				page.locator(".proof-boundary dt").filter({ hasText: "Known limits" }),
			).toBeVisible();
			await expect(
				page.getByRole("link", { name: /Next project:/i }),
			).toHaveAttribute("href", /^\/work\/.+\/$/);
			await expect(page.locator("body")).toHaveAttribute(
				"data-enhancement",
				"static-first",
			);
			await expect(page.locator("[data-case-study-media-gallery]")).toHaveCount(
				0,
			);
		});
	}
});
