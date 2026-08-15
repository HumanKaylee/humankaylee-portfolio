import { expect, test } from "@playwright/test";

const publishedCaseStudies = [
	"CLI Fleet Synchronization and MCP Rollout",
	"Creative Web Systems Atlas Demo",
	"Joe Poznanski Portfolio Build",
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
		await expect(page.getByText(/reviewed is not approved/i)).toBeVisible();

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

		const architectureMap = page.getByLabel(
			"A sanitized rollout loop showing inventory, registration, verification, and status matrix phases.",
		);
		await expect(architectureMap).toContainText(
			/public-safe architecture map/i,
		);
		await expect(architectureMap).not.toContainText(
			/text diagram placeholder/i,
		);
		for (const stage of [
			"Context",
			"Constraint",
			"Verification",
			"Release boundary",
		]) {
			await expect(
				architectureMap.locator("dt").filter({ hasText: stage }),
			).toBeVisible();
		}
		await expect(
			page.getByRole("region", { name: /evidence drawer/i }),
		).toContainText(/sanitized rollout matrix/i);
		await expect(
			page.getByRole("region", { name: /evidence drawer/i }),
		).toContainText(/proof ledger/i);
		await expect(
			page.getByRole("region", { name: /evidence drawer/i }),
		).toContainText(/launch approval pending/i);
		await expect(
			page.getByRole("region", { name: /evidence drawer/i }),
		).toContainText(/Target-by-target pass, skip, and blocker evidence/i);
		await expect(
			page.getByRole("list", { name: /public-safe artifact ledger/i }),
		).toContainText(/Artifact 01/);
		await expect(
			page.getByRole("heading", {
				name: "Sanitized verification matrix",
				exact: true,
			}),
		).toBeVisible();
		await expect(page.getByText(/redaction review/i)).toContainText(
			/reviewed/i,
		);
	});

	test("renders the remote workstation recovery case study as a public-safe troubleshooting narrative", async ({
		page,
	}) => {
		await page.goto(
			"/case-studies/remote-workstation-recovery-and-operational-debugging/",
		);

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Remote Workstation Recovery and Operational Debugging",
			}),
		).toBeVisible();

		const body = page.getByRole("region", { name: "Case study body" });

		for (const section of [
			"Public-safe narrative",
			"Failure modes",
			"Evidence gathering",
			"Fix path",
			"Verification",
			"Prevention",
			"Safe links and artifacts",
			"Public evidence boundary",
		]) {
			await expect(
				body.getByRole("heading", { name: section, exact: true }),
			).toBeVisible();
		}

		await expect(
			body.getByText(/sanitized diagnostic flow/i).first(),
		).toBeVisible();
		await expect(
			body.getByText(
				/private hostnames, account names, raw logs, and exact recovery commands stay out\s+of scope/i,
			),
		).toBeVisible();
	});

	test("renders the Joe Poznanski portfolio build case study with launch-safe body sections", async ({
		page,
	}) => {
		await page.goto("/case-studies/humankaylee-portfolio-build/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Joe Poznanski Portfolio Build",
			}),
		).toBeVisible();

		const body = page.getByRole("region", { name: "Case study body" });

		for (const section of [
			"Product goal",
			"Design constraints",
			"Static-first architecture",
			"Content model",
			"Visual system",
			"Rust API boundary",
			"Agent-assisted implementation",
			"Verification matrix",
			"Deployment and operations",
			"Launch evidence boundary",
			"Lessons",
		]) {
			await expect(
				body.getByRole("heading", { name: section, exact: true }),
			).toBeVisible();
		}

		for (const phrase of [
			/static-first story/i,
			/astro/i,
			/content collections/i,
			/systems atelier/i,
			/rust axum api/i,
			/playwright route checks, quality-gate scans, content rendering checks/i,
			/lighthouse/i,
		]) {
			await expect(body.getByText(phrase)).toBeVisible();
		}
	});

	test("renders the creative web demo case study body sections", async ({
		page,
	}) => {
		await page.goto("/case-studies/creative-web-systems-atlas-demo/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Creative Web Systems Atlas Demo",
			}),
		).toBeVisible();

		const body = page.getByRole("region", { name: "Case study body" });

		for (const section of [
			"Visual goal",
			"Static proof first",
			"Atlas fallback",
			"Motion boundary",
			"Performance budget",
			"Accessibility contract",
			"Verification",
			"Launch evidence boundary",
			"Next enhancement",
		]) {
			await expect(
				body.getByRole("heading", { name: section, exact: true }),
			).toBeVisible();
		}

		await expect(
			body.getByText(/approved B-017 scope is content and fallback evidence/i),
		).toBeVisible();
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
				name: "Joe Poznanski Portfolio Build",
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
		await expect(page.locator(".noscript-banner")).toBeVisible();
	});
});
