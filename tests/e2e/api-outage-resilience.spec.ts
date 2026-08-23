import { expect, test } from "@playwright/test";

const outageRoutes = [
	{
		path: "/",
		heading:
			/Principal engineer for simulation, controls, and operational software/i,
		marker: /Selected work/i,
		link: { name: /View selected work/i, href: "/work/" },
	},
	{
		path: "/work/",
		heading: /Systems made legible through proof/i,
		marker: /Flagship work/i,
		link: {
			name: /CLI Fleet Synchronization/i,
			href: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		},
	},
	{
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization/i,
		marker: /Proof/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		marker: /Download résumé PDF/i,
		link: {
			name: /Download résumé PDF/i,
			href: "/downloads/joe-poznanski-resume.pdf",
		},
	},
	{
		path: "/notes/",
		heading: /Technical notes/i,
		marker: /Black-Scholes/i,
		link: {
			name: /A Black-Scholes options pricer in Rust, compiled to WASM/i,
			href: "/notes/wasm-black-scholes-options-pricer/",
		},
	},
	{
		path: "/contact/",
		heading: /Let’s talk about the system behind the problem/i,
		marker: /josephpoznanski@gmail\.com/i,
		link: {
			name: /Email Joe/i,
			href: "mailto:josephpoznanski@gmail.com",
		},
	},
];

const rawErrorText =
	/Failed to fetch|net::ERR|ECONNREFUSED|ENOTFOUND|sqlx::|stack trace|TypeError:|SyntaxError:|\/home\/[a-z0-9_-]+/i;
const resumeLaunchBoundaryText =
	/published resume|published PDF|public resume|public PDF|live resume|production resume/i;

test.describe("API outage resilience @api-down @B-056", () => {
	test("keeps representative static routes usable when API requests fail @static-runtime", async ({
		page,
	}) => {
		const apiRequests: string[] = [];
		page.on("request", (request) => {
			if (request.url().includes("/api/")) apiRequests.push(request.url());
		});
		await page.route("**/api/**", (route) => route.abort("failed"));

		for (const route of outageRoutes) {
			await test.step(route.path, async () => {
				const response = await page.goto(route.path);
				expect(response?.status(), route.path).toBeLessThan(400);

				await expect(page.getByRole("heading", { level: 1 })).toContainText(
					route.heading,
				);
				await expect(page.locator("main")).toContainText(route.marker);
				if (route.path === "/resume/") {
					await expect(page.locator("main")).not.toContainText(
						resumeLaunchBoundaryText,
					);
				}
				await expect(page.locator("body")).toHaveAttribute(
					"data-enhancement",
					"static-first",
				);
				const primaryNav = page.getByLabel("Primary navigation");
				await expect(
					primaryNav.getByRole("link", { name: "Work" }),
				).toHaveAttribute("href", "/work/");
				await expect(
					primaryNav.getByRole("link", { name: "Résumé" }),
				).toHaveAttribute("href", "/resume/");
				await expect(
					primaryNav.getByRole("link", { name: "Contact" }),
				).toHaveAttribute("href", "/contact/");
				if (route.link) {
					await expect(
						page.getByRole("link", { name: route.link.name }).first(),
					).toHaveAttribute("href", route.link.href);
				}
				await expect(page.locator("body")).not.toContainText(rawErrorText);
			});
		}

		expect(apiRequests).toEqual([]);
	});

	test("keeps contact independent from a failing backend", async ({ page }) => {
		let contactApiCalled = false;
		await page.route("**/api/contact", (route) => {
			contactApiCalled = true;
			return route.abort("failed");
		});

		await page.goto("/contact/");
		await expect(page.locator("form")).toHaveCount(0);
		await expect(
			page.getByRole("link", {
				name: "Email Joe",
				exact: true,
			}),
		).toHaveAttribute("href", "mailto:josephpoznanski@gmail.com");
		await expect(page.locator("body")).not.toContainText(rawErrorText);
		expect(contactApiCalled).toBe(false);
	});
});
