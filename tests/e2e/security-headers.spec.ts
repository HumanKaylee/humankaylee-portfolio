import { expect, test } from "@playwright/test";

const launchRoutes = [
	"/",
	"/projects/",
	"/case-studies/cli-fleet-synchronization-and-mcp-rollout/",
	"/resume/",
	"/notes/",
	"/contact/",
];

const expectedHeaders = {
	"content-security-policy": [
		"default-src 'self'",
		"base-uri 'self'",
		"object-src 'none'",
		"frame-ancestors 'none'",
		"form-action 'self' mailto:",
	],
	"cross-origin-opener-policy": ["same-origin"],
	"cross-origin-resource-policy": ["same-origin"],
	"permissions-policy": [
		"camera=()",
		"microphone=()",
		"geolocation=()",
		"payment=()",
	],
	"referrer-policy": ["strict-origin-when-cross-origin"],
	"x-content-type-options": ["nosniff"],
	"x-frame-options": ["DENY"],
};

test.describe("security headers @security", () => {
	for (const route of launchRoutes) {
		test(`serves launch security headers on ${route}`, async ({ request }) => {
			const response = await request.get(route);

			expect(response.status(), route).toBe(200);

			for (const [headerName, expectedFragments] of Object.entries(
				expectedHeaders,
			)) {
				const headerValue = response.headers()[headerName];

				expect(headerValue, `${route} missing ${headerName}`).toBeDefined();
				for (const fragment of expectedFragments) {
					expect(
						headerValue,
						`${route} ${headerName} missing ${fragment}`,
					).toContain(fragment);
				}
			}
		});
	}
});
