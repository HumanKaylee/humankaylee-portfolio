import { expect, test } from "@playwright/test";

test.describe("Signal / Proof evaluator journeys @journey", () => {
	test("moves from the home work signal to the corresponding proof", async ({
		page,
	}) => {
		await page.goto("/");

		await page.getByRole("link", { name: /View selected work/i }).click();
		await expect(page).toHaveURL(/\/work\/$/);

		const cryoDetail = page
			.getByRole("link", { name: /Cryogenic Flow Simulation/i })
			.first();
		await expect(cryoDetail).toHaveAttribute("href", "/work/cryo-flow-sim/");
		await cryoDetail.click();

		await expect(page).toHaveURL(/\/work\/cryo-flow-sim\/$/);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: /Cryogenic Flow Simulation/i,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { level: 2, name: "Proof" }),
		).toBeVisible();
	});

	test("moves from the primary navigation to the static resume PDF", async ({
		page,
	}) => {
		await page.goto("/");

		await page
			.getByLabel("Primary navigation")
			.getByRole("link", { name: "Résumé" })
			.click();

		await expect(page).toHaveURL(/\/resume\/$/);
		await expect(
			page.getByRole("heading", { level: 1, name: "Joe Poznanski" }),
		).toBeVisible();
		const resume = page.getByRole("link", {
			name: /Download résumé PDF/i,
		});
		await expect(resume).toHaveAttribute(
			"href",
			"/downloads/joe-poznanski-resume.pdf",
		);
		const response = await page.request.get(
			"/downloads/joe-poznanski-resume.pdf",
		);
		expect(response.status()).toBe(200);
	});

	test("moves from the primary navigation to the direct email fallback", async ({
		page,
	}) => {
		await page.goto("/");

		await page
			.getByLabel("Primary navigation")
			.getByRole("link", { name: "Contact" })
			.click();

		await expect(page).toHaveURL(/\/contact\/$/);
		await expect(page.locator("form")).toHaveCount(0);
		await expect(
			page.getByRole("link", {
				name: /josephpoznanski@gmail\.com/i,
			}),
		).toHaveAttribute("href", "mailto:josephpoznanski@gmail.com");
	});
});
