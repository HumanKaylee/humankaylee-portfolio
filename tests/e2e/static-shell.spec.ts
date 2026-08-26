import { expect, test } from "@playwright/test";

const coreRoutes = [
	{
		path: "/",
		heading:
			/Principal engineer for simulation, controls, and operational software/i,
		copy: /Flagship systems, backed by working software/i,
	},
	{
		path: "/work/",
		heading: /Systems made legible through proof/i,
		copy: /Flagship work/i,
	},
	{
		path: "/work/cryo-flow-sim/",
		heading: /Cryogenic Flow Simulation/i,
		copy: /29,500 entities/i,
	},
	{
		path: "/work/conformal-cooling-channel-generation/",
		heading: /Conformal Cooling Channel Generation/i,
		copy: /Fresh gear-cavity capture/i,
	},
	{
		path: "/work/black-scholes-wasm/",
		heading: /Black-Scholes Options Pricer/i,
		copy: /Live pricer/i,
	},
	{
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		heading: /CLI Fleet Synchronization/i,
		copy: /Verification matrix/i,
	},
	{
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
		heading: /Remote Workstation Recovery/i,
		copy: /Layered triage matrix/i,
	},
	{
		path: "/about/",
		heading: /Engineering judgment for systems that have to hold up/i,
		copy: /Operating principles/i,
	},
	{
		path: "/resume/",
		heading: /Joe Poznanski/i,
		copy: /Agentic AI & automation highlights/i,
	},
	{
		path: "/notes/",
		heading: /Technical notes/i,
		copy: /Black-Scholes/i,
	},
	{
		path: "/notes/wasm-black-scholes-options-pricer/",
		heading: /A Black-Scholes options pricer in Rust/i,
		copy: /European options/i,
	},
	{
		path: "/contact/",
		heading: /Let’s talk about the system behind the problem/i,
		copy: /Useful context to include/i,
	},
] as const;

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
	const matches = value.match(/\d+/g);
	if (!matches || matches.length < 3) {
		throw new Error(`Could not parse color: ${value}`);
	}

	return matches.slice(0, 3).map(Number);
}

