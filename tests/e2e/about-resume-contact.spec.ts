import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const aboutSource = readFileSync(
	"apps/web/src/pages/about/index.astro",
	"utf8",
);
const resumeSource = readFileSync(
	"apps/web/src/pages/resume/index.astro",
	"utf8",
);
const resumeMetadata = JSON.parse(
	readFileSync("apps/web/src/content/resume/resume.json", "utf8"),
) as { sourceStatus: string; approvalState: string };

test.describe("About, resume, and contact @primary-routes", () => {
	test("About presents a human narrative with selected secondary material", async ({
		page,
	}) => {
		const response = await page.goto("/about/");

		expect(response?.status()).toBe(200);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: /engineering judgment/i,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Current focus" }),
		).toBeVisible();
		await expect(
			page.getByText("Reliability research for automated systems", {
				exact: true,
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Operating principles" }),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Experience" }),
		).toBeVisible();
		await expect(page.getByText("Blue Origin", { exact: true })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Selected tools" }),
		).toBeVisible();
		await expect(page.getByText("Rust", { exact: true })).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Current reading" }),
		).toBeVisible();
		await expect(
			page.getByText("Crafting Interpreters", { exact: true }),
		).toBeVisible();

		const primaryNavigation = page.getByLabel("Primary navigation");
		await expect(primaryNavigation.getByRole("link")).toHaveText([
			"Work",
			"About",
			"Résumé",
			"Contact",
		]);
		await expect(primaryNavigation).not.toContainText(/Notes|Now|Uses|Reading/);

		const secondaryNavigation = page.getByLabel("Secondary navigation");
		for (const [label, href] of [
			["Notes", "/notes/"],
			["Now", "/now/"],
			["Uses", "/uses/"],
			["Reading", "/reading/"],
		] as const) {
			await expect(
				secondaryNavigation.getByRole("link", { name: label, exact: true }),
			).toHaveAttribute("href", href);
		}

		await expect(page.locator("main")).not.toContainText(
			/build log|launch readiness|refining this portfolio|shipping this portfolio evolution/i,
		);
	});

	test("About and Resume consume one approved typed resume source", async ({
		page,
	}) => {
		expect(resumeMetadata).toMatchObject({
			sourceStatus: "approved-source",
			approvalState: "approved",
		});
		expect(aboutSource).toMatch(/from "\.\.\/\.\.\/data\/resume"/);
		expect(resumeSource).toMatch(/from "\.\.\/\.\.\/data\/resume"/);

		for (const path of ["/about/", "/resume/"]) {
			await page.goto(path);
			for (const company of [
				"Otto Aerospace",
				"Blue Origin",
				"Avenger Flight Group",
				"SIMCOM Training",
			]) {
				const companyName =
					path === "/about/"
						? page.getByText(company, { exact: true })
						: page.locator(".resume-job-company").filter({ hasText: company });
				await expect(companyName).toBeVisible();
			}
		}
	});

	test("About selects current Now entries before sorting", () => {
		expect(aboutSource).toMatch(
			/\.filter\(\s*\(entry: NowEntry\) => entry\.data\.status === "current"\s*\)/,
		);
	});
});
