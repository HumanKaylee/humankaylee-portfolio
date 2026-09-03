import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const allPublishedWork = [
	{ title: "Cryogenic Flow Simulation", slug: "cryo-flow-sim" },
	{
		title: "Conformal Cooling Channel Generation",
		slug: "conformal-cooling-channel-generation",
	},
	{
		title: "X-Plane Cabin Camera FOV Trade Study",
		slug: "xplane-cabin-camera-fov-trade-study",
	},
	{
		title: "OpenXHC: Reverse-Engineering a CNC Motion Interface",
		slug: "openxhc-linuxcnc",
	},
	{
		title:
			"Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation",
		slug: "mac-mini-shelf",
	},
	{
		title: "Black-Scholes Options Pricer in Rust and WASM",
		slug: "black-scholes-wasm",
	},
	{
		title: "CLI Fleet Synchronization",
		slug: "cli-fleet-synchronization-and-mcp-rollout",
	},
	{
		title: "Remote Workstation Recovery",
		slug: "remote-workstation-recovery-and-operational-debugging",
	},
] as const;

const nonBlackScholesWork = allPublishedWork.filter(
	(work) => work.slug !== "black-scholes-wasm",
);

const detailHeadings = [
	"The situation",
	"Constraints",
	"My responsibility",
	"The system",
	"Critical decisions",
	"Proof",
	"Reflection",
] as const;

const internalWorkCopy =
	/PR evidence|approval pass|launch approval|approval checklist|production launch|deployment status|fallback mode|API health|launch readiness|openItems|redaction status|redaction review/i;

