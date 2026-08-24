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
		slug: "xplane-cabin-camera-fov-trade-study",
		title: "X-Plane Cabin Camera FOV Trade Study",
		marker: /documented X-Plane replay compares four cabin camera views/i,
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

	const existingRatio = await figures
		.first()
		.locator("img")
		.evaluate((element) => {
			const box = element.getBoundingClientRect();
			return box.width / box.height;
		});
	expect(existingRatio).toBeGreaterThan(1.7);
	expect(existingRatio).toBeLessThan(1.8);
});

test("renders inspectable uncropped X-Plane evidence on mobile and desktop without private provenance", async ({
	page,
}) => {
	const imageSources = [
		"/media/xplane-fov/comparison-bank-120-1440.webp",
		"/media/xplane-fov/comparison-bank-180-1440.webp",
	] as const;
	const videoSources = [
		"/media/xplane-fov/fov50-p0-h0.mp4",
		"/media/xplane-fov/fov110-m5-h0.mp4",
	] as const;

	for (const viewport of [
		{ name: "mobile", width: 390, height: 844 },
		{ name: "desktop", width: 1440, height: 1000 },
	] as const) {
		await page.setViewportSize(viewport);
		await page.goto("/work/xplane-cabin-camera-fov-trade-study/");

		const originalImageLinks = page.locator("[data-evidence-original]");
		await expect(originalImageLinks).toHaveCount(2);
		for (const [index, src] of imageSources.entries()) {
			const link = originalImageLinks.nth(index);
			await expect(link).toBeVisible();
			await expect(link).toHaveText("Open the full-size evidence image");
			await expect(link).toHaveAttribute("href", src);
			await expect(link).toHaveAttribute("data-touch-target", "true");
			const box = await link.boundingBox();
			expect(box, `${viewport.name} original image link`).not.toBeNull();
			expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
			expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
		}

		const videoLinks = page.getByRole("link", {
			name: "Open the evidence video",
		});
		await expect(videoLinks).toHaveCount(2);
		for (const [index, src] of videoSources.entries()) {
			await expect(videoLinks.nth(index)).toHaveAttribute("href", src);
		}

		const comparisonImage = page
			.locator('[data-evidence-media-kind="image"] img')
			.first();
		const wideVideo = page
			.locator('[data-evidence-media-kind="video"] video')
			.first();
		await expect(comparisonImage).toBeVisible();
		await expect(wideVideo).toBeVisible();
		for (const media of [comparisonImage, wideVideo]) {
			await expect(media).toHaveCSS("object-fit", "contain");
		}
		const imageRatio = await comparisonImage.evaluate((element) => {
			const box = element.getBoundingClientRect();
			return box.width / box.height;
		});
		const videoRatio = await wideVideo.evaluate((element) => {
			const box = element.getBoundingClientRect();
			return box.width / box.height;
		});
		expect(imageRatio).toBeGreaterThan(1.75);
		expect(imageRatio).toBeLessThan(1.85);
		expect(videoRatio).toBeGreaterThan(3.5);
		expect(videoRatio).toBeLessThan(3.7);
		const horizontalOverflow = await page.evaluate(
			() => document.documentElement.scrollWidth - window.innerWidth,
		);
		expect(horizontalOverflow, viewport.name).toBeLessThanOrEqual(1);
	}

	await expect(page.locator("main")).toContainText(
		/replay harness source.*not supplied or independently rerun/i,
	);
	await expect(page.locator("main")).not.toContainText(
		/SNV|XPlaneRecordings|\bLM[5-8]\b/i,
	);
});
