import { expect, test } from "@playwright/test";

async function routeContinuityState(page: import("@playwright/test").Page) {
	return page.evaluate(() => {
		const main = document.querySelector("main");
		const header = document.querySelector("header");

		return {
			headerTransitionName: header
				? getComputedStyle(header).viewTransitionName
				: "",
			mainTabIndex: main?.getAttribute("tabindex") ?? "",
			mainTransitionName: main ? getComputedStyle(main).viewTransitionName : "",
			routeContinuity: document.body.dataset.routeContinuity ?? "",
			supportsViewTransitions: CSS.supports("view-transition-name: route-main"),
		};
	});
}

async function viewTransitionRuleMedia(page: import("@playwright/test").Page) {
	return page.evaluate(() => {
		const mediaRules: string[] = [];

		function walkRules(rules: CSSRuleList, activeMedia: string[]) {
			for (const rule of Array.from(rules)) {
				if (rule.cssText.trim().startsWith("@view-transition")) {
					mediaRules.push(activeMedia.join(" && ") || "<none>");
				}

				if ("cssRules" in rule) {
					const media =
						rule instanceof CSSMediaRule ? rule.media.mediaText : "";
					walkRules(
						(rule as CSSGroupingRule).cssRules,
						media ? [...activeMedia, media] : activeMedia,
					);
				}
			}
		}

		for (const sheet of Array.from(document.styleSheets)) {
			try {
				walkRules(sheet.cssRules, []);
			} catch {
				// Ignore stylesheets the browser will not expose through CSSOM.
			}
		}

		return mediaRules;
	});
}

test.describe("route continuity @route-continuity @keyboard", () => {
	test("uses native page continuity without intercepting keyboard navigation", async ({
		page,
	}) => {
		await page.goto("/");

		const state = await routeContinuityState(page);
		expect(state.routeContinuity).toBe("native-view-transitions");
		expect(state.mainTabIndex).toBe("-1");

		if (state.supportsViewTransitions) {
			expect(state.headerTransitionName).toBe("route-chrome");
			expect(state.mainTransitionName).toBe("route-main");
		}

		await page
			.getByRole("navigation", { name: "Primary navigation" })
			.getByRole("link", { name: "Projects" })
			.focus();
		await page.keyboard.press("Enter");

		await expect(page).toHaveURL(/\/projects\/$/);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: /Project atlas for practical systems work/i,
			}),
		).toBeVisible();
		await expect(page.locator("main")).toContainText(
			"CLI Fleet Synchronization",
		);
	});

	test("removes named transitions when reduced motion is requested", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/");

		const state = await routeContinuityState(page);
		expect(state.routeContinuity).toBe("native-view-transitions");

		if (state.supportsViewTransitions) {
			expect(state.headerTransitionName).toBe("none");
			expect(state.mainTransitionName).toBe("none");
		}
	});

	test("only opts into browser page transitions for no-preference users", async ({
		page,
	}) => {
		await page.goto("/");

		expect(await viewTransitionRuleMedia(page)).toContain(
			"(prefers-reduced-motion: no-preference)",
		);
	});
});
