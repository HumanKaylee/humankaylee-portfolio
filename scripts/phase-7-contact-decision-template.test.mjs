import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	CONTACT_DECISION_MODES,
	CONTACT_DECISION_REQUIRED_FIELDS,
	buildContactDecisionTemplate,
} from "./phase-7-contact-decision-template.mjs";

const REQUIRED_FIELDS = [
	"decisionOwner",
	"selectedMode",
	"retention",
	"backupHandling",
	"rotation",
	"deletionWorkflow",
	"storePathOrProvider",
	"productionSmokeCommand",
	"rollbackOrDisablePlan",
	"privacyRedactionRule",
	"blockedIssues",
	"ownerApprovalEvidence",
];

describe("Phase 7 contact decision template", () => {
	it("builds a non-approval decision template for every supported contact mode", () => {
		assert.deepEqual(CONTACT_DECISION_REQUIRED_FIELDS, REQUIRED_FIELDS);
		assert.deepEqual(Object.keys(CONTACT_DECISION_MODES).sort(), [
			"defer",
			"external-provider",
			"jsonl-store",
			"mailto-only-exception",
		]);

		for (const mode of Object.keys(CONTACT_DECISION_MODES)) {
			const template = buildContactDecisionTemplate({
				mode,
				timestamp: "2026-05-25T21:00:00.000Z",
			});

			assert.equal(
				template.status,
				"template only; production contact handling not approved",
			);
			assert.equal(template.mode, mode);
			assert.equal(template.canCloseIssues, false);
			assert.deepEqual(template.blockedIssues, ["#64", "#69"]);
			assert.deepEqual(Object.keys(template.decision), REQUIRED_FIELDS);
			assert.equal(template.decision.selectedMode, mode);
			assert.deepEqual(template.decision.blockedIssues, ["#64", "#69"]);
			assert.equal(
				template.decision.ownerApprovalEvidence,
				"<HumanKaylee approval record, timestamp, and evidence link>",
			);
			assert.match(template.decision.retention, /<required/);
			assert.match(template.decision.backupHandling, /<required/);
			assert.match(template.decision.rotation, /<required/);
			assert.match(template.decision.deletionWorkflow, /<required/);
			assert.match(
				template.decision.privacyRedactionRule,
				/contact payloads, sender details, provider account IDs, secrets, and tokens/i,
			);

			const serialized = JSON.stringify(template);
			assert.equal(serialized.includes("secret-value"), false);
			assert.equal(serialized.includes("/home/"), false);
			assert.equal(serialized.includes("example.com"), false);
		}
	});

	it("records mode-specific contact decisions without treating them as production proof", () => {
		const mailtoOnly = buildContactDecisionTemplate({
			mode: "mailto-only-exception",
			timestamp: "2026-05-25T21:00:00.000Z",
		});
		const jsonlStore = buildContactDecisionTemplate({
			mode: "jsonl-store",
			timestamp: "2026-05-25T21:00:00.000Z",
		});
		const externalProvider = buildContactDecisionTemplate({
			mode: "external-provider",
			timestamp: "2026-05-25T21:00:00.000Z",
		});

		assert.match(
			mailtoOnly.modeSummary,
			/approved mailto-only launch exception/i,
		);
		assert.match(mailtoOnly.decision.storePathOrProvider, /no API storage/i);
		assert.match(jsonlStore.modeSummary, /persistent JSONL store/i);
		assert.match(
			jsonlStore.decision.storePathOrProvider,
			/HK_API_CONTACT_STORE_PATH/i,
		);
		assert.match(externalProvider.modeSummary, /external contact provider/i);
		assert.match(externalProvider.decision.storePathOrProvider, /provider/i);

		for (const template of [mailtoOnly, jsonlStore, externalProvider]) {
			assert.match(
				template.nextAction,
				/replace this template with owner-approved contact handling and production or owner-approved production-equivalent provider preview smoke evidence/i,
			);
			assert.deepEqual(template.forbiddenActions, [
				"do not approve contact handling from this template",
				"do not record contact payloads",
				"do not write secret values or provider account IDs",
				"do not close #64 or #69",
			]);
		}
	});

	it("exposes a CLI that can dry-run, write, and reject unknown modes", async () => {
		const workspace = mkdtempSync(join(tmpdir(), "phase-7-contact-decision-"));
		const summaryPath = join(workspace, "contact-decision.json");

		try {
			const dryRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-contact-decision-template.mjs",
					"--mode",
					"mailto-only-exception",
					"--summary",
					summaryPath,
					"--dry-run",
				],
				{ encoding: "utf8" },
			);

			assert.equal(dryRun.status, 0, dryRun.stderr);
			assert.equal(existsSync(summaryPath), false);
			const dryRunTemplate = JSON.parse(dryRun.stdout);
			assert.equal(dryRunTemplate.mode, "mailto-only-exception");
			assert.equal(dryRunTemplate.canCloseIssues, false);

			const writeRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-contact-decision-template.mjs",
					"--mode=jsonl-store",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(writeRun.status, 0, writeRun.stderr);
			assert.equal(existsSync(summaryPath), true);
			const writtenTemplate = JSON.parse(await readFile(summaryPath, "utf8"));
			assert.equal(writtenTemplate.mode, "jsonl-store");
			assert.match(
				writtenTemplate.decision.storePathOrProvider,
				/HK_API_CONTACT_STORE_PATH/,
			);

			const rejected = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-contact-decision-template.mjs",
					"--mode",
					"unsupported",
				],
				{ encoding: "utf8" },
			);

			assert.notEqual(rejected.status, 0);
			assert.match(rejected.stderr, /unknown Phase 7 contact decision mode/i);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("is documented as a local decision template, not production contact evidence", async () => {
		const [
			packageJson,
			packet,
			launchEvidence,
			privacy,
			operations,
			changelog,
		] = await Promise.all([
			readFile("package.json", "utf8"),
			readFile("runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md", "utf8"),
			readFile("runbooks/LAUNCH_EVIDENCE.md", "utf8"),
			readFile("docs/PRIVACY.md", "utf8"),
			readFile("docs/OPERATIONS.md", "utf8"),
			readFile("docs/CHANGELOG.md", "utf8"),
		]);

		assert.match(packageJson, /"phase7:contact-decision"/);
		assert.match(packet, /phase7:contact-decision/);
		assert.match(
			packet,
			/template only; production contact handling not approved/,
		);
		assert.match(launchEvidence, /Phase 7 contact decision template/);
		assert.match(launchEvidence, /local\/decision-template/);
		assert.match(privacy, /phase7:contact-decision/);
		assert.match(operations, /phase7:contact-decision/);
		assert.match(changelog, /Phase 7 contact decision template/);

		for (const content of [packet, launchEvidence, privacy, operations]) {
			assert.doesNotMatch(content, /production contact handling is approved/i);
			assert.doesNotMatch(content, /contact production handling passed/i);
		}
	});
});
