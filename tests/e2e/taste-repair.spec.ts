import { expect, test } from "@playwright/test";

const publicRoutes = [
	"/",
	"/projects/",
	"/now/",
	"/uses/",
	"/reading/",
	"/resume/",
	"/contact/",
] as const;

test.describe("live taste repair @taste-repair", () => {
	test("keeps dense content cards subordinate to page-level display type", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1100 });
		await page.goto("/now/");

		const firstCard = page.locator(".now-focus-card").first();
		await expect(firstCard).toBeVisible();
		const titleSize = await firstCard
			.locator("h2")
			.evaluate((heading) =>
				Number.parseFloat(getComputedStyle(heading).fontSize),
			);
		expect(titleSize).toBeLessThanOrEqual(38);
	});

	test("keeps the projects route atlas-led without a duplicate project-card grid", async ({
		page,
	}) => {
		await page.goto("/projects/");

		await expect(
			page.locator("main > .page-shell > .artifact-grid"),
		).toHaveCount(0);
		await expect(
			page.locator("[data-atlas-node]").filter({
				has: page.getByRole("group", {
					name: "Best for CLI Fleet Synchronization and MCP Rollout",
				}),
			}),
		).toHaveAttribute(
			"href",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);
	});

	test("styles reading resources as text links instead of project CTA pills", async ({
		page,
	}) => {
		await page.goto("/reading/");

		const link = page.getByRole("link", { name: "Crafting Interpreters" });
		await expect(link).toBeVisible();
		await expect(link).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
		await expect(link).toHaveCSS("text-decoration-line", "underline");
	});

	test("frames contact around the visitor action while keeping email fallback visible", async ({
		page,
	}) => {
		await page.goto("/contact/");

		await expect(
			page.getByRole("heading", { level: 1, name: "Contact Joe." }),
		).toBeVisible();
		await expect(page.getByText("API-enhanced fallback")).toHaveCount(0);
		await expect(page.getByRole("status")).toContainText(
			"Nothing is sent or stored by this site",
		);
	});

	test("keeps current pages current and removes em-dash typography from public tabs", async ({
		page,
	}) => {
		await page.goto("/now/");
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"August 2026",
		);
		await expect(page.locator("main")).not.toContainText("May 2026");

		await page.goto("/uses/");
		await expect(page.locator("main")).toContainText(
			"Last reviewed: 2026-08-15",
		);

		for (const route of publicRoutes) {
			await page.goto(route);
			const text = await page.locator("main").innerText();
			expect(text, `${route} should not contain em or en dashes`).not.toMatch(
				/[—–]/,
			);
		}
	});
});
