import { expect, test } from "@playwright/test";

const atlasCategories = [
	"AI",
	"automation",
	"infrastructure",
	"backend",
	"creative web",
	"operations",
];

test.describe("project atlas @atlas", () => {
	test("surfaces public best-for audience chips on cards and atlas artifacts", async ({
		page,
	}) => {
		await page.goto("/projects/");

		const projectCard = page.locator(
			"article.project-card#cli-fleet-synchronization-and-mcp-rollout",
		);
		await expect(
			projectCard.getByRole("group", {
				name: "Best for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toContainText(/senior engineer/i);
		await expect(
			projectCard.getByRole("group", {
				name: "Best for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toContainText(/collaborator/i);

		const atlasNode = page
			.getByRole("link", {
				name: /Open case study for CLI Fleet Synchronization and MCP Rollout/i,
			})
			.filter({ hasText: /Sanitized rollout matrix/i });
		await expect(
			atlasNode.getByRole("group", {
				name: "Best for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toContainText(/senior engineer/i);

		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.goto("/projects/");

		const artifact = page.locator(
			"#constellation-artifact-humankaylee-portfolio-build",
		);
		const artifactAudience = artifact.getByRole("group", {
			name: "Best for HumanKaylee Portfolio Build",
		});
		for (const audience of ["recruiter", "senior engineer", "collaborator"]) {
			await expect(artifactAudience).toContainText(new RegExp(audience, "i"));
		}
	});

	test("renders accessible category filters and static atlas nodes", async ({
		page,
	}) => {
		await page.goto("/projects/");

		const filters = page.getByRole("navigation", {
			name: "Project atlas filters",
		});
		for (const category of atlasCategories) {
			await expect(
				filters.getByRole("link", { name: new RegExp(category, "i") }),
			).toHaveAttribute(
				"href",
				new RegExp(`#atlas-${category.replaceAll(" ", "-")}`),
			);
		}

		const atlas = page.getByRole("region", {
			name: "Accessible project atlas",
		});
		await expect(atlas).toBeVisible();

		const node = atlas.getByRole("link", {
			name: /Open case study for CLI Fleet Synchronization and MCP Rollout/i,
		});
		await expect(node).toHaveAttribute(
			"href",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		);
		await expect(node).toHaveAttribute("data-atlas-node", "true");
		await expect(atlas.getByText(/4 published nodes/i)).toBeVisible();
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
			if (/Open case study/i.test(focusedLabel)) {
				break;
			}
		}

		expect(focusedLabel).toMatch(/Open case study/i);
	});

	test("adds a lazy desktop constellation without replacing the static atlas @constellation", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.goto("/projects/");

		const constellation = page.getByRole("region", {
			name: /Desktop project constellation/i,
		});
		await expect(constellation).toBeVisible();

		for (const category of atlasCategories) {
			await expect(
				constellation.locator(`[data-constellation-cluster="${category}"]`),
			).toBeVisible();
		}

		const nodes = constellation.locator("[data-constellation-node]");
		await expect(nodes).toHaveCount(4);
		await expect(
			constellation.getByText(/Constellation focus helper is lazy-loaded/i),
		).toBeVisible();
		await expect(
			page.locator('script[data-constellation-loader="idle-module"]'),
		).toHaveAttribute("type", "module");

		const firstNode = constellation.getByRole("link", {
			name: /Focus constellation artifact for CLI Fleet Synchronization/i,
		});
		await expect(firstNode).toHaveAttribute(
			"href",
			"#constellation-artifact-cli-fleet-synchronization-and-mcp-rollout",
		);

		await page.waitForFunction(() => document.body.dataset.constellationReady);
		await firstNode.click();

		const artifact = page.locator(
			"#constellation-artifact-cli-fleet-synchronization-and-mcp-rollout",
		);
		await expect(artifact).toBeFocused();
		await expect(artifact).toContainText(
			"CLI Fleet Synchronization and MCP Rollout",
		);
		await expect(
			artifact.getByRole("link", { name: /Open constellation case study/i }),
		).toHaveAttribute(
			"href",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		);
	});

	test("keeps the static atlas usable if the desktop constellation module fails @constellation", async ({
		page,
	}) => {
		const pageErrors: string[] = [];
		page.on("pageerror", (error) => pageErrors.push(error.message));
		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.route("**/scripts/project-constellation.mjs", (route) =>
			route.abort("failed"),
		);

		await page.goto("/projects/");

		await expect(
			page.getByRole("region", { name: "Accessible project atlas" }),
		).toBeVisible();
		await expect(page.locator("[data-project-constellation]")).toBeVisible();
		await expect
			.poll(
				() => page.evaluate(() => document.body.dataset.constellationReady),
				{ timeout: 2000 },
			)
			.toBe("module-error");
		expect(pageErrors).toEqual([]);
	});

	test("keeps mobile users on the static atlas instead of the desktop constellation @constellation", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 900 });
		await page.goto("/projects/");

		await expect(
			page.getByRole("region", { name: "Accessible project atlas" }),
		).toBeVisible();
		await expect(page.locator("[data-project-constellation]")).toBeHidden();
		await page.waitForFunction(
			() => document.body.dataset.constellationReady === "mobile-skipped",
		);
	});
});

test.describe("project atlas @reduced-motion", () => {
	test("shows a poster fallback instead of motion-dependent atlas copy", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/projects/");

		await expect(
			page.getByText(/Reduced-motion poster fallback/i),
		).toBeVisible();
		await expect(
			page.getByText(/Motion enhancement waits for user-capable contexts/i),
		).toBeHidden();
	});
});
