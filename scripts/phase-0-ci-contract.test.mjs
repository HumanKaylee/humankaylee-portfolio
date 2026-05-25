import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const workflowPath = ".github/workflows/phase-0-ci.yml";
const launchGates = [
	{
		label: "@keyboard",
		name: "Run keyboard navigation gate",
		command: 'pnpm test:e2e -- --grep "@keyboard"',
	},
	{
		label: "@accessibility",
		name: "Run accessibility gate",
		command: 'pnpm test:e2e -- --grep "@accessibility"',
	},
	{
		label: "@security",
		name: "Run security headers gate",
		command: 'pnpm test:e2e -- --grep "@security"',
	},
	{
		label: "@api-down",
		name: "Run API outage resilience gate",
		command: 'pnpm test:e2e -- --grep "@api-down"',
	},
	{
		label: "@api-telemetry",
		name: "Run API telemetry gate",
		command: 'pnpm test:e2e -- --grep "@api-telemetry"',
	},
	{
		label: "@journey",
		name: "Run journey smoke gate",
		command: 'pnpm test:e2e -- --grep "@journey"',
	},
];

function launchGateRunLines(indent = "          ") {
	return launchGates.map(({ command }) => `${indent}${command}`).join("\n");
}

function launchGateStepsYaml(indent = "      ") {
	return launchGates
		.map(
			({ name, command }) =>
				`${indent}- name: ${name}\n${indent}  run: ${command}`,
		)
		.join("\n");
}

function readWorkflow() {
	assert.ok(existsSync(workflowPath), `missing workflow: ${workflowPath}`);

	const content = readFileSync(workflowPath, "utf8");
	assert.ok(content.trim().length > 0, `empty workflow: ${workflowPath}`);
	return content;
}

function expectCiTriggers(workflow) {
	assert.match(workflow, /^on:\n/m, "expected workflow trigger block");
	assert.match(
		workflow,
		/^ {2}pull_request:\s*$/m,
		"expected pull_request trigger for PR branches",
	);
	assert.match(
		workflow,
		/^ {2}workflow_dispatch:\s*$/m,
		"expected manual workflow_dispatch trigger",
	);
	assert.match(
		workflow,
		/^ {2}push:\n {4}branches:\n {6}- main$/m,
		"expected push trigger to be scoped to main only",
	);
	assert.doesNotMatch(
		workflow,
		/^ {2}push:\n {2}pull_request:/m,
		"expected push trigger not to run on every branch",
	);
	assert.match(
		workflow,
		/group: phase-0-ci-\${{ github.workflow }}-\${{ github.event_name }}-\${{ github.event.pull_request.number \|\| github.ref_name }}/,
		"expected concurrency to separate PR numbers from direct pushes",
	);
}

function scalarValue(value) {
	const trimmed = value.trim();
	const quote = trimmed[0];
	if (
		(quote === '"' || quote === "'") &&
		trimmed.length > 1 &&
		trimmed.at(-1) === quote
	) {
		return trimmed.slice(1, -1);
	}
	return trimmed;
}

function frontendSteps(workflow) {
	const steps = [];
	let currentJob;
	let inSteps = false;
	let currentStep;

	for (const line of workflow.split("\n")) {
		const jobName = line.match(/^ {2}([A-Za-z0-9_-]+):\s*$/);
		if (jobName) {
			currentJob = jobName[1];
			inSteps = false;
			currentStep = undefined;
			continue;
		}

		if (currentJob !== "frontend") {
			continue;
		}

		if (/^\s*steps:\s*$/.test(line)) {
			inSteps = true;
			continue;
		}

		if (!inSteps) {
			continue;
		}

		const stepName = line.match(/^\s*-\s+name:\s*(.+)$/);
		if (stepName) {
			currentStep = { name: scalarValue(stepName[1]), run: undefined };
			steps.push(currentStep);
			continue;
		}

		const runCommand = line.match(/^\s*run:\s*(.+)$/);
		if (currentStep && runCommand) {
			currentStep.run = scalarValue(runCommand[1]);
		}
	}

	return steps;
}

