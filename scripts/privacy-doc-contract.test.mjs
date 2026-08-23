import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const privacyPath = "docs/PRIVACY.md";
const readmePath = "README.md";
const architecturePath = "docs/ARCHITECTURE.md";
const operationsPath = "docs/OPERATIONS.md";

function readRequiredFile(path) {
	assert.ok(existsSync(path), `missing required file: ${path}`);
	const content = readFileSync(path, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${path}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	const normalizedContent = content.replace(/\s+/g, " ");
	const normalizedNeedle = needle.replace(/\s+/g, " ");
	assert.ok(
		normalizedContent.includes(normalizedNeedle),
		`expected privacy doc to include ${label}`,
	);
}

function expectMatches(content, pattern, label) {
	assert.match(content, pattern, `expected privacy doc to include ${label}`);
}

function expectAll(content, needles) {
	for (const needle of needles) {
		expectContains(content, needle);
	}
}

test("README indexes the privacy documentation artifact", () => {
	const readme = readRequiredFile(readmePath);

	assert.ok(
		readme.includes("[docs/PRIVACY.md](docs/PRIVACY.md)"),
		"README should link to docs/PRIVACY.md",
	);
});

test("privacy notes cover the current static site, Cloudflare, Google automation, and review contracts", () => {
	const content = readRequiredFile(privacyPath);

	expectContains(content, "# HumanKaylee Portfolio Privacy Notes", "title");
	assert.match(content, /^Date: \d{4}-\d{2}-\d{2}$/m, "date field shape");
	expectAll(content, [
		"not a legal privacy policy",
		"does not promise behavior that has not been implemented yet",
		"## Current Public Site",
		"static Astro site",
		"does not expose a contact form",
		"direct email and linked social profiles",
		"Cloudflare Web Analytics",
		"cookie-free performance beacon",
		"Cloudflare's email-obfuscation script",
		"## Personal Google Automation",
		"https://www.googleapis.com/auth/calendar",
		"https://www.googleapis.com/auth/gmail.modify",
		"Access tokens are stored on hardware the operator controls.",
		"## Implementation Review",
		"apps/web/src/pages/privacy/index.astro",
		"apps/web/src/pages/contact/index.astro",
	]);

	for (const staleCurrentClaim of [
		"`POST /api/contact`",
		"`POST /api/events`",
		"`HK_API_CONTACT_DELIVERY_MODE=store`",
		"`HK_API_EVENT_LOGGING_ENABLED`",
		"`apps/web/src/components/ContactForm.astro`",
	]) {
		assert.ok(
			!content.includes(staleCurrentClaim),
			`privacy doc should not describe removed current behavior: ${staleCurrentClaim}`,
		);
	}

	for (const unsupportedPromise of [
		"GDPR compliant",
		"HIPAA compliant",
		"CCPA compliant",
		"fully anonymized",
		"delete on request",
		"never collect",
		"never store",
		"legal guarantee",
		"stay in the running API process for the hourly rate-limit window",
	]) {
		assert.ok(
			!content.toLowerCase().includes(unsupportedPromise.toLowerCase()),
			`privacy doc should not make unsupported promise: ${unsupportedPromise}`,
		);
	}

	for (const { label, pattern } of [
		{ label: "private Linux home path", pattern: /\/home\/[a-z0-9_-]+/i },
		{
			label: "private macOS user path",
			pattern: /\/Users\/[^/\s"'<>]+/i,
		},
		{ label: "private Windows user path", pattern: /[A-Z]:\\Users\\/i },
		{
			label: "Tailscale private IP",
			pattern: /100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\.\d+\.\d+/,
		},
		{
			label: "secret assignment",
			pattern:
				/\b(?:api[_-]?key|token|secret)\s*[:=]\s*["']?[A-Za-z0-9._~+/=-]{12,}/i,
		},
		{
			label: "credential assignment",
			pattern: /\bpassword\s*[:=]\s*["']?\S{8,}/i,
		},
	]) {
		assert.ok(
			!pattern.test(content),
			`privacy doc should not expose private detail: ${label}`,
		);
	}
});

test("events docs do not imply a shipped analytics provider, sink, or retention policy", () => {
	const architecture = readRequiredFile(architecturePath);
	const operations = readRequiredFile(operationsPath);

	for (const [label, content] of [
		["architecture", architecture],
		["operations", operations],
	]) {
		expectMatches(
			content,
			/does not ship an analytics provider/i,
			`${label} no analytics provider boundary`,
		);
		expectMatches(content, /event sink/i, `${label} event sink boundary`);
		expectMatches(
			content,
			/retention policy for enabled events/i,
			`${label} event retention boundary`,
		);
	}

	for (const staleWording of [
		"Optional privacy-safe analytics sink.",
		"Optional privacy-safe analytics service.",
		"Privacy-safe events store",
		"Privacy-safe event store",
		"stores or forwards only approved fields",
	]) {
		for (const [label, content] of [
			["architecture", architecture],
			["operations", operations],
		]) {
			assert.ok(
				!content.includes(staleWording),
				`${label} should not imply shipped analytics storage with: ${staleWording}`,
			);
		}
	}
});
