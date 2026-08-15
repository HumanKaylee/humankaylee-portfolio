import { readFileSync, readdirSync } from "node:fs";
import { expect, test } from "@playwright/test";

type RedirectRule = {
	source: string;
	destination: string;
	status: string;
};

function redirectRules(): RedirectRule[] {
	return readFileSync("apps/web/public/_redirects", "utf8")
		.split(/\r?\n/)
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith("#"))
		.map((line) => {
			const [source, destination, status] = line.split(/\s+/);
			return { source, destination, status };
		});
}

function frontmatterValue(content: string, key: string) {
	return content.match(new RegExp(`^${key}:\\s*"([^"]+)"`, "m"))?.[1] ?? "";
}

function publishedProjectSlugs() {
	return readdirSync("apps/web/src/content/projects")
		.filter((name) => name.endsWith(".json"))
		.map((name) =>
			JSON.parse(readFileSync(`apps/web/src/content/projects/${name}`, "utf8")),
		)
		.filter((entry) => entry.publicationStatus === "publish")
		.map((entry) => entry.slug as string);
}

function publishedFrontmatterSlugs(directory: string) {
	return readdirSync(directory)
		.filter((name) => name.endsWith(".md"))
		.map((name) => readFileSync(`${directory}/${name}`, "utf8"))
		.filter(
			(content) => frontmatterValue(content, "publicationStatus") === "publish",
		)
		.map((content) => frontmatterValue(content, "slug"));
}

function normalizedRoute(path: string) {
	return path.endsWith("/") ? path : `${path}/`;
}

function effectiveRedirect(rules: RedirectRule[], requestPath: string) {
	for (const rule of rules) {
		const wildcardIndex = rule.source.indexOf("*");
		if (wildcardIndex === -1) {
			if (rule.source === requestPath) {
				return rule.destination;
			}
			continue;
		}

		const prefix = rule.source.slice(0, wildcardIndex);
		const suffix = rule.source.slice(wildcardIndex + 1);
		if (!requestPath.startsWith(prefix) || !requestPath.endsWith(suffix)) {
			continue;
		}

		const splat = requestPath.slice(
			prefix.length,
			requestPath.length - suffix.length,
		);
		return rule.destination.replace(":splat", splat);
	}

	return undefined;
}

test.describe("route continuity @route-continuity @keyboard", () => {
	test("keeps keyboard navigation on the canonical Work route", async ({
		page,
	}) => {
		await page.goto("/");

		const workLink = page
			.getByRole("navigation", { name: "Primary navigation" })
			.getByRole("link", { name: "Work" });
		await workLink.focus();
		await page.keyboard.press("Enter");

		await expect(page).toHaveURL(/\/work\/$/);
		await expect(
			page.getByRole("heading", {
				level: 1,
				name: "Systems made legible through proof.",
			}),
		).toBeVisible();
		await expect(page.locator("main")).toContainText(
			"Cryogenic Flow Simulation",
		);
	});

	test("orders historical fallbacks before migrated-slug wildcards", () => {
		const rules = redirectRules();

		expect(rules).toEqual(
			expect.arrayContaining([
				{ source: "/projects", destination: "/work/", status: "301" },
				{ source: "/projects/", destination: "/work/", status: "301" },
				{
					source: "/projects/*",
					destination: "/work/:splat",
					status: "301",
				},
				{ source: "/case-studies", destination: "/work/", status: "301" },
				{ source: "/case-studies/", destination: "/work/", status: "301" },
				{
					source: "/case-studies/*",
					destination: "/work/:splat",
					status: "301",
				},
			]),
		);

		const workSlugs = new Set(
			publishedFrontmatterSlugs("apps/web/src/content/work"),
		);
		const historyByFamily = {
			projects: publishedProjectSlugs(),
			"case-studies": publishedFrontmatterSlugs(
				"apps/web/src/content/case-studies",
			),
		};

		for (const [family, slugs] of Object.entries(historyByFamily)) {
			const wildcardIndex = rules.findIndex(
				(rule) => rule.source === `/${family}/*`,
			);
			expect(wildcardIndex, `${family} wildcard must exist`).toBeGreaterThan(
				-1,
			);

			for (const slug of slugs.filter((slug) => !workSlugs.has(slug))) {
				for (const suffix of ["", "/"]) {
					const source = `/${family}/${slug}${suffix}`;
					const explicitIndex = rules.findIndex(
						(rule) => rule.source === source,
					);
					expect(
						explicitIndex,
						`${source} needs an explicit fallback`,
					).toBeGreaterThan(-1);
					const explicitRule = rules[explicitIndex];
					expect(
						explicitRule.destination,
						`${source} fallback destination`,
					).toBe("/work/");
					expect(explicitRule.status, `${source} fallback permanence`).toBe(
						"301",
					);
					expect(
						explicitIndex,
						`${source} fallback must precede /${family}/*`,
					).toBeLessThan(wildcardIndex);
				}
			}
		}
	});

	test("sends every historically published route to an existing Work destination", async ({
		request,
	}) => {
		const rules = redirectRules();
		const workDestinations = new Set([
			"/work/",
			...publishedFrontmatterSlugs("apps/web/src/content/work").map(
				(slug) => `/work/${slug}/`,
			),
		]);
		const historicalRoutes = [
			...publishedProjectSlugs().flatMap((slug) => [
				`/projects/${slug}`,
				`/projects/${slug}/`,
			]),
			...publishedFrontmatterSlugs("apps/web/src/content/case-studies").flatMap(
				(slug) => [`/case-studies/${slug}`, `/case-studies/${slug}/`],
			),
		];

		for (const legacyPath of historicalRoutes) {
			const destination = effectiveRedirect(rules, legacyPath);
			expect(destination, `${legacyPath} must redirect`).toBeDefined();
			expect(destination, `${legacyPath} must not loop`).not.toBe(legacyPath);

			const normalizedDestination = normalizedRoute(destination ?? "");
			expect(
				workDestinations,
				`${legacyPath} resolves to missing ${normalizedDestination}`,
			).toContain(normalizedDestination);
			expect((await request.get(normalizedDestination)).status()).toBe(200);
		}

		for (const rule of rules) {
			expect(rule.destination, `${rule.source} must not loop`).not.toBe(
				rule.source,
			);
			expect(
				rule.source,
				"canonical Work routes must not redirect",
			).not.toMatch(/^\/work(?:\/|$)/);
		}
	});
});
