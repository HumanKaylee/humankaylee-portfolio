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

	test("keeps atlas nodes keyboard reachable", async ({ page }) => {
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
