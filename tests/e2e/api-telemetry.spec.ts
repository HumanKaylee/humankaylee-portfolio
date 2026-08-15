import { expect, test } from "@playwright/test";

test.describe("home API telemetry @api-telemetry", () => {
	test("enhances the static telemetry strip with API health and cached project metadata", async ({
		page,
	}) => {
		let healthCalled = false;
		let projectsCalled = false;

		await page.route("**/api/health", async (route) => {
			healthCalled = true;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					status: "ok",
					service: "humankaylee-portfolio-api",
					version: "telemetry-test",
					commit: "local-dev",
					uptime_seconds: 42,
				}),
			});
		});
		await page.route("**/api/projects/live", async (route) => {
			projectsCalled = true;
			await route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({
					cached_at: "2026-05-23T00:00:00Z",
					stale: false,
					projects: [
						{ key: "systems-atelier", title: "Systems Atelier" },
						{ key: "fleet-sync", title: "Fleet Sync" },
					],
				}),
			});
		});

		await page.goto("/");

		await expect(
			page.getByRole("heading", {
				name: /Evidence built into the delivery path/i,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("article", { name: /API live: 2 cached projects/i }),
		).toContainText("API live");
		await expect(page.getByRole("status")).toContainText("Rust API live");
		await expect(page.getByRole("status")).toContainText("2 cached projects");
		expect(healthCalled).toBe(true);
		expect(projectsCalled).toBe(true);
	});

	test("keeps static telemetry readable when the API is unavailable", async ({
		page,
	}) => {
		await page.route("**/api/health", (route) => route.abort("failed"));
		await page.route("**/api/projects/live", (route) => route.abort("failed"));

		await page.goto("/");

		await expect(
			page.getByRole("article", { name: /Resilience: Failure aware/i }),
		).toContainText("Failure aware");
		await expect(page.getByRole("status")).toContainText(
			"Core experience is fully available",
		);
	});
});

test.describe("home telemetry static shell @static-shell", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps the credibility panel readable without hydration", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(
			page.getByRole("heading", {
				name: /Evidence built into the delivery path/i,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("article", { name: /Rendering: Fast by default/i }),
		).toContainText("Build");
		await expect(
			page.getByRole("article", { name: /Resilience: Failure aware/i }),
		).toBeVisible();
		await expect(page.getByRole("status")).toContainText(
			"Core routes, accessibility, and verification evidence are available now",
		);
	});
});
