import { expect, test } from "@playwright/test";

const publishedCaseStudies = [
	"CLI Fleet Synchronization and MCP Rollout",
	"Creative Web Systems Atlas Demo",
	"HumanKaylee Portfolio Build",
	"Remote Workstation Recovery and Operational Debugging",
];

test.describe("case-study routes @case-studies", () => {
	test("lists only published case studies and links to each detail page", async ({
		page,
	}) => {
		await page.goto("/case-studies/");

		await expect(
			page.getByRole("heading", { level: 1, name: /case studies/i }),
		).toBeVisible();

		for (const title of publishedCaseStudies) {
			const link = page.getByRole("link", { name: new RegExp(title, "i") });
			await expect(link).toBeVisible();
			await expect(link).toHaveAttribute("href", /\/case-studies\/.+\/$/);
		}

		await expect(page.getByText("YouTube AI Video Pipeline")).toHaveCount(0);
		await expect(
			page.getByText("Kalshi Migration or Analytics Tooling"),
		).toHaveCount(0);
	});

	test("renders the public-safe detail narrative and evidence", async ({
		page,
	}) => {
		await page.goto("/case-studies/cli-fleet-synchronization-and-mcp-rollout/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "CLI Fleet Synchronization and MCP Rollout",
			}),
		).toBeVisible();
		await expect(
			page.getByText(/cross-machine CLI rollout standardized/i),
		).toBeVisible();

		for (const section of [
			"Problem",
			"Constraints",
			"Architecture",
			"Implementation",
			"Verification",
			"Operations",
			"Outcome",
			"Lessons",
			"Safe links and artifacts",
		]) {
			await expect(
				page.getByRole("heading", { name: section, exact: true }),
			).toBeVisible();
		}

		await expect(
			page.getByLabel(
				"A sanitized rollout loop showing inventory, registration, verification, and status matrix phases.",
			),
		).toContainText(/text diagram placeholder/i);
		await expect(
			page.getByRole("region", { name: /evidence drawer/i }),
		).toContainText(/sanitized rollout matrix/i);
		await expect(page.getByText(/redaction review/i)).toContainText(
			/reviewed/i,
		);
	});

	test("does not serve unsafe or deferred case-study routes", async ({
		request,
	}) => {
		expect(
			(await request.get("/case-studies/youtube-ai-video-pipeline/")).status(),
		).toBe(404);
		expect(
			(
				await request.get(
					"/case-studies/kalshi-migration-or-analytics-tooling/",
				)
			).status(),
		).toBe(404);
	});
});

test.describe("case-study routes @case-studies @noscript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps case-study content readable without JavaScript", async ({
		page,
	}) => {
		await page.goto("/case-studies/humankaylee-portfolio-build/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "HumanKaylee Portfolio Build",
			}),
		).toBeVisible();
		await expect(
			page.getByRole("heading", { name: "Architecture", exact: true }),
		).toBeVisible();
		await expect(
			page
				.getByLabel(
					"A static-first portfolio architecture with optional visual and API enhancement layers.",
				)
				.getByText(/static-first portfolio architecture/i),
		).toBeVisible();
		await expect(page.locator(".static-fallback-note")).toBeVisible();
	});
});
