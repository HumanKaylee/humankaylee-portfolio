import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("Contracting client journey", () => {
	test("connects a client to scope, evidence, process, and direct contact", async ({
		page,
		request,
	}) => {
		await page.goto("/");
		await page.getByRole("link", { name: "Explore contracting" }).click();
		await expect(page).toHaveURL(/\/contracting\/$/);
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"From a hard problem to software you can trust.",
		);
		await expect(page.locator("main")).toContainText("acceptance criteria");
		await expect(page.locator("main")).toContainText("Verification");
		await expect(page.locator("main")).toContainText("Validation");
		await expect(page.locator("main form")).toHaveCount(0);
		await expect(page.locator("main")).not.toContainText(
			/guaranteed results|immediately available|Arctic Cat|insured and bonded/i,
		);
		const email = page.getByRole("link", { name: "Email a project brief" });
		await expect(email).toHaveAttribute(
			"href",
			/^mailto:josephpoznanski@gmail\.com\?subject=/,
		);
		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://joepoznanski.io/contracting/",
		);
		const sitemap = await (await request.get("/sitemap-index.xml")).text();
		expect(sitemap.split("https://joepoznanski.io/contracting/")).toHaveLength(
			2,
		);
		for (const href of await page
			.locator('main a[href^="/work/"]')
			.evaluateAll((links) =>
				links.map((link) => link.getAttribute("href") ?? ""),
			)) {
			expect((await request.get(href)).status(), href).toBe(200);
		}
		await page.goto("/contact/");
		await expect(
			page.getByRole("link", { name: "Contracting: scope, process, and fit" }),
		).toHaveAttribute("href", "/contracting/");
	});

	for (const width of [390, 1440]) {
		test(`remains readable and accessible at ${width}px without JavaScript`, async ({
			browser,
		}) => {
			const context = await browser.newContext({
				javaScriptEnabled: false,
				reducedMotion: "reduce",
				viewport: { width, height: 1000 },
			});
			const page = await context.newPage();
			await page.goto("http://127.0.0.1:4321/contracting/");
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(
				page.getByRole("link", { name: "Email a project brief" }),
			).toBeVisible();
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth - innerWidth,
				),
			).toBeLessThanOrEqual(1);
			await page.screenshot({
				path: `test-results/contracting-${width}.png`,
				fullPage: true,
			});
			await context.close();
		});
	}

	test("has no WCAG A or AA accessibility violations", async ({ page }) => {
		await page.goto("/contracting/");
		const results = await new AxeBuilder({ page })
			.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
			.analyze();
		expect(results.violations).toEqual([]);
	});

	test("lets keyboard users follow the verification stage to its evidence", async ({
		page,
	}) => {
		await page.goto("/contracting/");
		const stage = page.getByRole("link", {
			name: "05. Test & verify. Read this stage.",
			exact: true,
		});
		await stage.focus();
		await stage.press("Enter");
		await expect(page).toHaveURL(/#delivery-verify$/);
		await expect(page.locator("#delivery-verify")).toBeFocused();
		await expect(page.locator("#delivery-verify")).toContainText(
			"failure paths",
		);
		await expect(page.locator("#delivery-verify")).not.toContainText(
			"guaranteed",
		);
	});
});