test.describe("Work routes @work", () => {
	test("separates flagship, supporting, and archive work while preserving every route", async ({
		page,
		request,
	}) => {
		await page.goto("/work/");

		await expect(page.locator("[data-flagship-work] article")).toHaveCount(2);
		await expect(page.locator("[data-flagship-work] .signal-link")).toHaveText([
			"Read the case study",
			"Read the case study",
		]);
		await expect(page.locator("[data-supporting-work] article")).toHaveCount(3);
		await expect(page.locator("[data-archive-work] article")).toHaveCount(2);
		await expect(page.locator("[data-flagship-work]")).toContainText(
			"Cryogenic Flow Simulation",
		);
		await expect(page.locator("[data-flagship-work]")).toContainText(
			"Conformal Cooling Channel Generation",
		);
		await expect(page.locator("[data-supporting-work] article h2")).toHaveText([
			"X-Plane Cabin Camera FOV Trade Study",
			"OpenXHC: Reverse-Engineering a CNC Motion Interface",
			"Black-Scholes Options Pricer in Rust and WASM",
		]);
		await expect(page.locator("[data-archive-work]")).toContainText(
			"CLI Fleet Synchronization",
		);
		await expect(page.locator("[data-archive-work]")).toContainText(
			"Remote Workstation Recovery",
		);
		await expect(page.locator("main")).not.toContainText(
			/unexpected clamp events/i,
		);
		await expect(page.locator("main")).toContainText(
			/cooling passages.*injection-mold cavity/i,
		);
		await expect(page.locator("main")).toContainText(
			/metal additive manufacturing/i,
		);

		for (const path of [
			"/work/cryo-flow-sim/",
			"/work/conformal-cooling-channel-generation/",
			"/work/xplane-cabin-camera-fov-trade-study/",
			"/work/openxhc-linuxcnc/",
			"/work/black-scholes-wasm/",
			"/work/cli-fleet-synchronization-and-mcp-rollout/",
			"/work/remote-workstation-recovery-and-operational-debugging/",
		]) {
			expect((await request.get(path)).status(), path).toBe(200);
		}
	});

	test("keeps prior launch-review phrases inside the visitor-copy guard", () => {
		const missedPhrases = ["launch approval", "approval checklist"].filter(
			(phrase) => !internalWorkCopy.test(phrase),
		);

		expect(missedPhrases).toEqual([]);
	});

	test("renders the approved work hierarchy with distinct visual weight", async ({
		page,
	}) => {
		const response = await page.goto("/work/");

		expect(response?.status()).toBe(200);
		await expect(page.locator("[data-flagship-work] h2")).toHaveText([
			"Cryogenic Flow Simulation",
			"Conformal Cooling Channel Generation",
		]);
		await expect(page.locator("[data-flagship-work] article")).toHaveCount(2);
		await expect(page.locator("[data-supporting-work] article")).toHaveCount(3);
		await expect(page.locator("[data-supporting-work] article h2")).toHaveText([
			"X-Plane Cabin Camera FOV Trade Study",
			"OpenXHC: Reverse-Engineering a CNC Motion Interface",
			"Black-Scholes Options Pricer in Rust and WASM",
		]);
		await expect(
			page.locator("[data-supporting-work]").getByRole("link", {
				name: "OpenXHC: Reverse-Engineering a CNC Motion Interface",
			}),
		).toHaveAttribute("href", "/work/openxhc-linuxcnc/");
		await expect(
			page.locator("[data-supporting-work]").getByRole("link", {
				name: "X-Plane Cabin Camera FOV Trade Study",
			}),
		).toHaveAttribute("href", "/work/xplane-cabin-camera-fov-trade-study/");
		await expect(
			page.locator("[data-supporting-work]").getByRole("link", {
				name: "Black-Scholes Options Pricer in Rust and WASM",
			}),
		).toHaveAttribute("href", "/work/black-scholes-wasm/");
		await expect(page.locator("[data-flagship-work]")).not.toContainText(
			/Black-Scholes/i,
		);
		await expect(page.locator("[data-archive-work] h3")).toHaveText([
			"CLI Fleet Synchronization",
			"Remote Workstation Recovery",
		]);
		await expect(page.locator("main")).not.toContainText(internalWorkCopy);
	});

	test("renders every complete published narrative and a cyclic next transition", async ({
		page,
	}) => {
		const expectedNext = [
			"Conformal Cooling Channel Generation",
			"X-Plane Cabin Camera FOV Trade Study",
			"OpenXHC: Reverse-Engineering a CNC Motion Interface",
			"Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation",
			"Black-Scholes Options Pricer in Rust and WASM",
			"CLI Fleet Synchronization",
			"Remote Workstation Recovery",
			"Cryogenic Flow Simulation",
		] as const;

		for (const [index, work] of allPublishedWork.entries()) {
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

		for (const work of allPublishedWork) {
			await page.goto(`/work/${work.slug}/`);
			await expect(page.locator("main")).not.toContainText(internalWorkCopy);
		}
	});

	test("presents the Mac mini shelf as bounded Agentic AI engineering evidence", async ({
		page,
	}) => {
		await page.goto("/work/mac-mini-shelf/");
		const main = page.locator("main");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Mac mini Wall Shelf: Agentic CAD, FEM, and Manufacturing Preparation",
			}),
		).toBeVisible();
		await expect(main).toContainText(/Joe defined the objective.*Agentic AI/i);
		await expect(page.locator("[data-shelf-agentic-loop] li")).toHaveCount(8);
		await expect(page.locator("[data-shelf-assumptions] tbody tr")).toHaveCount(
			8,
		);
		await expect(page.locator("[data-shelf-fem-matrix] tbody tr")).toHaveCount(
			4,
		);
		await expect(main).toContainText(/0\.064 mm.*1\.42 MPa.*3\.5x/is);
		await expect(main).toContainText(/exaggerated deformation/i);
		await expect(main).toContainText(
			/Physical print, installation, and load testing were not verified/i,
		);
		await expect(main).not.toContainText(
			/successfully printed|installed and tested|production-ready|safe load/i,
		);
	});

	test("renders the shelf process component only for the shelf slug", async ({
		page,
	}) => {
		for (const work of allPublishedWork) {
			await page.goto(`/work/${work.slug}/`);
			await expect(page.locator("[data-mac-mini-shelf-process]")).toHaveCount(
				work.slug === "mac-mini-shelf" ? 1 : 0,
			);
		}
	});

	test("presents OpenXHC as an offline codec foundation with authentic bounded proof", async ({
		page,
	}) => {
		await page.goto("/work/openxhc-linuxcnc/");

		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "OpenXHC: Reverse-Engineering a CNC Motion Interface",
			}),
		).toBeVisible();
		await expect(page.locator("main")).toContainText(/C\+\+20.*offline codec/i);
		await expect(page.locator("main")).toContainText(/2,490.*0 mismatches/i);
		await expect(page.locator("main")).toContainText(/0\.0005 mm/i);
		await expect(page.locator("main")).toContainText(/No USB writes/i);
		await expect(page.locator("main")).not.toContainText(
			/complete LinuxCNC driver|production-ready|closed-loop|real-time safe|Mach3 replacement/i,
		);

		const media = page.locator('[data-media-kind="video"]');
		const video = media.locator("video");
		await expect(video).toHaveAttribute(
			"poster",
			"/media/openxhc/openxhc-proof-loop-640.webp",
		);
		await expect(video.locator("source")).toHaveAttribute(
			"src",
			"/media/openxhc/openxhc-proof-loop.mp4",
		);
		await video.evaluate(async (element) => {
			const player = element as HTMLVideoElement;
			player.muted = true;
			await player.play();
		});
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).duration),
			)
			.toBeGreaterThan(9.9);
		await expect
			.poll(() =>
				video.evaluate((element) => (element as HTMLVideoElement).currentTime),
			)
			.toBeGreaterThan(0.05);
		await video.evaluate(
			(element) =>
				new Promise<void>((resolve) => {
					const player = element as HTMLVideoElement;
					player.addEventListener("seeked", () => resolve(), { once: true });
					player.currentTime = 5;
				}),
		);
		expect(
			await video.evaluate(
				(element) => (element as HTMLVideoElement).currentTime,
			),
		).toBeGreaterThan(4.9);
	});

	test("renders authentic Cryogenic media with opt-in playback and durable fallback context", async ({
		page,
	}) => {
		const requestedMedia: string[] = [];
		page.on("request", (request) => {
			if (request.url().includes("/media/cryo-flow-sim-stage1-")) {
				requestedMedia.push(new URL(request.url()).pathname);
			}
		});
		await page.route("**/media/cryo-flow-sim-stage1.mp4", (route) =>
			route.abort("failed"),
		);
		await page.goto("/work/cryo-flow-sim/");
		await expect(page.locator("main")).toContainText(/SVG\/HTML\/CSS/i);
		await expect(page.locator("main")).not.toContainText(/Three\.js/i);
		await expect(page.locator("main")).not.toContainText(
			/unexpected clamp events/i,
		);
		await expect(page.locator("main")).toContainText(
			/fixed seed.*measured validation thresholds/i,
		);

		const frame = page.locator('[data-media-kind="video"]');
		const video = frame.locator("video");
		await expect(video).toHaveAttribute("controls", "");
		await expect(video).toHaveAttribute("preload", "none");
		await expect(video).toHaveAttribute(
			"poster",
			"/media/cryo-flow-sim-stage1-640.webp",
		);
		expect(requestedMedia).toContain("/media/cryo-flow-sim-stage1-640.webp");
		expect(requestedMedia).not.toContain(
			"/media/cryo-flow-sim-stage1-poster.png",
		);
		await expect(frame.locator("figcaption")).toHaveText(
			"Deterministic Stage 1 capture at 1920 by 1080.",
		);
		const externalFallback = frame.getByRole("link", {
			name: "Open the project video",
		});
		await expect(externalFallback).toBeVisible();
		await expect(externalFallback).toHaveAttribute(
			"href",
			"/media/cryo-flow-sim-stage1.mp4",
		);
		await expect(video.getByRole("link")).toHaveCount(0);
	});

	test("renders the two Cryo scale proofs in their evidence order with native opt-in controls", async ({
		page,
		request,
	}) => {
		await page.goto("/work/cryo-flow-sim/");
		const evidence = page.locator(
			'.evidence-strip[aria-label="Cryogenic Flow Simulation verified evidence"]',
		);
		await expect(evidence.locator("dt")).toHaveText([
			"System scale",
			"Real-time runtime",
			"Deterministic replay",
		]);
		await expect(evidence.locator("strong")).toHaveText([
			"29,500 entities",
			"30 Hz",
			"1,800 frames",
		]);
		await expect(evidence).toContainText(
			"300 ticks in a 10-second normal window and 300 more after recovery",
		);
		await expect(evidence).toContainText("frame-budget headroom was 94%");
		await expect(evidence).toContainText("Byte-identical raw replay");
		await expect(evidence).not.toContainText(/92 passing|96\.9 seconds/i);
		await expect(page.locator("main")).toContainText(
			"spatial valve-command waves",
		);
		await expect(page.locator("main")).toContainText(
			"24.3% of label-excluded fleet pixels",
		);
		await expect(page.locator("main")).toContainText(
			"legacy 1.0% whole-percent comparator",
		);
		await expect(page.locator("main")).toContainText(
			"5.29 MB full JSON state snapshot",
		);
		await expect(page.locator("main")).toContainText(
			"6.8 KB representative warmed binary delta",
		);
		const engineeringEvidence = await request.get(
			"/media/cryo-flow-sim-scale/cryo-scale-engineering-evidence.json",
		);
		expect(engineeringEvidence.status()).toBe(200);
		expect((await engineeringEvidence.json()).transport).toMatchObject({
			full_json_state_snapshot: { tick: 61, bytes: 5293279 },
			representative_warmed_binary_delta: { bytes: 6798 },
			full_snapshot_to_delta_ratio: 778.7,
		});
		await expect(page.locator("main")).not.toContainText(
			/Rust workspace shipped 92|Test and quality results/i,
		);

		const gallery = page.locator("[data-case-study-media-gallery]");
		const items = gallery.locator("figure");
		await expect(items).toHaveCount(2);

		const videos = items.locator("video");
		await expect(videos).toHaveCount(2);
		const expectedVideos = [
			{
				src: "/media/cryo-flow-sim-scale/cryo-scale-deterministic-960.mp4",
				poster: "/media/cryo-flow-sim-scale/cryo-scale-deterministic-960.webp",
				alt: "Deterministic Cryogenic flow simulation showing spatial valve-command waves and actual tank, pipe, and sensor response across 29,500 generated entities.",
			},
			{
				src: "/media/cryo-flow-sim-scale/cryo-scale-realtime-960.mp4",
				poster: "/media/cryo-flow-sim-scale/cryo-scale-realtime-960.webp",
				alt: "Live Cryogenic flow simulator runtime moving from a normal 30 Hz window through deliberate stress and back to a 30 Hz recovery window.",
			},
		] as const;
		for (const [index, expectedVideo] of expectedVideos.entries()) {
			const item = items.nth(index);
			const video = videos.nth(index);
			await expect(item).toHaveAttribute("data-evidence-media-kind", "video");
			await expect(video.locator("source")).toHaveAttribute(
				"src",
				expectedVideo.src,
			);
			await expect(video).toHaveAttribute("poster", expectedVideo.poster);
			await expect(video).toHaveAttribute("width", "960");
			await expect(video).toHaveAttribute("height", "540");
			await expect(video).toHaveAttribute("aria-label", expectedVideo.alt);
			await expect(video).toHaveAttribute("controls", "");
			await expect(video).toHaveAttribute("preload", "none");
			await expect(video).not.toHaveAttribute("autoplay", "");
		}
		await expect(items.locator("figcaption")).toHaveText([
			"Deterministic offline proof of all 29,500 generated entities: spatial valve-command waves close, open, and restore cohorts while actual tank, pipe, and sensor state responds across the fleet.",
			"Live 60-second runtime proof: normal 30 Hz, deliberate stress degradation, then recovery to 30 Hz with zero dropped ticks in the recovery window.",
		]);
		await expect(items.nth(0)).not.toContainText(/live|real-time/i);
		const fallbackLinks = items.getByRole("link", {
			name: "Open the evidence video",
		});
		for (const [index, expectedVideo] of expectedVideos.entries()) {
			await expect(fallbackLinks.nth(index)).toHaveAttribute(
				"href",
				expectedVideo.src,
			);
		}
	});

	test("keeps both Cryo scale proofs contained at phone, tablet, and desktop widths", async ({
		page,
	}) => {
		for (const viewport of [
			{ width: 390, height: 844 },
			{ width: 820, height: 900 },
			{ width: 1440, height: 1000 },
		]) {
			await page.setViewportSize(viewport);
			await page.goto("/work/cryo-flow-sim/");
			const gallery = page.locator("[data-case-study-media-gallery]");
			await expect(gallery.locator("figure")).toHaveCount(2);
			expect(
				await page.evaluate(
					() => document.documentElement.scrollWidth - window.innerWidth,
				),
			).toBeLessThanOrEqual(1);
			for (const video of await gallery.locator("video").all()) {
				const box = await video.boundingBox();
				expect(box?.width ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(
					viewport.width,
				);
			}
		}
	});

	test("plays, seeks, and resumes each local Cryo scale proof", async ({
		page,
	}) => {
		await page.goto("/work/cryo-flow-sim/");
		const videos = page.locator("[data-case-study-media-gallery] video");
		await expect(videos).toHaveCount(2);

		for (const video of await videos.all()) {
			await video.scrollIntoViewIfNeeded();
			await video.evaluate(async (element) => {
				const media = element as HTMLVideoElement;
				media.muted = true;
				await media.play();
			});
			await expect
				.poll(() =>
					video.evaluate((element) => (element as HTMLVideoElement).duration),
				)
				.toBeGreaterThan(59);
			await expect
				.poll(() =>
					video.evaluate(
						(element) => (element as HTMLVideoElement).currentTime,
					),
				)
				.toBeGreaterThan(0.05);
			await video.evaluate(
				(element) =>
					new Promise<void>((resolve) => {
						const media = element as HTMLVideoElement;
						media.addEventListener("seeked", () => resolve(), { once: true });
						media.currentTime = 30;
					}),
			);
			expect(
				await video.evaluate(
					(element) => (element as HTMLVideoElement).currentTime,
				),
			).toBeGreaterThan(29.5);
			await video.evaluate(async (element) => {
				await (element as HTMLVideoElement).play();
			});
			await expect
				.poll(() =>
					video.evaluate(
						(element) => (element as HTMLVideoElement).currentTime,
					),
				)
				.toBeGreaterThan(30.05);
		}
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
		await expect(
			page.locator("[data-case-study-media-gallery] video"),
		).toHaveCount(2);
		for (const video of await page
			.locator("[data-case-study-media-gallery] video")
			.all()) {
			await expect(video).not.toHaveAttribute("autoplay", "");
		}
	});

	test("maps the Black-Scholes demo only from its Work record", async ({
		page,
	}) => {
		for (const work of nonBlackScholesWork) {
			await page.goto(`/work/${work.slug}/`);
			await expect(page.locator(".bs-demo")).toHaveCount(0);
		}

		await page.goto("/work/black-scholes-wasm/");
		await expect(
			page.getByRole("heading", { name: "Black-Scholes live pricer" }),
		).toBeVisible();
		await expect(page.locator(".bs-demo")).toHaveCount(1);
	});

	test("defers Black-Scholes assets until visible, then initializes and reprices", async ({
		page,
	}) => {
		const apiRequests: string[] = [];
		const wasmAssetRequests: string[] = [];
		const runtimeErrors: string[] = [];
		page.on("request", (request) => {
			if (request.url().includes("/api/")) apiRequests.push(request.url());
			const pathname = new URL(request.url()).pathname;
			if (pathname.startsWith("/wasm/blackscholes/")) {
				wasmAssetRequests.push(pathname);
			}
		});
		page.on("pageerror", (error) => runtimeErrors.push(error.message));
		page.on("console", (message) => {
			if (message.type() === "error" || message.type() === "warning") {
				runtimeErrors.push(message.text());
			}
		});

		await page.goto("/work/black-scholes-wasm/", { waitUntil: "networkidle" });
		const demo = page.locator(".bs-demo");
		const controls = page.locator("#bs-controls");
		const price = page.locator("#bs-price");

		expect(
			await demo.evaluate(
				(element) => element.getBoundingClientRect().top >= window.innerHeight,
			),
			"the demo starts below the viewport",
		).toBe(true);
		expect(wasmAssetRequests).toEqual([]);
		await expect(controls).toHaveAttribute("aria-hidden", "true");
		await expect(controls).toHaveAttribute("inert", "");

		await demo.scrollIntoViewIfNeeded();
		await expect(controls).not.toHaveAttribute("aria-hidden", "true");
		await expect(controls).not.toHaveAttribute("inert", "");
		await expect(price).toHaveText(/^\$\d+\.\d{4}$/);
		expect(wasmAssetRequests).toEqual([
			"/wasm/blackscholes/blackscholes_wasm.js",
			"/wasm/blackscholes/blackscholes_wasm_bg.wasm",
		]);
		const initialPrice = await price.textContent();

		await page.locator("#bs-spot").fill("110");
		await expect(price).not.toHaveText(initialPrice ?? "");
		await expect(price).toHaveText(/^\$\d+\.\d{4}$/);
		expect(apiRequests).toEqual([]);
		expect(runtimeErrors).toEqual([]);
	});

	test("keeps the static Black-Scholes fallback when visible WASM loading fails", async ({
		page,
	}) => {
		await page.route("**/wasm/blackscholes/*.wasm", (route) =>
			route.abort("failed"),
		);
		await page.goto("/work/black-scholes-wasm/", {
			waitUntil: "networkidle",
		});

		await page.locator(".bs-demo").scrollIntoViewIfNeeded();
		await expect(page.locator("#bs-no-wasm")).toBeVisible();
		await expect(page.locator("#bs-no-wasm")).toContainText(
			"Could not load WASM pricer",
		);
		await expect(page.locator("#bs-controls")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(page.locator("#bs-controls")).toHaveAttribute("inert", "");
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
			"/work/xplane-cabin-camera-fov-trade-study/",
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
		await expect(
			page.locator('[data-media-kind="video"] video[controls]'),
		).toHaveAttribute("preload", "none");
		await expect(
			page.locator("[data-case-study-media-gallery] figure"),
		).toHaveCount(2);
		for (const video of await page
			.locator("[data-case-study-media-gallery] video")
			.all()) {
			await expect(video).toHaveAttribute("preload", "none");
		}
		await expect(page.locator("[data-reading-progress]")).toHaveAttribute(
			"aria-hidden",
			"true",
		);
		await expect(
			page.getByRole("link", {
				name: "Next project: Conformal Cooling Channel Generation",
			}),
		).toBeVisible();
	});
});
