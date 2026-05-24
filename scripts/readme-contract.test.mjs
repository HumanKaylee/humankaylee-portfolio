import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const README_PATH = "README.md";

function readReadme() {
	assert.ok(existsSync(README_PATH), `missing required file: ${README_PATH}`);

	const content = readFileSync(README_PATH, "utf8");
	assert.ok(content.trim().length > 0, `empty required file: ${README_PATH}`);
	return content;
}

function expectContains(content, needle, label = needle) {
	const normalizedContent = content.replace(/\s+/g, " ");
	const normalizedNeedle = needle.replace(/\s+/g, " ");
	assert.ok(
		normalizedContent.includes(normalizedNeedle),
		`expected README to include ${label}`,
	);
}

function expectAll(content, needles) {
	for (const needle of needles) {
		expectContains(content, needle);
	}
}

test("README covers local development, deployment, and recovery contracts", () => {
	const readme = readReadme();

	expectContains(readme, "# HumanKaylee Portfolio", "project title");
	expectAll(readme, [
		"## Local Development",
		"### Frontend Local Development",
		"### Backend Local Development",
		"## Environment Variables",
		"## Tests And Quality Checks",
		"## Frontend Deployment",
		"## Backend Deployment",
		"## Common Failure Modes And Recovery",
		"[docs/OPERATIONS.md](docs/OPERATIONS.md)",
		"[runbooks/DEPLOYMENT.md](runbooks/DEPLOYMENT.md)",
		"[runbooks/LAUNCH_EVIDENCE.md](runbooks/LAUNCH_EVIDENCE.md)",
		"pnpm exec astro dev --host 127.0.0.1 --port 4321",
		"cargo run --manifest-path apps/api/Cargo.toml --bin humankaylee-api",
		"pnpm lint",
		"pnpm typecheck",
		"pnpm test",
		"pnpm test:e2e",
		"pnpm build",
		"pnpm preview",
		"pnpm lighthouse:local",
		"cargo fmt --manifest-path apps/api/Cargo.toml --check",
		"cargo clippy --manifest-path apps/api/Cargo.toml --all-targets -- -D warnings",
		"cargo test --manifest-path apps/api/Cargo.toml",
		"cargo check --manifest-path apps/api/Cargo.toml --features shuttle --bin humankaylee-api-shuttle",
		"pnpm build && pnpm bundle:budget",
		"pnpm run audit",
		"sudo podman build -t humankaylee-api:local-check -f apps/api/Dockerfile apps/api",
		"http://127.0.0.1:8788/api/health",
		"sudo podman stop --time 1",
		"PUBLIC_SITE_URL",
		"PUBLIC_API_BASE_URL",
		"PUBLIC_ANALYTICS_ENABLED",
		"PUBLIC_RELEASE_VERSION",
		"PUBLIC_GIT_COMMIT_SHA",
		"HK_API_ALLOWED_ORIGINS",
		"HK_API_CONTACT_DELIVERY_MODE",
		"HK_API_CONTACT_STORE_PATH",
		"HK_API_EVENT_LOGGING_ENABLED",
		"HK_API_RATE_LIMIT_REQUESTS_PER_MINUTE",
		"HK_API_CONTACT_RATE_LIMIT_PER_HOUR",
		"HK_API_VERSION",
		"not launch-ready",
		"Final frontend domain",
		"Final API domain",
		"provider projects",
		"required secrets",
		"shuttle deploy",
		"--working-directory apps/api",
		"--secrets Secrets.production.toml",
		"pnpm exec wrangler pages deployment list",
		"shuttle deployment list",
		'fly releases --app "$FLY_APP" --image',
		'fly deploy --app "$FLY_APP" --image "$KNOWN_GOOD_IMAGE"',
		"railway deployment list",
	]);

	assert.ok(
		!readme.includes("fly secrets list"),
		"README rollback guidance should use Fly releases, not Fly secrets listing",
	);
});
