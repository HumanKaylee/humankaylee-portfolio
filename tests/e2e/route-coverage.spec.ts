import { expect, test } from "@playwright/test";

const implementedRoutes = [
	{
		path: "/",
		heading: /systems atelier/i,
		marker: /practical AI-assisted systems/i,
	},
	{
		path: "/projects/",
		heading: /project atlas/i,
		marker: /CLI Fleet Synchronization/i,
	},
	{
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization and MCP Rollout/i,
		marker: /sanitized rollout matrix/i,
	},
	{
		path: "/resume/",
		heading: /resume/i,
		marker: /Download resume PDF/i,
	},
	{
		path: "/notes/",
		heading: /notes from the systems atelier/i,
		marker: /build decisions/i,
	},
	{
		path: "/contact/",
		heading: /contact route/i,
		marker: /mailto fallback/i,
	},
];

test.describe("route coverage @quality", () => {
	for (const route of implementedRoutes) {
		test(`renders the implemented route contract for ${route.path}`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);

			expect(response?.status(), route.path).toBeLessThan(400);
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				route.heading,
			);
			await expect(page.locator("main")).toContainText(route.marker);
			await expect(page.locator("body")).toHaveAttribute(
				"data-enhancement",
				"static-first",
			);
		});
	}

	test("encodes the current project-detail blocker instead of claiming detail coverage", async ({
		page,
		request,
	}) => {
		const deferredProjectDetail =
			"/projects/cli-fleet-synchronization-and-mcp-rollout/";

		const response = await request.get(deferredProjectDetail);
		expect(response.status(), deferredProjectDetail).toBe(404);

		await page.goto("/projects/");
		await expect(
			page.getByRole("link", {
				name: "View static proof for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toHaveAttribute(
			"href",
			"/projects/#cli-fleet-synchronization-and-mcp-rollout",
		);
	});
});
