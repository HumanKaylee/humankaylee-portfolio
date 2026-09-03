import { expect, test } from "@playwright/test";

const implementedRoutes = [
	{
		path: "/",
		heading:
			/Principal engineer for simulation, controls, and operational software/i,
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
		path: "/work/conformal-cooling-channel-generation/",
		heading: /Conformal Cooling Channel Generation/i,
		marker: /Evidence boundary/i,
	},
	{
		path: "/work/xplane-cabin-camera-fov-trade-study/",
		heading: /X-Plane Cabin Camera FOV Trade Study/i,
		marker: /Two documented camera configurations/i,
	},
	{
		path: "/work/mac-mini-shelf/",
		heading: /Mac mini Wall Shelf/i,
		marker: /Agentic engineering loop/i,
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
	{
		path: "/privacy/",
		heading: /What this site and the personal Google tool process/i,
		marker: /Cloudflare Web Analytics/i,
	},
	{
		path: "/terms/",
		heading: /Short terms for a personal site/i,
		marker: /Provided as-is/i,
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

	test("@legal exposes both policies through the footer and sitemap", async ({
		page,
		request,
	}) => {
		await page.goto("/");
		const footer = page.locator("footer");

		await expect(footer.getByRole("link", { name: "Privacy" })).toHaveAttribute(
			"href",
			"/privacy/",
		);
		await expect(footer.getByRole("link", { name: "Terms" })).toHaveAttribute(
			"href",
			"/terms/",
		);

		const sitemapResponse = await request.get("/sitemap-index.xml");
		expect(sitemapResponse.status()).toBe(200);
		const sitemap = await sitemapResponse.text();

		for (const url of [
			"https://joepoznanski.io/privacy/",
			"https://joepoznanski.io/terms/",
		]) {
			expect(sitemap.split(url)).toHaveLength(2);
		}
	});

	test("@legal renders the approved Privacy disclosures without contradicted claims", async ({
		page,
	}) => {
		await page.goto("/privacy/");
		const main = page.locator("main");

		await expect(main).toContainText("Cloudflare Web Analytics");
		await expect(main).toContainText("compose and send messages");
		await expect(main).not.toContainText(
			/collects nothing|cannot send mail|readable only by his own account/i,
		);
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
