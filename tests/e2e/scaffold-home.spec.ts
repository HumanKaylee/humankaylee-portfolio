import { expect, test } from "@playwright/test";

import {
	EXPECTED_H1,
	EXPECTED_NO_JS_COPY,
	EXPECTED_SCAFFOLD_COPY,
	HOME_PATH,
} from "../fixtures/scaffold-home";

test.describe("scaffold-stage home page", () => {
	test("loads and exposes honest scaffold text", async ({ page }) => {
		await page.goto(HOME_PATH);

		await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			EXPECTED_H1,
		);
		await expect(page.getByText(EXPECTED_SCAFFOLD_COPY)).toBeVisible();
	});

	test("has a static primary heading", async ({ page }) => {
		await page.goto(HOME_PATH);

		const h1 = page.getByRole("heading", { level: 1 });
		await expect(h1).toBeVisible();
		await expect(h1).toHaveCount(1);
		await expect(h1).toContainText(EXPECTED_H1);
	});

	test.describe("with JavaScript disabled", () => {
		test.use({ javaScriptEnabled: false });

		test("remains readable", async ({ page }) => {
			await page.goto(HOME_PATH);

			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.getByText(EXPECTED_SCAFFOLD_COPY)).toBeVisible();
			await expect(page.getByText(EXPECTED_NO_JS_COPY)).toBeVisible();
		});
	});
});
