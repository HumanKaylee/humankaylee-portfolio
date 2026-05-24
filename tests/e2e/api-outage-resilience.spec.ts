import { expect, test } from "@playwright/test";

const outageRoutes = [
	{
		path: "/",
		heading: /systems atelier/i,
		marker: /practical AI-assisted systems/i,
		link: { name: /for recruiters/i, href: "/resume/" },
	},
	{
		path: "/projects/",
		heading: /project atlas/i,
		marker: /CLI Fleet Synchronization/i,
		link: {
			name: /View project detail for CLI Fleet Synchronization/i,
			href: "/projects/cli-fleet-synchronization-and-mcp-rollout/",
		},
	},
	{
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization and MCP Rollout/i,
		marker: /sanitized rollout matrix/i,
	},
	{
		path: "/resume/",
		heading: /resume/i,
		marker: /approved local source/i,
		link: {
			name: /Download resume PDF/i,
			href: "/downloads/humankaylee-resume.pdf",
		},
	},
	{
		path: "/notes/",
		heading: /notes from the systems atelier/i,
		marker: /build decisions/i,
		link: {
			name: /Why the portfolio content starts as data/i,
			href: "/notes/why-the-portfolio-content-starts-as-data-not-pages/",
		},
	},
	{
		path: "/contact/",
		heading: /contact route/i,
		marker: /mailto fallback/i,
		link: {
			name: /contact-pending@humankaylee\.example/i,
			href: "mailto:contact-pending@humankaylee.example",
		},
	},
];

const rawErrorText =
	/Failed to fetch|net::ERR|ECONNREFUSED|ENOTFOUND|sqlx::|stack trace|TypeError:|SyntaxError:|\/home\/[a-z0-9_-]+/i;
const resumeLaunchBoundaryText =
	/published resume|published PDF|public resume|public PDF|live resume|production resume/i;

async function fillContactForm(page: import("@playwright/test").Page) {
	await page.getByLabel("Your name").fill("Public Reviewer");
	await page.getByLabel("Email address").fill("reviewer@example.com");
	await page
		.getByLabel("Message")
		.fill("I would like to discuss the portfolio systems work.");
}

test.describe("API outage resilience @api-down @B-056", () => {
	test("keeps representative static routes usable when API requests fail", async ({
		page,
	}) => {
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
					primaryNav.getByRole("link", { name: "Projects" }),
				).toHaveAttribute("href", "/projects/");
				await expect(
					primaryNav.getByRole("link", { name: "Resume" }),
				).toHaveAttribute("href", "/resume/");
				await expect(
					primaryNav.getByRole("link", { name: "Contact" }),
				).toHaveAttribute("href", "/contact/");
				if (route.link) {
					await expect(
						page.getByRole("link", { name: route.link.name }),
					).toHaveAttribute("href", route.link.href);
				}
				await expect(page.locator("body")).not.toContainText(rawErrorText);
			});
		}
	});

	test("sanitizes backend outage responses while keeping contact fallback actionable", async ({
		page,
	}) => {
		await page.route("**/api/contact", async (route) => {
			await route.fulfill({
				status: 503,
				contentType: "application/json",
				body: JSON.stringify({
					error: {
						code: "database_unavailable",
						message:
							"sqlx::Error: store unavailable at /srv/internal/contact-store.jsonl\nstack trace: contact_delivery.rs:42",
					},
				}),
			});
		});

		await page.goto("/contact/");
		await fillContactForm(page);
		await page.getByRole("button", { name: "Send message" }).click();

		await expect(page.getByRole("status")).toContainText(/api unavailable/i);
		await expect(page.getByLabel("Message")).toHaveValue(
			"I would like to discuss the portfolio systems work.",
		);
		await expect(
			page.getByRole("link", {
				name: /contact-pending@humankaylee\.example/i,
			}),
		).toHaveAttribute("href", "mailto:contact-pending@humankaylee.example");
		await expect(page.locator("body")).not.toContainText(rawErrorText);
	});
});
