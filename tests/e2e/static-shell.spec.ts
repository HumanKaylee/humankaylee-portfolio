import { expect, test } from "@playwright/test";

const coreRoutes = [
	{
		path: "/",
		heading: /Systems built to hold up/i,
		copy: /practical AI-assisted systems/i,
	},
	{
		path: "/projects/",
		heading: /project atlas/i,
		copy: /CLI Fleet Synchronization/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		copy: /Principal Software Engineer/i,
	},
	{
		path: "/notes/",
		heading: /notes from the systems atelier/i,
		copy: /build decisions/i,
	},
	{
		path: "/notes/how-the-portfolio-stays-useful-when-the-api-is-offline/",
		heading: /How the portfolio stays useful when the API is offline/i,
		copy: /The static shell carries the recruiting story/i,
	},
	{
		path: "/contact/",
		heading: /contact/i,
		copy: /fastest route is direct email/i,
	},
];

const resumeLaunchBoundaryText =
	/published resume|published PDF|public resume|public PDF|live resume|production resume/i;

function luminance([red, green, blue]: readonly number[]) {
	const channels = [red, green, blue].map((value) => {
		const normalized = value / 255;
		return normalized <= 0.03928
			? normalized / 12.92
			: ((normalized + 0.055) / 1.055) ** 2.4;
	});

	return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastRatio(
	foreground: readonly number[],
	background: readonly number[],
) {
	const light = Math.max(luminance(foreground), luminance(background));
	const dark = Math.min(luminance(foreground), luminance(background));

	return (light + 0.05) / (dark + 0.05);
}

function parseColor(value: string) {
	if (value.startsWith("#")) {
		const hex = value.slice(1);
		return [0, 2, 4].map((start) =>
			Number.parseInt(hex.slice(start, start + 2), 16),
		);
	}

	const matches = value.match(/\d+/g);
	if (!matches || matches.length < 3) {
		throw new Error(`Could not parse color: ${value}`);
	}

	return matches.slice(0, 3).map(Number);
}

test.describe("static shell @static-shell", () => {
	for (const route of coreRoutes) {
		test(`renders meaningful static HTML for ${route.path}`, async ({
			page,
		}) => {
			await page.goto(route.path);

			const main = page.locator("main");
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				route.heading,
			);
			await expect(main.getByText(route.copy).first()).toBeVisible();
			await expect(page.locator("body")).toHaveAttribute(
				"data-enhancement",
				"static-first",
			);
		});
	}

	test("puts positioning, primary navigation, and CTA paths in the first viewport", async ({
		page,
	}) => {
		await page.goto("/");

		const primaryNav = page.getByLabel("Primary navigation");
		await expect(page.getByText("The Systems Atelier")).toBeVisible();
		await expect(
			primaryNav.getByRole("link", { name: "Projects" }),
		).toHaveAttribute("href", "/projects/");
		await expect(
			primaryNav.getByRole("link", { name: "Resume" }),
		).toHaveAttribute("href", "/resume/");
		await expect(
			primaryNav.getByRole("link", { name: "Contact" }),
		).toHaveAttribute("href", "/contact/");
		await expect(
			page.getByRole("link", { name: /For recruiters/i }),
		).toHaveAttribute("href", "/resume/");
		await expect(
			page.getByRole("link", { name: /For engineers/i }),
		).toHaveAttribute("href", "/projects/");
		await expect(
			page.getByRole("navigation", { name: "Primary calls to action" }),
		).toBeVisible();
		await expect(
			page.getByText("Static evidence with optional API telemetry"),
		).toBeVisible();
		await expect(
			page.getByRole("article", { name: /Rendering/i }),
		).toBeVisible();
	});

	test("keeps public proof surfaces free of scaffold or future-promise copy", async ({
		page,
	}) => {
		for (const route of ["/", "/projects/"]) {
			await page.goto(route);
			const visibleCopy = await page.locator("main").innerText();

			expect(visibleCopy).not.toMatch(
				/\b(scaffold|placeholder)\b|will enhance|canvas later|layer on top later|prepared for future/i,
			);
		}
	});

	test("renders a static systems map hero with project links before any WebGL enhancement", async ({
		page,
	}) => {
		await page.goto("/");

		const mapHero = page.getByRole("region", {
			name: "Static systems map hero",
		});
		await expect(mapHero).toBeVisible();
		await expect(mapHero.getByText(/Systems signature/i)).toBeVisible();
		await expect(mapHero.locator("svg")).toHaveAttribute(
			"aria-label",
			/Sanitized systems map/i,
		);
		await expect(
			mapHero.getByRole("link", {
				name: /Open CLI Fleet Synchronization and MCP Rollout/i,
			}),
		).toHaveAttribute(
			"href",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);
		await expect(
			mapHero.getByText(/problem to verified system/i),
		).toBeVisible();
		const legend = mapHero.getByLabel("Hero evidence legend");
		await expect(legend).toBeVisible();
		for (const proof of ["Problem", "System", "Evidence"]) {
			await expect(legend.getByText(proof, { exact: true })).toBeVisible();
		}
	});

	test("keeps primary links keyboard reachable with mobile-safe touch targets @keyboard", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		for (const route of coreRoutes) {
			await page.goto(route.path);

			const targetHeights = await page
				.locator("a:visible")
				.evaluateAll((links) =>
					links.map((link) => link.getBoundingClientRect().height),
				);

			expect(targetHeights.length).toBeGreaterThanOrEqual(5);
			expect(
				targetHeights.every((height) => height >= 44),
				route.path,
			).toBe(true);
		}

		await page.goto("/");

		const focusedLabels: string[] = [];
		for (let index = 0; index < 11; index += 1) {
			await page.keyboard.press("Tab");
			focusedLabels.push(
				await page.evaluate(() => {
					const active = document.activeElement;
					return (
						active?.getAttribute("aria-label") ??
						active?.textContent?.replace(/\s+/g, " ").trim() ??
						""
					);
				}),
			);
		}

		expect(focusedLabels).toEqual(
			expect.arrayContaining([
				"Projects",
				"Resume",
				"Contact",
				"Resume, scope, proof For recruiters",
				"Systems, tradeoffs, verification For engineers",
			]),
		);
	});

	test("uses readable contrast for evidence text on the dark shell", async ({
		page,
	}) => {
		await page.goto("/");

		const colors = await page
			.locator(".evidence-panel strong")
			.first()
			.evaluate((element) => ({
				foreground: getComputedStyle(element).color,
				background: getComputedStyle(document.documentElement)
					.getPropertyValue("--color-ink")
					.trim(),
			}));

		expect(
			contrastRatio(
				parseColor(colors.foreground),
				parseColor(colors.background),
			),
		).toBeGreaterThanOrEqual(4.5);
	});

	test("keeps visible same-origin links on implemented static routes", async ({
		page,
		request,
	}) => {
		const hrefs = new Set<string>();

		for (const route of coreRoutes) {
			await page.goto(route.path);
			for (const href of await page
				.locator("a:visible")
				.evaluateAll((links) =>
					links
						.map((link) => link.getAttribute("href"))
						.filter((href): href is string => Boolean(href)),
				)) {
				if (href.startsWith("/") && !href.startsWith("//")) {
					hrefs.add(href.split("#")[0] || "/");
				}
			}
		}

		for (const href of hrefs) {
			const response = await request.get(href);
			expect(response.status(), href).not.toBe(404);
		}
	});

	test("serves the approved-source static resume asset from home and the resume page", async ({
		page,
		request,
	}) => {
		for (const [route, linkName, sourceText] of [
			["/", /Download resume PDF/i, /approved local source/i],
			[
				"/resume/",
				/Download full resume \(PDF\)/i,
				/Principal Software Engineer/i,
			],
		] as const) {
			await page.goto(route);
			await expect(page.locator("main")).toContainText(sourceText);
			await expect(page.locator("main")).not.toContainText(
				resumeLaunchBoundaryText,
			);
			await expect(page.getByRole("link", { name: linkName })).toHaveAttribute(
				"href",
				"/downloads/joe-poznanski-resume.pdf",
			);
		}

		const response = await request.get("/downloads/joe-poznanski-resume.pdf");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("application/pdf");
	});

	test("keeps the resume page print-ready without navigation chrome", async ({
		page,
	}) => {
		await page.goto("/resume/");
		await expect(
			page.getByRole("link", { name: /Download full resume \(PDF\)/i }),
		).toHaveAttribute("href", "/downloads/joe-poznanski-resume.pdf");
		await page.emulateMedia({ media: "print" });

		const printableResume = page.locator('[data-print-resume="true"]');
		await expect(printableResume).toBeVisible();
		await expect(printableResume).toHaveCSS(
			"background-color",
			"rgb(255, 255, 255)",
		);
		await expect(printableResume).toHaveCSS("box-shadow", "none");
		await expect(page.locator(".site-header")).toHaveCSS("display", "none");
		await expect(page.locator(".site-footer")).toHaveCSS("display", "none");
		await expect(page.locator(".resume-hero")).toHaveCSS("display", "none");
	});

	test("does not apply resume print chrome hiding to non-resume routes", async ({
		page,
	}) => {
		await page.goto("/projects/");
		await page.emulateMedia({ media: "print" });

		await expect(page.locator("body")).not.toHaveClass(/resume-print-route/);
		await expect(page.locator(".site-header")).not.toHaveCSS("display", "none");
		await expect(page.locator(".site-footer")).not.toHaveCSS("display", "none");
	});

	test("labels project detail links uniquely and points cards to static routes", async ({
		page,
	}) => {
		await page.goto("/projects/");

		await expect(
			page
				.getByRole("link", {
					name: "View project detail for CLI Fleet Synchronization and MCP Rollout",
				})
				.first(),
		).toHaveAttribute(
			"href",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
		);

		const labels = await page
			.locator("[data-atlas-node]")
			.evaluateAll((links) =>
				links.map(
					(link) =>
						link.getAttribute("aria-label") ??
						link.textContent?.replace(/\s+/g, " ").trim() ??
						"",
				),
			);

		expect(labels).not.toContain("View project detail");
		expect(new Set(labels).size).toBe(labels.length);
	});
});

test.describe("static shell @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const route of coreRoutes) {
		test(`keeps ${route.path} readable without JavaScript`, async ({
			page,
		}) => {
			await page.goto(route.path);

			const main = page.locator("main");
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(main.getByText(route.copy).first()).toBeVisible();
			await expect(page.locator(".noscript-banner")).toBeVisible();
		});
	}
});
