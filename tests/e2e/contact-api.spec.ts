import { expect, test } from "@playwright/test";

import { profile } from "../../apps/web/src/data/profile";

test.describe("static direct contact @contact", () => {
	test("is complete without a form, script, or contact API request", async ({
		page,
	}) => {
		const apiRequests: string[] = [];
		page.on("request", (request) => {
			if (request.url().includes("/api/contact")) {
				apiRequests.push(request.url());
			}
		});

		await page.goto("/contact/");

		await expect(page.locator("main form")).toHaveCount(0);
		await expect(page.locator("main script")).toHaveCount(0);
		await expect(
			page.getByRole("link", { name: "Email Joe", exact: true }),
		).toHaveAttribute("href", `mailto:${profile.email}`);
		await expect(page.getByText("Useful context to include")).toBeVisible();
		expect(apiRequests).toEqual([]);
	});

	test("does not imply API delivery, fallback state, or a response guarantee", async ({
		page,
	}) => {
		await page.goto("/contact/");

		await expect(page.locator("main")).not.toContainText(
			/API|delivery|telemetry|fallback|health|readiness|respond within|response time/i,
		);
		await expect(page.locator("main")).not.toContainText(
			/nothing (?:is|was) sent|stored by this site|opening your email app/i,
		);
	});
});
