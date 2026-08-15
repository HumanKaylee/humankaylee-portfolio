import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const coreRoutes = [
	{ path: "/", marker: /Three systems\. Three kinds of proof/i },
	{ path: "/work/", marker: /Flagship work/i },
	{ path: "/work/cryo-flow-sim/", marker: /92 tests passed/i },
	{
		path: "/work/cli-fleet-synchronization-and-mcp-rollout/",
		marker: /Verification matrix/i,
	},
	{
		path: "/work/remote-workstation-recovery-and-operational-debugging/",
		marker: /Layered triage matrix/i,
	},
	{ path: "/about/", marker: /Operating principles/i },
	{ path: "/resume/", marker: /Agentic AI & automation highlights/i },
	{ path: "/notes/", marker: /Black-Scholes/i },
	{ path: "/contact/", marker: /Useful context to include/i },
] as const;

const privateContentPatterns = [
	{ label: "private Linux home path", pattern: /\/home\/joe/i },
	{ label: "private macOS user path", pattern: /\/Users\/[^/\s"'<>]+/i },
	{ label: "private Windows user path", pattern: /[A-Z]:\\Users\\/i },
	{
		label: "Tailscale private IP",
		pattern: /100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+/,
	},
	{
		label: "known private hostname",
		pattern: /\b(?:ares-tron|rog-strix-joe|bigmac\d+)\b/i,
	},
	{ label: "known private Wi-Fi name", pattern: /\bRubyPalace(?:-B)?\b/i },
	{
		label: "token assignment",
		pattern:
			/\b(?:api[_-]?key|token|secret)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}/i,
	},
	{
		label: "password assignment",
		pattern: /\bpassword\s*[:=]\s*["']?\S{8,}/i,
	},
];

function toMilliseconds(duration: string) {
	const trimmed = duration.trim();

	if (trimmed.endsWith("ms")) {
		return Number.parseFloat(trimmed);
	}

	if (trimmed.endsWith("s")) {
		return Number.parseFloat(trimmed) * 1000;
	}

	return Number.parseFloat(trimmed) || 0;
}

test.describe("Signal / Proof quality @quality @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const route of coreRoutes) {
		test(`keeps ${route.path} useful without JavaScript`, async ({ page }) => {
			const response = await page.goto(route.path);

			expect(response?.status()).toBe(200);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("main")).toContainText(route.marker);
			await expect(
				page.locator(".noscript-banner, .static-fallback-note"),
			).toHaveCount(0);
			if (route.path === "/") {
				await expect(page.locator("[data-stage-panel]:visible")).toHaveCount(3);
			}
		});
	}
});

test.describe("Signal / Proof quality @quality @reduced-motion", () => {
	for (const route of coreRoutes) {
		test(`keeps ${route.path} readable and minimizes motion`, async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: "reduce" });
			const response = await page.goto(route.path);

			expect(response?.status()).toBe(200);
			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("main")).toContainText(route.marker);

			const motionState = await page.evaluate(() => {
				const candidates = [
					document.documentElement,
					document.body,
					...Array.from(
						document.querySelectorAll("a, button, [data-project-stage], main"),
					),
				];
				const durations = candidates.flatMap((element) => {
					const styles = getComputedStyle(element);
					return [
						...styles.transitionDuration.split(","),
						...styles.animationDuration.split(","),
					];
				});

				return {
					matchesReducedMotion: matchMedia("(prefers-reduced-motion: reduce)")
						.matches,
					scrollBehavior: getComputedStyle(document.documentElement)
						.scrollBehavior,
					durations,
				};
			});

			expect(motionState.matchesReducedMotion).toBe(true);
			expect(motionState.scrollBehavior).toBe("auto");
			expect(
				motionState.durations.every(
					(duration) => toMilliseconds(duration) <= 0.001,
				),
			).toBe(true);
		});
	}
});

test.describe("Signal / Proof quality @quality", () => {
	for (const route of coreRoutes) {
		test(`has no serious or critical accessibility violations on ${route.path} @accessibility`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);
			expect(response?.status()).toBe(200);

			const accessibilityScanResults = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
				.analyze();
			const launchBlockingViolations =
				accessibilityScanResults.violations.filter((violation) =>
					["serious", "critical"].includes(violation.impact ?? ""),
				);

			expect(launchBlockingViolations).toEqual([]);
		});
	}

	for (const route of coreRoutes) {
		test(`does not expose private content in rendered ${route.path}`, async ({
			page,
		}) => {
			const response = await page.goto(route.path);
			expect(response?.status()).toBe(200);

			const rendered = await page.locator("body").innerText();
			const publicAttributes = await page
				.locator("a[href], meta[content], link[href]")
				.evaluateAll((elements) =>
					elements
						.map(
							(element) =>
								element.getAttribute("href") ??
								element.getAttribute("content") ??
								"",
						)
						.join("\n"),
				);
			const scannedContent = `${rendered}\n${publicAttributes}`;

			for (const { label, pattern } of privateContentPatterns) {
				expect(scannedContent, `${route.path} exposed ${label}`).not.toMatch(
					pattern,
				);
			}
		});
	}
});
