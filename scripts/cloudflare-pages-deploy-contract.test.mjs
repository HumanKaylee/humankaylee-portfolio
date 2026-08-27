import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const workflowPath = ".github/workflows/cloudflare-pages-deploy.yml";

function readWorkflow() {
	return readFileSync(workflowPath, "utf8");
}

test("Cloudflare production deploy fails before build work when provider credentials are absent", () => {
	const workflow = readWorkflow();
	const preflightIndex = workflow.indexOf(
		"name: Verify Cloudflare deployment credentials",
	);
	const installIndex = workflow.indexOf("name: Install dependencies");

	assert.ok(preflightIndex >= 0, "missing credential preflight step");
	assert.ok(
		preflightIndex < installIndex,
		"credential preflight must run before dependency installation and build work",
	);
	assert.match(
		workflow,
		/CLOUDFLARE_API_TOKEN: \${{ secrets\.CLOUDFLARE_API_TOKEN }}/,
	);
	assert.match(
		workflow,
		/CLOUDFLARE_ACCOUNT_ID: \${{ secrets\.CLOUDFLARE_ACCOUNT_ID }}/,
	);
	assert.match(workflow, /test -n "\$CLOUDFLARE_API_TOKEN"/);
	assert.match(workflow, /test -n "\$CLOUDFLARE_ACCOUNT_ID"/);
});

test("Cloudflare production deploy is main-only and pins the provider source to github.sha", () => {
	const workflow = readWorkflow();

	assert.match(workflow, /^ {6}- main$/m);
	assert.doesNotMatch(workflow, /goal\/portfolio-implementation/);
	assert.match(
		workflow,
		/FORCE_JAVASCRIPT_ACTIONS_TO_NODE24:\s*["']?true["']?/,
	);
	assert.match(
		workflow,
		/pages deploy dist --project-name=humankaylee-portfolio --branch=main --commit-hash=\${{ github\.sha }} --commit-dirty=false/,
	);
	assert.doesNotMatch(workflow, /--commit-dirty=true/);
});

test("Cloudflare production deploy reads credentials only from GitHub secrets", () => {
	const workflow = readWorkflow();

	assert.match(workflow, /apiToken: \${{ secrets\.CLOUDFLARE_API_TOKEN }}/);
	assert.match(workflow, /accountId: \${{ secrets\.CLOUDFLARE_ACCOUNT_ID }}/);
	assert.doesNotMatch(
		workflow,
		/(?:CLOUDFLARE_API_TOKEN|CLOUDFLARE_ACCOUNT_ID)\s*[:=]\s*["']?[A-Za-z0-9_-]{20,}/,
	);
});