test.describe("Signal / Proof static shell @static-shell", () => {
	for (const route of coreRoutes) {
		test(`renders meaningful static HTML for ${route.path}`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);

			expect(response?.status()).toBe(200);
			await expect(page.getByRole("heading", { level: 1 })).toContainText(
				route.heading,
			);
			await expect(page.locator("main")).toContainText(route.copy);
			await expect(page.locator("body")).toHaveAttribute(
				"data-enhancement",
				"static-first",
			);
		});
	}

	test("puts positioning, primary navigation, and the Work path in the first viewport", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 1440, height: 1200 });
		await page.goto("/");

		const primaryNav = page.getByLabel("Primary navigation");
		for (const [name, href] of [
			["Work", "/work/"],
			["About", "/about/"],
			["Résumé", "/resume/"],
			["Contact", "/contact/"],
		] as const) {
			await expect(primaryNav.getByRole("link", { name })).toHaveAttribute(
				"href",
				href,
			);
		}
		await expect(
			page.getByRole("link", { name: /View selected work/i }),
		).toHaveAttribute("href", "/work/");
		await expect(page.locator("#hero-title")).toBeInViewport();
		await expect(
			page.locator(".home-hero [data-motion-video]"),
		).toBeInViewport();
	});

	test("keeps public proof surfaces free of scaffold or future-promise copy", async ({
		page,
	}) => {
		for (const route of [
			"/",
			"/work/",
			...coreRoutes.slice(2, 5).map((item) => item.path),
		]) {
			await page.goto(route);
			const visibleCopy = await page.locator("main").innerText();

			expect(visibleCopy).not.toMatch(
				/\b(scaffold|placeholder)\b|will enhance|canvas later|layer on top later|prepared for future/i,
			);
		}
	});

	test("renders complete selected proof and capability evidence before enhancement", async ({
		page,
	}) => {
		await page.goto("/");

		await expect(page.locator(".proof-gallery")).toBeVisible();
		await expect(page.locator("[data-proof-placement]")).toHaveCount(4);
		await expect(page.locator("[data-capability-proof]")).toHaveCount(6);
		await expect(page.locator("canvas, svg")).toHaveCount(0);
		for (const href of [
			"/work/cryo-flow-sim/",
			"/work/conformal-cooling-channel-generation/",
			"/work/xplane-cabin-camera-fov-trade-study/",
			"/work/black-scholes-wasm/",
		]) {
			await expect(
				page.locator(`.proof-gallery a[href="${href}"]`),
			).toHaveCount(2);
		}
	});

	test("keeps marked primary links keyboard reachable with mobile-safe targets @keyboard", async ({
		page,
	}) => {
		await page.setViewportSize({ width: 390, height: 844 });
		for (const route of coreRoutes) {
			await page.goto(route.path);
			const targetHeights = await page
				.locator('[data-touch-target="true"]:visible')
				.evaluateAll((links) =>
					links.map((link) => link.getBoundingClientRect().height),
				);

			expect(targetHeights.length, route.path).toBeGreaterThan(0);
			expect(
				targetHeights.every((height) => height >= 44),
				route.path,
			).toBe(true);
		}

		await page.goto("/");
		const focusedLabels: string[] = [];
		for (let index = 0; index < 8; index += 1) {
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
			expect.arrayContaining(["Work", "About", "Résumé", "Contact"]),
		);
	});

	test("uses readable contrast for evidence text on the technical surface", async ({
		page,
	}) => {
		await page.goto("/");

		const colors = await page
			.locator(".evidence-flow dt")
			.first()
			.evaluate((element) => {
				const surface = element.closest(".evidence-flow");
				if (!surface) {
					throw new Error("evidence surface missing");
				}
				return {
					foreground: getComputedStyle(element).color,
					background: getComputedStyle(surface).backgroundColor,
				};
			});

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

	test("serves the static résumé PDF from the résumé page", async ({
		page,
		request,
	}) => {
		await page.goto("/resume/");
		await expect(
			page.getByRole("link", { name: /Download résumé PDF/i }),
		).toHaveAttribute("href", "/downloads/joe-poznanski-resume.pdf");

		const response = await request.get("/downloads/joe-poznanski-resume.pdf");
		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("application/pdf");
	});

	test("keeps the résumé print-ready without global navigation chrome", async ({
		page,
	}) => {
		await page.goto("/resume/");
		await page.emulateMedia({ media: "print" });

		await expect(page.locator('[data-print-resume="true"]')).toBeVisible();
		await expect(page.locator(".site-header")).toHaveCSS("display", "none");
		await expect(page.locator(".site-footer")).toHaveCSS("display", "none");
		await expect(page.locator(".resume-download")).toHaveCSS("display", "none");
		await expect(page.locator("body")).toHaveCSS(
			"background-color",
			"rgb(255, 255, 255)",
		);
	});

	test("does not apply résumé print hiding to Work", async ({ page }) => {
		await page.goto("/work/");
		await page.emulateMedia({ media: "print" });

		await expect(page.locator("body")).not.toHaveClass(/resume-print-route/);
		await expect(page.locator(".site-header")).not.toHaveCSS("display", "none");
		await expect(page.locator(".site-footer")).not.toHaveCSS("display", "none");
	});

	test("labels all Work hierarchy links uniquely", async ({ page }) => {
		await page.goto("/work/");

		const links = await page
			.locator(
				"[data-flagship-work] h2 a, [data-supporting-work] h2 a, [data-archive-work] h3 a",
			)
			.evaluateAll((elements) =>
				elements.map((element) => ({
					href: element.getAttribute("href"),
					label: element.textContent?.trim(),
				})),
			);
		expect(links).toHaveLength(6);
		expect(new Set(links.map((link) => link.href)).size).toBe(6);
		expect(new Set(links.map((link) => link.label)).size).toBe(6);
	});
});

test.describe("Signal / Proof static shell @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const route of coreRoutes) {
		test(`keeps ${route.path} readable without JavaScript`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);

			expect(response?.status()).toBe(200);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("main")).toContainText(route.copy);
			await expect(
				page.locator(".noscript-banner, .static-fallback-note"),
			).toHaveCount(0);
			if (route.path === "/") {
				await expect(
					page.locator("[data-proof-placement]:visible"),
				).toHaveCount(4);
			}
		});
	}
});
