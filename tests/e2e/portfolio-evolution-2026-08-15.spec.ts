import { expect, test } from "@playwright/test";

test.describe("portfolio evolution August 2026 @august-evolution", () => {
	test("uses the public Joe Poznanski domain and keeps Projects current on deep routes", async ({
		page,
	}) => {
		await page.goto("/projects/cli-fleet-synchronization-and-mcp-rollout/");

		await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
			"href",
			"https://joepoznanski.io/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);
		const current = page.locator(".primary-nav a[aria-current='page']");
		await expect(current).toHaveCount(1);
		await expect(current).toHaveAttribute("href", "/projects/");
		await expect(
			page.getByRole("navigation", { name: "Portfolio actions" }),
		).toContainText(/Resume|Email Joe/);
		await expect(
			page.getByRole("link", { name: "Site changelog" }),
		).toHaveAttribute("href", "/changelog/");
	});

	test("puts verified career proof and visual work evidence on the home page", async ({
		page,
	}) => {
		await page.goto("/");

		const proof = page.getByRole("list", { name: "Career proof" });
		for (const marker of [
			"15+ years",
			"Principal engineer",
			"Mission-critical",
			"Rust, C++, Python, AI",
		]) {
			await expect(proof).toContainText(marker);
		}
		const gallery = page.locator(".interface-evidence");
		await expect(
			gallery.getByRole("img", { name: "Systems map interface" }),
		).toBeVisible();
		await expect(
			gallery.getByRole("img", { name: "Project atlas interface" }),
		).toBeVisible();
		await expect(gallery.locator("svg[role='img']")).toHaveCount(2);
		await expect(page.locator("main")).not.toContainText(
			/API telemetry unavailable/i,
		);

		await page.setViewportSize({ width: 390, height: 844 });
		await page.reload();
		const overflow = await page.evaluate(
			() => document.documentElement.scrollWidth > window.innerWidth + 1,
		);
		expect(overflow).toBe(false);
	});

	test("turns project summaries into structured, evidence-led project pages", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		await page.goto("/projects/cli-fleet-synchronization-and-mcp-rollout/");

		for (const heading of [
			"Project at a glance",
			"Architecture flow",
			"Verification evidence",
		]) {
			await expect(page.getByRole("heading", { name: heading })).toBeVisible();
		}
		await expect(
			page.getByRole("link", {
				name: "Read the full case study",
				exact: true,
			}),
		).toHaveAttribute(
			"href",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		);
		await expect(
			page.getByRole("link", {
				name: /Read the full case study: CLI Fleet Synchronization and MCP Rollout/i,
			}),
		).toHaveAttribute(
			"href",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		);
		const actionLayout = await page
			.locator(".detail-actions")
			.evaluate((node) => {
				const styles = getComputedStyle(node);
				const primary = node.querySelector<HTMLElement>(
					".detail-primary-action",
				);
				const primaryStyles = primary ? getComputedStyle(primary) : null;

				return {
					display: styles.display,
					gap: Number.parseFloat(styles.gap),
					primaryPadding: Number.parseFloat(
						primaryStyles?.paddingInlineStart ?? "0",
					),
				};
			});
		expect(actionLayout.display).toBe("flex");
		expect(actionLayout.gap).toBeGreaterThanOrEqual(12);
		expect(actionLayout.primaryPadding).toBeGreaterThanOrEqual(16);
		const h1 = await page.getByRole("heading", { level: 1 }).boundingBox();
		expect(h1?.x ?? -1).toBeGreaterThanOrEqual(0);
		expect((h1?.x ?? 0) + (h1?.width ?? 0)).toBeLessThanOrEqual(390);
		await expect(page.locator("main")).not.toContainText(
			/atlas anchor links intact/i,
		);
	});

	test("adds compact wayfinding to long-lived reference pages", async ({
		page,
	}) => {
		await page.goto("/now/");
		await expect(page.getByRole("heading", { level: 1 })).toContainText(
			"August 2026",
		);

		await page.goto("/uses/");
		await expect(
			page.getByRole("navigation", { name: "Uses sections" }),
		).toBeVisible();

		await page.goto("/reading/");
		await expect(page.getByRole("heading", { level: 1 })).toHaveText(
			"Reading notes, 2026",
		);

		await page.goto("/resume/");
		const resumeNav = page.getByRole("navigation", { name: "Resume sections" });
		for (const href of ["#summary", "#experience", "#skills"]) {
			await expect(resumeNav.locator(`a[href='${href}']`)).toBeVisible();
		}
	});

	test("makes direct email the primary contact path without promising API delivery", async ({
		page,
	}) => {
		await page.goto("/contact/");

		await expect(
			page.getByRole("link", { name: "Email Joe directly" }),
		).toHaveAttribute("href", "mailto:josephpoznanski@gmail.com");
		await expect(
			page.getByRole("button", { name: "Open email draft" }),
		).toBeVisible();
		await expect(page.getByRole("status")).toContainText(
			"Nothing is sent or stored by this site",
		);
		await expect(page.locator("main")).not.toContainText(/form service|API/i);
	});
});
