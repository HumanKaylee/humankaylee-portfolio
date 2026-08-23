import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, it } from "node:test";

import {
	PHASE_7_EVIDENCE_AREAS,
	PHASE_7_EVIDENCE_FIELDS,
	buildPhase7EvidenceTemplate,
} from "./phase-7-evidence-template.mjs";

const REQUIRED_FIELDS = [
	"Command",
	"Target",
	"Evidence Authority",
	"Timestamp",
	"Result / Status",
	"Artifact / Link / Deployment ID / Rollback Target",
	"Blocker / Next Action",
	"Privacy Redaction Rule",
];

describe("Phase 7 evidence template", () => {
	it("builds provider-neutral evidence templates without launch approval side effects", () => {
		assert.deepEqual(PHASE_7_EVIDENCE_FIELDS, REQUIRED_FIELDS);
		assert.deepEqual(Object.keys(PHASE_7_EVIDENCE_AREAS).sort(), [
			"api",
			"contact",
			"domain",
			"frontend",
			"lighthouse",
			"redaction",
			"rollback",
		]);

		const template = buildPhase7EvidenceTemplate({
			area: "frontend",
			timestamp: "2026-05-25T20:00:00.000Z",
		});

		assert.equal(template.area, "frontend");
		assert.equal(template.issue, "#63");
		assert.equal(
			template.status,
			"template only; production evidence not captured",
		);
		assert.equal(template.canCloseIssues, false);
		assert.deepEqual(template.evidenceAuthorityOptions, [
			"production",
			"owner-approved production-equivalent provider preview",
		]);
		assert.deepEqual(Object.keys(template.row), REQUIRED_FIELDS);
		assert.equal(template.row.Timestamp, "2026-05-25T20:00:00.000Z");
		assert.match(template.row.Command, /^<exact command/);
		assert.match(template.row.Target, /^<real target/);
		assert.match(
			template.row["Blocker / Next Action"],
			/frontend provider project/i,
		);
		assert.match(
			template.row["Privacy Redaction Rule"],
			/provider account IDs/i,
		);
		assert.deepEqual(template.forbiddenActions, [
			"do not select providers",
			"do not run deployment commands",
			"do not change DNS or TLS",
			"do not run production smoke commands",
			"do not close launch blocker issues",
		]);

		const serialized = JSON.stringify(template);
		assert.equal(serialized.includes("example.com"), false);
		assert.equal(serialized.includes("secret"), false);
		assert.equal(serialized.includes("token"), false);
	});

	it("maps external launch gates to the issues they cannot close by itself", () => {
		const redaction = buildPhase7EvidenceTemplate({
			area: "redaction",
			timestamp: "2026-05-25T20:00:00.000Z",
		});
		const contact = buildPhase7EvidenceTemplate({
			area: "contact",
			timestamp: "2026-05-25T20:00:00.000Z",
		});

		assert.deepEqual(redaction.relatedIssues, [
			"#20",
			"#21",
			"#24",
			"#25",
			"#69",
		]);
		assert.match(
			redaction.row["Blocker / Next Action"],
			/human approval evidence/i,
		);
		assert.match(
			redaction.row["Privacy Redaction Rule"],
			/raw artifacts, private paths, private hostnames, raw logs/i,
		);

		assert.deepEqual(contact.relatedIssues, ["#64", "#69"]);
		assert.match(
			contact.row["Blocker / Next Action"],
			/contact handling decision/i,
		);
		assert.match(contact.row["Privacy Redaction Rule"], /contact payloads/i);
	});

	it("exposes a CLI that can dry-run or write the public-safe template", async () => {
		const workspace = mkdtempSync(join(tmpdir(), "phase-7-evidence-template-"));
		const summaryPath = join(workspace, "template.json");

		try {
			const dryRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-evidence-template.mjs",
					"--area",
					"api",
					"--summary",
					summaryPath,
					"--dry-run",
				],
				{ encoding: "utf8" },
			);

			assert.equal(dryRun.status, 0, dryRun.stderr);
			assert.equal(existsSync(summaryPath), false);
			const dryRunTemplate = JSON.parse(dryRun.stdout);
			assert.equal(dryRunTemplate.area, "api");
			assert.equal(dryRunTemplate.issue, "#64");
			assert.equal(dryRunTemplate.canCloseIssues, false);

			const writeRun = spawnSync(
				process.execPath,
				[
					"scripts/phase-7-evidence-template.mjs",
					"--area=rollback",
					"--summary",
					summaryPath,
				],
				{ encoding: "utf8" },
			);

			assert.equal(writeRun.status, 0, writeRun.stderr);
			assert.equal(existsSync(summaryPath), true);
			const writtenTemplate = JSON.parse(await readFile(summaryPath, "utf8"));
			assert.equal(writtenTemplate.area, "rollback");
			assert.equal(writtenTemplate.issue, "#69");
			assert.match(
				writtenTemplate.row[
					"Artifact / Link / Deployment ID / Rollback Target"
				],
				/rollback target/i,
			);
		} finally {
			rmSync(workspace, { force: true, recursive: true });
		}
	});

	it("is documented as a local-readiness helper, not launch evidence", async () => {
		const [packageJson, packet, launchEvidence, changelog] = await Promise.all([
			readFile("package.json", "utf8"),
			readFile("runbooks/PHASE_7_DEPLOYMENT_DECISION_PACKETS.md", "utf8"),
			readFile("runbooks/LAUNCH_EVIDENCE.md", "utf8"),
			readFile("docs/CHANGELOG.md", "utf8"),
		]);

		assert.match(packageJson, /"phase7:evidence-template"/);
		assert.match(packet, /phase7:evidence-template/);
		assert.match(packet, /template only; production evidence not captured/);
		assert.match(launchEvidence, /Phase 7 evidence template/);
		assert.match(launchEvidence, /local\/readiness/);
		assert.match(changelog, /Phase 7 evidence template/);
	});
});
