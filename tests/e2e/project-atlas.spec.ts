import { expect, test } from "@playwright/test";

const publishedAtlasCategories = ["creative web", "operations"];

test.describe("project atlas @atlas", () => {
	test("surfaces public audience and proof on every static project node", async ({
		page,
	}) => {
		await page.goto("/projects/");

		const atlasNode = page
			.locator("[data-atlas-node]")
			.filter({ hasText: /CLI Fleet Synchronization and MCP Rollout/i });
		await expect(atlasNode).toContainText(/Sanitized rollout matrix/i);
		await expect(
			atlasNode.getByRole("group", {
				name: "Best for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toContainText(/senior engineer/i);
		await expect(atlasNode).toHaveAttribute(
			"href",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);
	});

	test("renders accessible category filters and a complete static index", async ({
		page,
	}) => {
		await page.goto("/projects/");

		const filters = page.getByRole("navigation", {
			name: "Project atlas filters",
		});
		for (const category of publishedAtlasCategories) {
			await expect(
				filters.getByRole("link", { name: new RegExp(category, "i") }),
			).toHaveAttribute(
				"href",
				new RegExp(`#atlas-${category.replaceAll(" ", "-")}`),
			);
		}

		const atlas = page.getByRole("region", {
			name: "Four projects, two capability clusters.",
		});
		await expect(atlas).toBeVisible();
		await expect(atlas.locator("[data-atlas-node]")).toHaveCount(4);
		await expect(atlas).toContainText(
			/Four projects, two capability clusters/i,
		);
	});

	test("keeps atlas nodes keyboard reachable @keyboard", async ({ page }) => {
		await page.goto("/projects/");

		let focusedLabel = "";
		for (let index = 0; index < 24; index += 1) {
			await page.keyboard.press("Tab");
			focusedLabel = await page.evaluate(() => {
				const active = document.activeElement;
				return active?.getAttribute("aria-label") ?? active?.textContent ?? "";
			});
			if (/View project detail/i.test(focusedLabel)) break;
		}

		expect(focusedLabel).toMatch(/View project detail/i);
	});

	test("uses a desktop constellation as a direct-link visual index", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.goto("/projects/");

		const constellation = page.getByRole("region", {
			name: /Desktop project constellation/i,
		});
		await expect(constellation).toBeVisible();
		const clusters = constellation.locator("[data-constellation-cluster]");
		await expect(clusters).toHaveCount(2);
		const clusterLabels = (await clusters.allTextContents()).map((label) =>
			label.trim(),
		);
		expect(clusterLabels).toEqual(
			expect.arrayContaining(publishedAtlasCategories),
		);
		const nodes = constellation.locator("[data-constellation-node]");
		await expect(nodes).toHaveCount(4);
		await expect(nodes.first()).toHaveAttribute("href", /\/projects\/.+\/$/);
		await expect(page.locator("script[data-constellation-loader]")).toHaveCount(
			0,
		);
	});

	test("keeps the complete static index without JavaScript", async ({
		browser,
	}) => {
		const context = await browser.newContext({ javaScriptEnabled: false });
		const page = await context.newPage();
		try {
			await page.goto("http://127.0.0.1:4321/projects/");
			await expect(page.locator("[data-atlas-node]")).toHaveCount(4);
			await expect(
				page.getByRole("region", {
					name: "Four projects, two capability clusters.",
				}),
			).toBeVisible();
		} finally {
			await context.close();
		}
	});

	test("keeps mobile on the compact index without enhancement copy", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.goto("/projects/");

		await expect(page.locator("[data-project-constellation]")).toBeHidden();
		await expect(page.locator("[data-atlas-node]")).toHaveCount(4);
		await expect(page.locator("main")).not.toContainText(
			/Progressive enhancement/i,
		);
	});
});

test.describe("project atlas @reduced-motion", () => {
	test("keeps the static atlas readable with motion suppressed", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/projects/");

		await expect(page.locator("[data-atlas-node]")).toHaveCount(4);
		const duration = await page
			.locator("[data-atlas-node]")
			.first()
			.evaluate((node) => getComputedStyle(node).transitionDuration);
		const durationMs = duration.endsWith("ms")
			? Number.parseFloat(duration)
			: Number.parseFloat(duration) * 1000;
		expect(durationMs).toBeLessThanOrEqual(0.001);
	});
});
