import { expect, test } from "@playwright/test";

const implementedRoutes = [
	{
		path: "/",
		heading: /Principal engineer for systems that cannot drift/i,
		marker: /Selected work/i,
	},
	{
		path: "/work/",
		heading: /Systems made legible through proof/i,
		marker: /Flagship work/i,
	},
	{
		path: "/work/cryo-flow-sim/",
		heading: /Cryogenic Flow Simulation/i,
		marker: /Proof/i,
	},
	{
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization/i,
		marker: /Proof/i,
	},
	{
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
		heading: /Remote Workstation Recovery/i,
		marker: /Proof/i,
	},
	{
		path: "/about/",
		heading: /Engineering judgment for systems that have to hold up/i,
		marker: /How I work/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		marker: /Download résumé PDF/i,
	},
	{
		path: "/notes/",
		heading: /Technical notes/i,
		marker: /Black-Scholes/i,
	},
	{
		path: "/contact/",
		heading: /Let’s talk about the system behind the problem/i,
		marker: /josephpoznanski@gmail\.com/i,
	},
];

test.describe("Signal / Proof route coverage @quality", () => {
	for (const route of implementedRoutes) {
		test(`renders the implemented route contract for ${route.path}`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);

			expect(response?.status(), route.path).toBe(200);
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

	test("links the Work index to the canonical flagship detail", async ({
		page,
		request,
	}) => {
		const workDetail = "/work/cli-fleet-synchronization-and-mcp-rollout/";

		const response = await request.get(workDetail);
		expect(response.status(), workDetail).toBe(200);

		await page.goto("/work/");
		await expect(
			page.getByRole("link", { name: /CLI Fleet Synchronization/i }).first(),
		).toHaveAttribute("href", workDetail);
	});

	for (const retiredPath of [
		"/projects/",
		"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		"/work/remote-workstation-recovery/",
		"/work/cli-fleet-synchronization/",
	]) {
		test(`does not revive the retired route ${retiredPath}`, async ({
			request,
		}) => {
			const response = await request.get(retiredPath);
			expect(response.status(), retiredPath).toBe(404);
		});
	}
});
