import { expect, test } from "@playwright/test";

async function fillContactForm(page: import("@playwright/test").Page) {
	await page.getByLabel("Your name").fill("Public Reviewer");
	await page.getByLabel("Email address").fill("reviewer@example.com");
	await page
		.getByLabel("Message")
		.fill("I would like to discuss the portfolio systems work.");
}

test.describe("contact API integration @contact", () => {
	test("submits through the configured API path while keeping the fallback visible", async ({
		page,
	}) => {
		let submittedPayload: unknown;
		await page.route("**/api/contact", async (route) => {
			submittedPayload = route.request().postDataJSON();
			await route.fulfill({
				status: 202,
				contentType: "application/json",
				body: JSON.stringify({
					status: "accepted",
					message: "Message queued for follow-up.",
				}),
			});
		});

		await page.goto("/contact/");
		await expect(page.getByRole("status")).toContainText(
			"Use the email link below if the API is unavailable.",
		);
		await fillContactForm(page);
		await page.getByRole("button", { name: "Send message" }).click();

		await expect(page.getByRole("status")).toContainText(
			"Message queued for follow-up.",
		);
		await expect(
			page.getByRole("link", { name: /contact-pending@humankaylee.example/i }),
		).toBeVisible();
		expect(submittedPayload).toMatchObject({
			name: "Public Reviewer",
			email: "reviewer@example.com",
			message: "I would like to discuss the portfolio systems work.",
			company: "",
		});
	});

	test("preserves typed content and shows the mailto fallback when the API is down", async ({
		page,
	}) => {
		await page.route("**/api/contact", (route) => route.abort("failed"));

		await page.goto("/contact/");
		await fillContactForm(page);
		await page.getByRole("button", { name: "Send message" }).click();

		await expect(page.getByRole("status")).toContainText(
			"API unavailable. Your message is still in the form",
		);
		await expect(page.getByRole("status")).toContainText(
			"Use the email link below if the API is unavailable.",
		);
		await expect(page.getByLabel("Message")).toHaveValue(
			"I would like to discuss the portfolio systems work.",
		);
		await expect(
			page.getByRole("link", { name: /contact-pending@humankaylee.example/i }),
		).toBeVisible();
	});
});

test.describe("contact API integration @api-down", () => {
	test("falls back safely on backend validation errors without losing text", async ({
		page,
	}) => {
		await page.route("**/api/contact", async (route) => {
			await route.fulfill({
				status: 400,
				contentType: "application/json",
				body: JSON.stringify({
					error: {
						code: "validation_failed",
						message: "Use a valid email and message.",
					},
				}),
			});
		});

		await page.goto("/contact/");
		await fillContactForm(page);
		await page.getByRole("button", { name: "Send message" }).click();

		await expect(page.getByRole("status")).toContainText(
			"Use a valid email and message.",
		);
		await expect(page.getByLabel("Message")).toHaveValue(
			"I would like to discuss the portfolio systems work.",
		);
	});
});
