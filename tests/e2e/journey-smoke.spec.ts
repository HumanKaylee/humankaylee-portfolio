import { expect, test } from "@playwright/test";

test.describe("portfolio evaluator journeys @journey", () => {
	test("lets recruiters move from the home CTA to the static resume PDF", async ({
		page,
	}) => {
		await page.goto("/");

		await page.getByRole("link", { name: /For recruiters/i }).click();

		await expect(page).toHaveURL(/\/resume\/$/);
		await expect(
			page.getByRole("heading", { level: 1, name: /Resume path/i }),
		).toBeVisible();
		await expect(
			page.getByRole("link", { name: /Download resume PDF/i }),
		).toHaveAttribute("href", "/downloads/humankaylee-resume.pdf");
	});

	test("lets engineers move from the home CTA to a project detail page", async ({
		page,
	}) => {
		await page.goto("/");

		await page.getByRole("link", { name: /For engineers/i }).click();

		await expect(page).toHaveURL(/\/projects\/$/);
		const projectDetailLink = page
			.getByRole("link", {
				name: /View project detail for CLI Fleet Synchronization/i,
			})
			.first();
		await expect(projectDetailLink).toHaveAttribute(
			"href",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);

		await projectDetailLink.click();

		await expect(page).toHaveURL(
			/\/projects\/cli-fleet-synchronization-and-mcp-rollout\/$/,
		);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: /CLI Fleet Synchronization and MCP Rollout/i,
			}),
		).toBeVisible();
	});

	test("lets contacts move from the home navigation to the mailto fallback", async ({
		page,
	}) => {
		await page.goto("/");

		await page
			.getByLabel("Primary navigation")
			.getByRole("link", { name: "Contact" })
			.click();

		await expect(page).toHaveURL(/\/contact\/$/);
		await expect(
			page.getByRole("link", {
				name: /contact-pending@humankaylee\.example/i,
			}),
		).toHaveAttribute("href", "mailto:contact-pending@humankaylee.example");
	});
});