function expectLaunchGateSteps(workflow) {
	const steps = frontendSteps(workflow);

	let previousStepIndex = -1;
	let finalLaunchGateStepIndex = -1;
	for (const { label, name, command } of launchGates) {
		const stepIndex = steps.findIndex(
			(step) => step.name === name && step.run === command,
		);
		assert.ok(
			stepIndex >= 0,
			`expected frontend job to include dedicated ${label} gate step`,
		);
		assert.ok(
			stepIndex > previousStepIndex,
			`expected ${label} gate to appear after the previous launch gate`,
		);
		previousStepIndex = stepIndex;
		finalLaunchGateStepIndex = stepIndex;
	}

	const fullE2eStepIndex = steps.findIndex(
		(step) =>
			step.name === "Run frontend end-to-end tests" &&
			step.run === "pnpm test:e2e",
	);

	assert.ok(
		fullE2eStepIndex >= 0,
		"expected frontend job to include the full e2e step",
	);
	assert.ok(
		finalLaunchGateStepIndex < fullE2eStepIndex,
		"expected the final dedicated launch gate before the full frontend e2e run",
	);
}

function expectNode24ActionRuntime(workflow) {
	assert.match(
		workflow,
		/^\s{2,4}FORCE_JAVASCRIPT_ACTIONS_TO_NODE24:\s*["']?true["']?/m,
		"expected workflow to opt JavaScript actions into Node.js 24 via FORCE_JAVASCRIPT_ACTIONS_TO_NODE24: true",
	);
	for (const action of [
		"actions/checkout@v6",
		"actions/setup-node@v6",
		"pnpm/action-setup@v6",
	]) {
		assert.match(
			workflow,
			new RegExp(`uses:\\s+${action.replace("/", "\\/")}`),
			`expected workflow to use Node 24-native JavaScript action ${action}`,
		);
	}
}

function expectWorkflowStepIndentation(workflow) {
	assert.doesNotMatch(
		workflow,
		/^ {6,}steps:\s*$/m,
		"expected job steps blocks to be indented at the job property level",
	);
	for (const job of ["frontend", "backend"]) {
		assert.match(
			workflow,
			new RegExp(
				`^  ${job}:\\n(?:^ {4}[^\\n]+\\n|^\\s*$\\n)*^ {4}steps:$`,
				"m",
			),
			`expected ${job} job to define steps with four-space indentation`,
		);
	}
}

test("phase-0 CI exposes dedicated launch gate steps in the expected order", () => {
	expectLaunchGateSteps(readWorkflow());
});

test("phase-0 CI keeps job step blocks at valid YAML indentation", () => {
	expectWorkflowStepIndentation(readWorkflow());
});

test("phase-0 CI avoids duplicate PR branch push runs", () => {
	expectCiTriggers(readWorkflow());
});

test("phase-0 CI contract rejects collapsed launch gates", () => {
	const collapsedWorkflow = `
jobs:
  frontend:
    steps:
      - name: Run grouped launch gates
        run: |
${launchGateRunLines()}
      - name: Run frontend end-to-end tests
        run: pnpm test:e2e
`;

	assert.throws(
		() => expectLaunchGateSteps(collapsedWorkflow),
		/expected frontend job to include dedicated @keyboard gate step/,
	);
});

test("phase-0 CI guards JavaScript action runtime deprecation", () => {
	expectNode24ActionRuntime(readWorkflow());
});

test("phase-0 CI contract requires gates in the frontend job", () => {
	const misplacedWorkflow = `
jobs:
  frontend:
    steps:
      - name: Run frontend end-to-end tests
        run: pnpm test:e2e
  backend:
    steps:
${launchGateStepsYaml()}
`;

	assert.throws(
		() => expectLaunchGateSteps(misplacedWorkflow),
		/expected frontend job to include dedicated @keyboard gate step/,
	);
});
