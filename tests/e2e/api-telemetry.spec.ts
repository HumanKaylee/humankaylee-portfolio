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
			page.getByText("Static evidence until API integration"),
		).toBeVisible();
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

		await expect(page.getByRole("article", { name: /Backend/i })).toContainText(
			"Rust-ready",
		);
		await expect(page.getByRole("status")).toContainText(
			"API telemetry unavailable",
		);
		await expect(
			page.getByText("Static evidence until API integration"),
		).toBeVisible();
	});
});
