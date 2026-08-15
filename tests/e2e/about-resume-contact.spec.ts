import { expect, test } from "@playwright/test";

import { profile } from "../../apps/web/src/data/profile";
import { resumeContent } from "../../apps/web/src/data/resume";

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

	test("About and Resume render the approved shared resume values", async ({
		page,
	}) => {
		expect(resumeContent.provenance.sourceStatus).toBe("approved-source");

		await page.goto("/about/");
		await expect(
			page.getByText(resumeContent.aboutSummary, { exact: true }),
		).toBeVisible();
		const aboutExperience = page.locator(
			'section[aria-labelledby="experience-title"]',
		);
		for (const job of resumeContent.experience) {
			const aboutJob = aboutExperience.locator("li").filter({
				has: page.getByRole("heading", { name: job.company, exact: true }),
			});
			await expect(aboutJob).toContainText(job.aboutRole);
			await expect(aboutJob).toContainText(job.aboutDates);
		}

		await page.goto("/resume/");
		await expect(
			page.getByRole("heading", { level: 1, name: profile.name, exact: true }),
		).toBeVisible();
		await expect(page.locator(".resume-subtitle")).toHaveText(
			resumeContent.contact.title,
		);
		await expect(page.locator(".resume-contact")).toContainText(
			profile.location,
		);
		await expect(page.locator(".resume-contact")).toContainText(
			resumeContent.contact.certs,
		);
		await expect(page.locator(".resume-summary")).toHaveText(
			resumeContent.summary,
		);
		await expect(page.locator("#highlights .resume-bullets li")).toHaveText(
			resumeContent.highlights,
		);
		for (const job of resumeContent.experience) {
			const resumeJob = page.locator(".resume-job").filter({
				has: page.locator(".resume-job-company", { hasText: job.company }),
			});
			await expect(resumeJob.locator(".resume-job-company")).toHaveText(
				job.company,
			);
			await expect(resumeJob.locator(".resume-job-role")).toHaveText(job.role);
			await expect(resumeJob.locator(".resume-job-dates")).toHaveText(
				job.dates,
			);
			await expect(resumeJob.locator(".resume-job-place")).toHaveText(
				job.place,
			);
			await expect(resumeJob.locator(".resume-bullets li")).toHaveText(
				job.bullets,
			);
		}
		for (const group of resumeContent.skillGroups) {
			const skillRow = page.locator(".resume-skill-row").filter({
				has: page.locator("dt", { hasText: group.label }),
			});
			await expect(skillRow.locator("dt")).toHaveText(group.label);
			await expect(skillRow.locator("dd")).toHaveText(group.items);
		}
		await expect(page.locator(".resume-clearance")).toContainText(
			resumeContent.clearance,
		);
	});

	test("offers a working resume download and direct contact channels", async ({
		page,
		request,
	}) => {
		await page.goto("/contact/");
		await expect(page.locator("form")).toHaveCount(0);
		const contactChannels = page.locator(".contact-channels");
		for (const [name, href] of [
			["Email Joe", `mailto:${profile.email}`],
			["LinkedIn", profile.linkedin],
			["GitHub", profile.github],
		] as const) {
			await expect(contactChannels.getByRole("link", { name })).toHaveAttribute(
				"href",
				href,
			);
		}

		await page.goto("/resume/");
		const download = page.getByRole("link", {
			name: "Download résumé PDF",
		});
		await expect(download).toHaveAttribute(
			"href",
			"/downloads/joe-poznanski-resume.pdf",
		);
		expect(
			(await request.get("/downloads/joe-poznanski-resume.pdf")).status(),
		).toBe(200);
	});

	test("keeps resume and contact usable at narrow widths and in print", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 320, height: 800 });

		for (const path of ["/resume/", "/contact/"]) {
			await page.goto(path);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth - window.innerWidth,
				),
				`${path} has horizontal overflow`,
			).toBeLessThanOrEqual(1);

			const targetSizes = await page
				.locator("main [data-touch-target='true']")
				.evaluateAll((targets) =>
					targets.map((target) => {
						const bounds = target.getBoundingClientRect();
						return { height: bounds.height, width: bounds.width };
					}),
				);
			expect(targetSizes.length).toBeGreaterThan(0);
			expect(
				targetSizes.every(({ height, width }) => height >= 44 && width >= 44),
			).toBe(true);
		}

		await page.goto("/resume/");
		await page.emulateMedia({ media: "print" });
		await expect(page.locator(".site-header")).toBeHidden();
		await expect(page.locator(".site-footer")).toBeHidden();
		await expect(page.getByLabel("Resume sections")).toBeHidden();
		await expect(
			page.getByRole("link", { name: "Download résumé PDF" }),
		).toBeHidden();
		await expect(page.locator("[data-print-resume='true']")).toBeVisible();
		await expect(page.locator(".resume-summary")).toHaveText(
			resumeContent.summary,
		);
		const representativeJob = resumeContent.experience[0];
		const printedJob = page.locator(".resume-job").filter({
			has: page.getByRole("heading", {
				name: representativeJob.company,
				exact: true,
			}),
		});
		await expect(printedJob).toBeVisible();
		await expect(printedJob.locator(".resume-bullets li").first()).toHaveText(
			representativeJob.bullets[0],
		);
		const representativeSkill = resumeContent.skillGroups[0];
		const printedSkill = page.locator(".resume-skill-row").filter({
			has: page.locator("dt", { hasText: representativeSkill.label }),
		});
		await expect(printedSkill.locator("dt")).toHaveText(
			representativeSkill.label,
		);
		await expect(printedSkill.locator("dd")).toHaveText(
			representativeSkill.items,
		);
		await expect(page.locator(".resume-clearance")).toContainText(
			resumeContent.clearance,
		);

		const collapsedPrintSections = await page
			.locator("[data-print-resume='true'] .resume-section")
			.evaluateAll((sections) =>
				sections
					.filter((section) => {
						const style = getComputedStyle(section);
						const bounds = section.getBoundingClientRect();
						return (
							style.display === "none" ||
							style.visibility === "hidden" ||
							bounds.width === 0 ||
							bounds.height === 0
						);
					})
					.map((section) => section.id),
			);
		expect(collapsedPrintSections).toEqual([]);
	});
});
