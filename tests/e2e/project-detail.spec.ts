import { expect, test } from "@playwright/test";

const projectDetailPages = [
	{
		slug: "cli-fleet-synchronization-and-mcp-rollout",
		title: "CLI Fleet Synchronization and MCP Rollout",
		summary:
			"Standardized multi-machine CLI setup with inventory, rollout, and verification evidence.",
		relatedCaseStudy:
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	},
	{
		slug: "creative-web-systems-atlas-demo",
		title: "Creative Web Systems Atlas Demo",
		summary:
			"Accessible project atlas concept with a progressive visual enhancement layer.",
		relatedCaseStudy: "/case-studies/creative-web-systems-atlas-demo/",
	},
	{
		slug: "humankaylee-portfolio-build",
		title: "HumanKaylee Portfolio Build",
		summary:
			"Static-first portfolio system with Rust API proof, content contracts, and launch verification.",
		relatedCaseStudy: "/case-studies/humankaylee-portfolio-build/",
	},
	{
		slug: "remote-workstation-recovery-and-operational-debugging",
		title: "Remote Workstation Recovery and Operational Debugging",
		summary:
			"Evidence-first recovery workflow for remote workstation and session failures.",
		relatedCaseStudy:
			"/case-studies/remote-workstation-recovery-and-operational-debugging/",
	},
] as const;

test.describe("project detail routes @projects @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const project of projectDetailPages) {
		test(`renders the static-first project detail page for ${project.slug}`, async ({
			page,
		}) => {
			const response = await page.goto(`/projects/${project.slug}/`);

			expect(response?.status(), project.slug).toBeLessThan(400);
			await expect(
				page.getByRole("heading", {
					level: 1,
					name: project.title,
				}),
			).toBeVisible();
			await expect(page.getByText(project.summary)).toBeVisible();
			await expect(
				page.getByRole("link", {
					name: new RegExp(`Read related case study: ${project.title}`, "i"),
				}),
			).toHaveAttribute("href", project.relatedCaseStudy);
			await expect(
				page.getByRole("link", { name: /Back to project atlas/i }),
			).toHaveAttribute("href", "/projects/");
			await expect(page.locator("body")).toHaveAttribute(
				"data-enhancement",
				"static-first",
			);
		});
	}
});
