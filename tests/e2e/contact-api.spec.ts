import { expect, test } from "@playwright/test";

async function fillContactForm(page: import("@playwright/test").Page) {
	await page.getByLabel("Your name").fill("Public Reviewer");
	await page.getByLabel("Email address").fill("reviewer@example.com");
	await page.getByLabel("Subject").fill("Principal engineer opportunity");
	await page
		.getByLabel("Message")
		.fill("I would like to discuss the portfolio systems work.");
}

test.describe("direct email contact integration @contact", () => {
	test("keeps direct email visible and provides a no-script mailto action", async ({
		page,
	}) => {
		await page.goto("/contact/");

		await expect(
			page.getByRole("link", { name: "Email Joe directly" }),
		).toHaveAttribute("href", "mailto:josephpoznanski@gmail.com");
		await expect(page.locator("form.contact-form")).toHaveAttribute(
			"action",
			"mailto:josephpoznanski@gmail.com",
		);
		await expect(page.getByRole("status")).toContainText(
			"Nothing is sent or stored by this site",
		);
	});

	test("builds an encoded email draft without calling the backend", async ({
		page,
	}) => {
		const apiRequests: string[] = [];
		page.on("request", (request) => {
			if (request.url().includes("/api/contact"))
				apiRequests.push(request.url());
		});

		await page.goto("/contact/");
		await fillContactForm(page);
		await page.locator("form.contact-form").evaluate((form) => {
			form.dispatchEvent(
				new Event("submit", { bubbles: true, cancelable: true }),
			);
		});

		const action = await page
			.locator("form.contact-form")
			.getAttribute("action");
		expect(action).toContain("mailto:josephpoznanski@gmail.com?");
		expect(action).toContain("Principal%20engineer%20opportunity");
		expect(action).toContain("portfolio%20systems%20work");
		await expect(page.getByRole("status")).toContainText(
			"Opening your email app",
		);
		expect(apiRequests).toEqual([]);
	});

	test("preserves typed content while preparing the email draft", async ({
		page,
	}) => {
		await page.goto("/contact/");
		await fillContactForm(page);
		await page.locator("form.contact-form").evaluate((form) => {
			form.dispatchEvent(
				new Event("submit", { bubbles: true, cancelable: true }),
			);
		});

		await expect(page.getByLabel("Message")).toHaveValue(
			"I would like to discuss the portfolio systems work.",
		);
		await expect(page.getByLabel("Email address")).toHaveValue(
			"reviewer@example.com",
		);
	});
});
