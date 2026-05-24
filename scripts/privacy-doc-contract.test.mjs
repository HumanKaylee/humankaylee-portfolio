import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const privacyPath = "docs/PRIVACY.md";
const readmePath = "README.md";

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

test("privacy notes cover B-054 contact, analytics, retention, and review contracts", () => {
	const content = readRequiredFile(privacyPath);

	expectContains(content, "# HumanKaylee Portfolio Privacy Notes", "title");
	assert.match(content, /^Date: \d{4}-\d{2}-\d{2}$/m, "date field shape");
	expectAll(content, [
		"not a legal privacy policy",
		"does not promise behavior that has not been implemented yet",
		"## What The Site Collects",
		"`name`",
		"`email`",
		"`subject`",
		"`message`",
		"`company` as a hidden honeypot field",
		"review the inquiry and reply",
		"in-memory rate limit tracks a temporary abuse-control key from the normalized sender email address",
		"does not trust forwarded client IP headers by default because no trusted proxy boundary has been approved",
		"## Events And Analytics",
		"`POST /api/events`",
		"`HK_API_EVENT_LOGGING_ENABLED` defaults to `false`",
		"No analytics provider is enabled by default",
		"Only allowlisted event names are accepted when events are enabled.",
		"accepted event submissions pass through an in-memory per-minute rate limit",
		"stores only transient hashed abuse-control buckets",
		"does not trust forwarded client IP headers for event rate limiting",
		"does not write raw event payload values or event records to disk",
		"## Retention And Storage",
		"Contact storage is off by default.",
		"configured JSONL file until that backend host or operator deletes, rotates, or exports the file",
		"Production contact storage must also define backup handling before launch",
		"No public deletion workflow is promised until production contact handling is finalized.",
		"## Privacy Contact",
		"Use the public contact route at `/contact/` for privacy questions or update requests.",
		"## Implementation Review",
		"`apps/web/src/components/ContactForm.astro`",
		"`apps/api/src/contact.rs`",
		"`apps/api/src/state.rs`",
		"`apps/api/src/events.rs`",
		"`apps/api/src/config.rs`",
		"`apps/api/tests/api_contract.rs`",
		"`tests/e2e/contact-api.spec.ts`",
	]);

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
