import { expect, test } from "@playwright/test";

const coreRoutes = [
	{
		path: "/",
		heading: /systems atelier/i,
		copy: /practical AI-assisted systems/i,
	},
	{
		path: "/projects/",
		heading: /project atlas/i,
		copy: /CLI Fleet Synchronization/i,
	},
	{
		path: "/resume/",
		heading: /resume/i,
		copy: /PDF source workflow/i,
	},
	{
		path: "/contact/",
		heading: /contact/i,
		copy: /mailto fallback/i,
	},
];

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
			page.getByText("Static evidence until API integration"),
		).toBeVisible();
		await expect(
			page.getByRole("article", { name: /Rendering/i }),
		).toBeVisible();
	});

	test("keeps primary links keyboard reachable with mobile-safe touch targets", async ({
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

		expect([...hrefs].some((href) => href.startsWith("/case-studies/"))).toBe(
			false,
		);

		for (const href of hrefs) {
			const response = await request.get(href);
			expect(response.status(), href).not.toBe(404);
		}
	});

	test("labels project proof links uniquely while case-study routes are pending", async ({
		page,
	}) => {
		await page.goto("/projects/");

		await expect(
			page.getByRole("link", {
				name: "View static proof for CLI Fleet Synchronization and MCP Rollout",
			}),
		).toHaveAttribute(
			"href",
			"/projects/#cli-fleet-synchronization-and-mcp-rollout",
		);

		const labels = await page
			.locator(".project-card a")
			.evaluateAll((links) =>
				links.map(
					(link) =>
						link.getAttribute("aria-label") ??
						link.textContent?.replace(/\s+/g, " ").trim() ??
						"",
				),
			);

		expect(labels).not.toContain("View static proof");
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
			await expect(page.locator(".static-fallback-note")).toBeVisible();
		});
	}
});
