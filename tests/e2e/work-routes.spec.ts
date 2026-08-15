import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const flagshipWork = [
	{ title: "Cryogenic Flow Simulation", slug: "cryo-flow-sim" },
	{
		title: "CLI Fleet Synchronization",
		slug: "cli-fleet-synchronization-and-mcp-rollout",
	},
	{
		title: "Remote Workstation Recovery",
		slug: "remote-workstation-recovery-and-operational-debugging",
	},
] as const;

const detailHeadings = [
	"The situation",
	"Constraints",
	"My responsibility",
	"The system",
	"Critical decisions",
	"Proof",
	"Reflection",
] as const;

const allPublishedWork = [
	...flagshipWork,
	{
		title: "Black-Scholes Options Pricer in Rust and WASM",
		slug: "black-scholes-wasm",
	},
] as const;

const internalWorkCopy =
	/PR evidence|approval pass|launch approval|approval checklist|production launch|deployment status|fallback mode|API health|launch readiness|openItems|redaction/i;

test.describe("Work routes @work", () => {
	test("keeps prior launch-review phrases inside the visitor-copy guard", () => {
		const missedPhrases = ["launch approval", "approval checklist"].filter(
			(phrase) => !internalWorkCopy.test(phrase),
		);

		expect(missedPhrases).toEqual([]);
	});

	test("renders the three flagships in approved order and supporting work separately", async ({
		page,
	}) => {
		const response = await page.goto("/work/");

		expect(response?.status()).toBe(200);
		await expect(page.locator("[data-featured-work] h2")).toHaveText(
			flagshipWork.map((item) => item.title),
		);
		await expect(page.locator("[data-featured-work] article")).toHaveCount(3);
		await expect(page.locator("[data-supporting-work] article")).toHaveCount(1);
		await expect(
			page.locator("[data-supporting-work]").getByRole("link", {
				name: "Black-Scholes Options Pricer in Rust and WASM",
			}),
		).toHaveAttribute("href", "/work/black-scholes-wasm/");
		await expect(page.locator("[data-featured-work]")).not.toContainText(
			/Black-Scholes/i,
		);
		await expect(page.locator("main")).not.toContainText(internalWorkCopy);
	});

	test("renders every complete published narrative and a cyclic next transition", async ({
		page,
	}) => {
		const expectedNext = [
			"CLI Fleet Synchronization",
			"Remote Workstation Recovery",
			"Black-Scholes Options Pricer in Rust and WASM",
		] as const;

		for (const [index, work] of flagshipWork.entries()) {
			await page.goto(`/work/${work.slug}/`);
			await expect(
				page.getByRole("heading", { level: 1, name: work.title }),
			).toBeVisible();
			for (const heading of detailHeadings) {
				await expect(
					page.getByRole("heading", { level: 2, name: heading }),
				).toBeVisible();
			}
			await expect(
				page.locator(".proof-boundary dt").filter({ hasText: "Known limits" }),
			).toBeVisible();
			await expect(
				page.getByRole("link", {
					name: `Next project: ${expectedNext[index]}`,
				}),
			).toBeVisible();
		}

		await page.goto("/work/black-scholes-wasm/");
		await expect(
			page.getByRole("link", {
				name: "Next project: Cryogenic Flow Simulation",
			}),
		).toHaveAttribute("href", "/work/cryo-flow-sim/");

		for (const work of allPublishedWork) {
			await page.goto(`/work/${work.slug}/`);
			await expect(page.locator("main")).not.toContainText(internalWorkCopy);
		}
	});

	test("renders authentic Cryogenic media with opt-in playback and durable fallback context", async ({
		page,
	}) => {
		await page.route("**/media/cryo-flow-sim-stage1.mp4", (route) =>
			route.abort("failed"),
		);
		await page.goto("/work/cryo-flow-sim/");

		const frame = page.locator('[data-media-kind="video"]');
		const video = frame.locator("video");
		await expect(video).toHaveAttribute("controls", "");
		await expect(video).toHaveAttribute("preload", "none");
		await expect(video).toHaveAttribute(
			"poster",
			"/media/cryo-flow-sim-stage1-poster.png",
		);
		await expect(frame.locator("figcaption")).toHaveText(
			"Deterministic Stage 1 capture at 1920 by 1080.",
		);
		const externalFallback = frame.getByRole("link", {
			name: "Open the simulation video",
		});
		await expect(externalFallback).toBeVisible();
		await expect(externalFallback).toHaveAttribute(
			"href",
			"/media/cryo-flow-sim-stage1.mp4",
		);
		await expect(video.getByRole("link")).toHaveCount(0);
	});

	test("uses project-specific semantic evidence flows with record-backed values", async ({
		page,
	}) => {
		await page.goto("/work/cli-fleet-synchronization-and-mcp-rollout/");
		const fleetFlow = page.locator("[data-evidence-flow]");
		await expect(fleetFlow.locator("[data-evidence-step] strong")).toHaveText([
			"Inventory",
			"Registration",
			"Per-target verification",
			"Status matrix",
		]);
		await expect(fleetFlow.locator("[data-evidence-role] dt")).toHaveText([
			"Primary workstation account",
			"Alternate workstation account",
			"Unavailable or out-of-scope target",
		]);
		await expect(fleetFlow.locator("[data-evidence-role] dd")).toHaveText([
			"Passed",
			"Account-local",
			"Skipped or blocked",
		]);

		await page.goto(
			"/work/remote-workstation-recovery-and-operational-debugging/",
		);
		const recoveryFlow = page.locator("[data-evidence-flow]");
		await expect(
			recoveryFlow.locator("[data-evidence-step] strong"),
		).toHaveText([
			"Viewer",
			"Reachability",
			"Remote shell",
			"Role-local state",
			"Session continuity",
		]);
		await expect(recoveryFlow.locator("[data-evidence-role] dt")).toHaveText([
			"Reachability",
			"Role-local state",
			"Viewer behavior",
		]);
		await expect(recoveryFlow.locator("[data-evidence-role] dd")).toHaveText([
			"Continue below host-outage path",
			"Isolated",
			"Separated",
		]);
		await expect(recoveryFlow).not.toContainText(
			/dashboard|application window|terminal screenshot/i,
		);
	});

	test("initializes reading progress once, tears listeners down, and hides it for reduced motion", async ({
		page,
	}) => {
		await page.goto("/work/cryo-flow-sim/");
		const progress = page.locator("[data-reading-progress]");
		await expect(progress).toHaveAttribute(
			"data-reading-progress-state",
			"ready",
		);
		await expect(progress).toHaveAttribute(
			"data-reading-progress-initializations",
			"1",
		);
		await page.evaluate(() => dispatchEvent(new Event("pagehide")));
		await expect(progress).toHaveAttribute(
			"data-reading-progress-state",
			"stopped",
		);
		const stoppedWidth = await progress
			.locator("[data-reading-progress-value]")
			.evaluate((value) => (value as HTMLElement).style.width);
		await page.evaluate(() => {
			window.scrollTo(0, document.documentElement.scrollHeight);
			dispatchEvent(new Event("scroll"));
		});
		expect(
			await progress
				.locator("[data-reading-progress-value]")
				.evaluate((value) => (value as HTMLElement).style.width),
		).toBe(stoppedWidth);

		await page.emulateMedia({ reducedMotion: "reduce" });
		await page.goto("/work/cryo-flow-sim/");
		await expect(page.locator("[data-reading-progress]")).toBeHidden();
	});

	test("maps the Black-Scholes demo only from its Work record", async ({
		page,
	}) => {
		for (const work of flagshipWork) {
			await page.goto(`/work/${work.slug}/`);
			await expect(page.locator(".bs-demo")).toHaveCount(0);
		}

		await page.goto("/work/black-scholes-wasm/");
		await expect(
			page.getByRole("heading", { name: "Black-Scholes live pricer" }),
		).toBeVisible();
		await expect(page.locator(".bs-demo")).toHaveCount(1);
	});

	test("emits escaped item-specific CreativeWork JSON-LD with canonical Work URLs", async ({
		page,
	}) => {
		await page.goto("/work/cryo-flow-sim/");
		const scripts = await page
			.locator('script[type="application/ld+json"]')
			.allTextContents();
		const records = scripts.flatMap((source) => JSON.parse(source));
		const work = records.find(
			(record: { "@type"?: string }) => record["@type"] === "CreativeWork",
		);

		expect(work).toMatchObject({
			"@type": "CreativeWork",
			name: "Cryogenic Flow Simulation",
			url: "https://joepoznanski.io/work/cryo-flow-sim/",
		});
		expect(JSON.stringify(work)).not.toMatch(
			/redaction|openItems|checklistStatus|approvalEvidence/i,
		);
	});

	test("keeps the Work index and semantic detail responsive, accessible, and touch-ready", async ({
		page,
	}) => {
		for (const path of [
			"/work/",
			"/work/cli-fleet-synchronization-and-mcp-rollout/",
		]) {
			for (const viewport of [
				{ width: 390, height: 844 },
				{ width: 1440, height: 1000 },
			]) {
				await page.setViewportSize(viewport);
				expect((await page.goto(path))?.status()).toBe(200);
				expect(
					await page.evaluate(
						() => document.documentElement.scrollWidth - window.innerWidth,
					),
				).toBeLessThanOrEqual(1);

				const touchTargets = page.locator('main [data-touch-target="true"]');
				expect(await touchTargets.count()).toBeGreaterThan(0);
				for (const target of await touchTargets.all()) {
					const box = await target.boundingBox();
					expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
					expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
				}
			}

			const accessibility = await new AxeBuilder({ page })
				.withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
				.analyze();
			expect(
				accessibility.violations.filter((violation) =>
					["serious", "critical"].includes(violation.impact ?? ""),
				),
			).toEqual([]);
		}
	});

	test("does not publish blocked candidates, old public routes, or unknown Work slugs", async ({
		request,
	}) => {
		for (const path of [
			"/work/youtube-ai-video-pipeline/",
			"/work/kalshi-migration-or-analytics-tooling/",
			"/work/not-a-real-project/",
			"/projects/",
			"/projects/cli-fleet-synchronization-and-mcp-rollout/",
			"/case-studies/",
			"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
		]) {
			expect((await request.get(path)).status(), path).toBe(404);
		}

		const unknownWork = await request.get("/work/not-a-real-project/");
		expect(await unknownWork.text()).toMatch(
			/<h1><span class="statusCode">404:\s*<\/span>\s*<span class="statusMessage">Not found<\/span><\/h1>/,
		);
		expect(await unknownWork.text()).toContain(
			"Path: /work/not-a-real-project/",
		);
	});
});

test.describe("Work routes @work @noscript", () => {
	test.use({ javaScriptEnabled: false });

	test("keeps the complete case study and native media readable without JavaScript", async ({
		page,
	}) => {
		await page.goto("/work/cryo-flow-sim/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Cryogenic Flow Simulation",
			}),
		).toBeVisible();
		for (const heading of detailHeadings) {
			await expect(
				page.getByRole("heading", { level: 2, name: heading }),
			).toBeVisible();
		}
		await expect(page.locator("video[controls]")).toHaveAttribute(
			"preload",
			"none",
		);
		await expect(page.locator("[data-reading-progress]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(
			page.getByRole("link", {
				name: "Next project: CLI Fleet Synchronization",
			}),
		).toBeVisible();
	});
});
