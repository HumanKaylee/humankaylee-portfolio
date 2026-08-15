import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const files = {
	decisions: "runbooks/HUMAN_DECISIONS_QUEUE.md",
	fly: "apps/api/fly.toml",
	headers: "apps/web/public/_headers",
	middleware: "apps/web/src/middleware.ts",
	wrangler: "wrangler.toml",
};
const allowedContactDeliveryModes = new Set(["disabled", "store"]);

function readRequiredFile(path) {
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `expected non-empty ${path}`);
	return content;
}

function configuredProductionApiOrigin() {
	const wrangler = readRequiredFile(files.wrangler);
	const varsBlock = wrangler.match(
		/^\[vars\]\s*$([\s\S]*?)(?=^\[|(?![\s\S]))/m,
	);
	assert.ok(varsBlock, "wrangler.toml must define a production [vars] block");

	const value = varsBlock[1].match(/^PUBLIC_API_BASE_URL\s*=\s*"([^"]+)"\s*$/m);
	assert.ok(value, "production [vars] must define PUBLIC_API_BASE_URL");

	const origin = new URL(value[1]).origin;
	assert.equal(
		origin,
		value[1],
		"PUBLIC_API_BASE_URL must be an origin without a path, query, or fragment",
	);
	return origin;
}

function cspConnectSrc(csp, label) {
	const directive = csp
		.split(";")
		.map((value) => value.trim())
		.find((value) => value.startsWith("connect-src"));
	assert.ok(directive, `${label} must include a connect-src directive`);
	return directive.split(/\s+/).slice(1);
}

test("Fly production contact delivery uses the safe disabled mode", () => {
	const fly = readRequiredFile(files.fly);
	const mode = fly.match(
		/^\s*HK_API_CONTACT_DELIVERY_MODE\s*=\s*["']([^"']+)["']\s*$/m,
	)?.[1];

	assert.ok(mode, "fly.toml must explicitly set HK_API_CONTACT_DELIVERY_MODE");
	assert.ok(
		allowedContactDeliveryModes.has(mode),
		`fly.toml contact mode must be one of ${[...allowedContactDeliveryModes].join(", ")}`,
	);
	assert.equal(
		mode,
		"disabled",
		"Fly must default contact delivery to disabled until a reviewed provider-backed delivery configuration is supplied",
	);
});

test("approved deployment decisions match the Fly IAD and no-PII posture", () => {
	const decisions = readRequiredFile(files.decisions);
	const fly = readRequiredFile(files.fly);

	assert.match(
		decisions,
		/## D-03: API host[\s\S]*?Decision: `Fly\.io` \(RESOLVED 2026-07-24\)/,
	);
	assert.match(
		decisions,
		/## D-04: API data-center[\s\S]*?Decision: `iad \(Ashburn, Virginia, US\)` \(RESOLVED 2026-07-24\)/,
	);
	assert.match(
		decisions,
		/## D-05: Contact delivery[\s\S]*?Decision: `disabled for v1` \(RESOLVED 2026-07-24\)/,
	);
	assert.match(fly, /^primary_region\s*=\s*["']iad["']\s*(?:#.*)?$/m);
	assert.match(
		fly,
		/^\s*HK_API_CONTACT_DELIVERY_MODE\s*=\s*["']disabled["']\s*$/m,
	);
});

test("Cloudflare Pages preview variables use a scalar TOML table", () => {
	const wrangler = readRequiredFile(files.wrangler);

	assert.doesNotMatch(
		wrangler,
		/^\[\[env\.preview\.vars\]\]\s*$/m,
		"Pages preview vars must be a TOML table, not an array of tables",
	);
	assert.match(wrangler, /^\[env\.preview\.vars\]\s*$/m);
	assert.match(
		wrangler,
		/^PUBLIC_SITE_URL\s*=\s*"https:\/\/preview\.humankaylee\.dev"\s*$/m,
	);
	assert.match(
		wrangler,
		/^PUBLIC_API_BASE_URL\s*=\s*"https:\/\/preview-api\.humankaylee\.dev"\s*$/m,
	);
});

test("static headers retain self while permitting the configured production API origin", () => {
	const apiOrigin = configuredProductionApiOrigin();
	const headers = readRequiredFile(files.headers);
	const csp = headers.match(/^\s*Content-Security-Policy:\s*(.+)$/m)?.[1];
	assert.ok(csp, "_headers must define Content-Security-Policy");

	const sources = cspConnectSrc(csp, "static Content-Security-Policy");
	assert.ok(
		sources.includes("'self'"),
		"static connect-src must retain 'self'",
	);
	assert.ok(
		sources.includes(apiOrigin),
		`static connect-src must allow configured PUBLIC_API_BASE_URL origin ${apiOrigin}`,
	);
});

test("middleware CSP retains self while permitting the configured production API origin", () => {
	const apiOrigin = configuredProductionApiOrigin();
	const middleware = readRequiredFile(files.middleware);
	const csp = middleware.match(/"connect-src ([^"]+)"/)?.[1];
	assert.ok(csp, "middleware must define a connect-src CSP directive");

	const sources = cspConnectSrc(`connect-src ${csp}`, "middleware CSP");
	assert.ok(
		sources.includes("'self'"),
		"middleware connect-src must retain 'self'",
	);
	assert.ok(
		sources.includes(apiOrigin),
		`middleware connect-src must allow configured PUBLIC_API_BASE_URL origin ${apiOrigin}`,
	);
});
