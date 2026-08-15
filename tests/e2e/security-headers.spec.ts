import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const launchRoutes = [
	"/",
	"/work/",
	"/work/cryo-flow-sim/",
	"/about/",
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
		"script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval'",
		"connect-src 'self'",
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

function staticContentSecurityPolicy() {
	const headers = readFileSync("apps/web/public/_headers", "utf8");
	const policy = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1];

	if (!policy) {
		throw new Error("_headers must define Content-Security-Policy");
	}

	return policy;
}

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

			expect(response.headers()["content-security-policy"]).not.toContain(
				"api.humankaylee.dev",
			);
		});
	}

	test("keeps middleware and static-host CSP semantics identical", async ({
		request,
	}) => {
		const response = await request.get("/");
		const middlewarePolicy = response.headers()["content-security-policy"];

		expect(middlewarePolicy).toBe(staticContentSecurityPolicy());
	});
});
