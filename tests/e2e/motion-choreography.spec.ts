import { type Page, expect, test } from "@playwright/test";

const caseStudyRoute =
	"/case-studies/cli-fleet-synchronization-and-mcp-rollout/";
const revealSelector = ".case-study-section, .evidence-drawer";

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

async function readRevealStates(page: Page) {
	return page.locator(revealSelector).evaluateAll((elements) =>
		elements.map((element) => {
			const computed = getComputedStyle(element);
			const rect = element.getBoundingClientRect();

			return {
				animationDuration: computed.animationDuration,
				animationName: computed.animationName,
				opacity: Number.parseFloat(computed.opacity),
				visible:
					rect.width > 0 &&
					rect.height > 0 &&
					computed.display !== "none" &&
					computed.visibility !== "hidden",
			};
		}),
	);
}

test.describe("purposeful motion @motion", () => {
	test("adds restrained evidence reveal motion when motion is allowed", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "no-preference" });
		await page.goto(caseStudyRoute);

		const states = await readRevealStates(page);

		expect(states.length).toBeGreaterThan(6);
		expect(states.every((state) => state.visible)).toBe(true);
		expect(states.every((state) => state.opacity >= 0.82)).toBe(true);
		expect(
			states.every((state) =>
				state.animationName.split(",").some((name) => name.includes("atelier")),
			),
		).toBe(true);
		expect(
			states.every((state) =>
				state.animationDuration
					.split(",")
					.some((duration) => toMilliseconds(duration) >= 240),
			),
		).toBe(true);
	});

	test("suppresses reveal animation for reduced-motion users", async ({
		page,
	}) => {
		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto(caseStudyRoute);

		const states = await readRevealStates(page);

		expect(states.length).toBeGreaterThan(6);
		expect(states.every((state) => state.visible)).toBe(true);
		expect(states.every((state) => state.opacity >= 0.82)).toBe(true);
		expect(
			states.every((state) =>
				state.animationDuration
					.split(",")
					.every((duration) => toMilliseconds(duration) <= 0.001),
			),
		).toBe(true);
	});
});

test.describe("purposeful motion @motion @noscript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps reveal-targeted content visible without JavaScript", async ({
		page,
	}) => {
		await page.goto(caseStudyRoute);

		const states = await readRevealStates(page);

		expect(states.length).toBeGreaterThan(6);
		expect(states.every((state) => state.visible)).toBe(true);
		expect(states.every((state) => state.opacity >= 0.82)).toBe(true);
	});
});
