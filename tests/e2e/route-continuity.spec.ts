import { readFileSync } from "node:fs";
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

	test("permanently redirects legacy detail and index routes without loops", () => {
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
