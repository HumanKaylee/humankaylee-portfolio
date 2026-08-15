import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const coreRoutes = [
	{
		path: "/",
		marker: /practical AI-assisted systems/i,
	},
	{
		path: "/projects/",
		marker: /CLI Fleet Synchronization/i,
	},
	{
		path: "/case-studies/",
		marker: /reviewed is not approved/i,
	},
	{
		path: "/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		marker: /sanitized rollout matrix/i,
	},
	{
		path: "/case-studies/remote-workstation-recovery-and-operational-debugging/",
		marker: /public-safe narrative/i,
	},
	{
		path: "/case-studies/humankaylee-portfolio-build/",
		marker: /static-first architecture/i,
	},
	{
		path: "/case-studies/creative-web-systems-atlas-demo/",
		marker: /semantic project atlas fallback/i,
	},
	{
		path: "/resume/",
		marker: /Download full resume \(PDF\)/i,
	},
	{
		path: "/notes/",
		marker: /build decisions/i,
	},
	{
		path: "/contact/",
		marker: /fastest route is direct email/i,
	},
];

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

test.describe("quality @quality @noscript", () => {
	test.use({ javaScriptEnabled: false });

	for (const route of coreRoutes) {
		test(`keeps ${route.path} useful without JavaScript`, async ({ page }) => {
			await page.goto(route.path);

			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("main")).toContainText(route.marker);
			await expect(page.locator(".noscript-banner")).toBeVisible();
		});
	}
});

test.describe("quality @quality @reduced-motion", () => {
	for (const route of coreRoutes) {
		test(`keeps ${route.path} readable and minimizes motion`, async ({
			page,
		}) => {
			await page.emulateMedia({ reducedMotion: "reduce" });
			await page.goto(route.path);

			await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
			await expect(page.locator("main")).toContainText(route.marker);

			const motionState = await page.evaluate(() => {
				const candidates = [
					document.documentElement,
					document.body,
					...Array.from(document.querySelectorAll("a, .project-card, main")),
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

test.describe("quality @quality", () => {
	for (const route of coreRoutes) {
		test(`has no serious or critical accessibility violations on ${route.path} @accessibility`, async ({
			page,
		}) => {
			await page.goto(route.path);

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
			await page.goto(route.path);

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
