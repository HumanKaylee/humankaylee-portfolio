import { expect, test } from "@playwright/test";

const implementedRoutes = [
	{
		path: "/",
		heading: /Systems built to hold up/i,
		marker: /practical AI-assisted systems/i,
	},
	{
		path: "/projects/",
		heading: /project atlas/i,
		marker: /CLI Fleet Synchronization/i,
	},
	{
		path: "/projects/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization and MCP Rollout/i,
		marker: /sanitized rollout matrix/i,
	},
	{
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization and MCP Rollout/i,
		marker: /sanitized rollout matrix/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		marker: /Download full resume \(PDF\)/i,
	},
	{
		path: "/notes/",
		heading: /notes from the systems atelier/i,
		marker: /build decisions/i,
	},
	{
		path: "/contact/",
		heading: /contact joe/i,
		marker: /fastest route is direct email/i,
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

	test("links the project index to the implemented project detail route", async ({
		page,
		request,
	}) => {
		const projectDetail =
			"/projects/cli-fleet-synchronization-and-mcp-rollout/";

		const response = await request.get(projectDetail);
		expect(response.status(), projectDetail).toBeLessThan(400);

		await page.goto("/projects/");
		await expect(
			page
				.getByRole("link", {
					name: "View project detail for CLI Fleet Synchronization and MCP Rollout",
				})
				.first(),
		).toHaveAttribute("href", projectDetail);
	});
});
