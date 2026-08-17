import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

const workDetails = [
	{
		slug: "cryo-flow-sim",
		title: "Cryogenic Flow Simulation",
		marker: /deterministic simulation of cryogenic valve transients/i,
		galleryItems: 0,
	},
	{
		slug: "conformal-cooling-channel-generation",
		title: "Conformal Cooling Channel Generation",
		marker:
			/engineering prototype that converts injection-mold cavity geometry/i,
		galleryItems: 4,
	},
	{
		slug: "cli-fleet-synchronization-and-mcp-rollout",
		title: "CLI Fleet Synchronization",
		marker: /cross-machine CLI rollout standardized local tool behavior/i,
		galleryItems: 0,
	},
	{
		slug: "remote-workstation-recovery-and-operational-debugging",
		title: "Remote Workstation Recovery",
		marker: /practical recovery workflow for a remote workstation/i,
		galleryItems: 0,
	},
	{
		slug: "black-scholes-wasm",
		title: "Black-Scholes Options Pricer in Rust and WASM",
		marker: /Rust crate compiled to WebAssembly powers a live/i,
		galleryItems: 0,
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
			await expect(
				page.getByRole("heading", { name: "Proof", exact: true }),
			).toBeVisible();
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
			const gallery = page.locator("[data-case-study-media-gallery]");
			await expect(gallery).toHaveCount(work.galleryItems > 0 ? 1 : 0);
			await expect(gallery.locator("figure")).toHaveCount(work.galleryItems);
		});
	}
});

test("renders the Conformal workflow and ordered responsive evidence gallery", async ({
	page,
}) => {
	await page.goto("/work/conformal-cooling-channel-generation/");

	const article = page.locator("article.work-detail");
	await expect(article.locator("figure")).toHaveCount(5);
	const workflow = page.locator(
		'.work-detail__media [data-media-kind="video"]',
	);
	await expect(workflow.locator("video")).toHaveAttribute("controls", "");
	await expect(workflow.locator("video")).toHaveAttribute("preload", "none");
	await expect(workflow.locator("source")).toHaveAttribute(
		"src",
		"/media/conformal-cooling/conformal-workflow.mp4",
	);

	const figures = page.locator("[data-case-study-media-gallery] figure");
	await expect(figures).toHaveCount(4);
	for (const figure of await figures.all()) {
		const image = figure.locator("img");
		await expect(image).toHaveAttribute("alt", /.+/);
		await expect(image).toHaveAttribute("width", "1440");
		await expect(image).toHaveAttribute("height", "810");
		await expect(image).toHaveAttribute("loading", "lazy");
		await expect(figure.locator("source")).toHaveAttribute(
			"srcset",
			/640w, .*960w, .*1440w/,
		);
		await expect(figure.locator("figcaption")).not.toBeEmpty();
	}

	await expect(page.locator("main")).toContainText(/alpha|prototype/i);
	await expect(page.locator("main")).toContainText(/UI\/API exports/i);
	await expect(page.locator("main")).not.toContainText(
		/20-50%|production-qualified|guaranteed|optimized cooling/i,
	);
});
