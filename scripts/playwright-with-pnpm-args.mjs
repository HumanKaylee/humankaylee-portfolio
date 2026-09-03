import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const playwrightCliPath = fileURLToPath(
	new URL("../node_modules/@playwright/test/cli.js", import.meta.url),
);

export function runPlaywright(args, spawn = spawnSync) {
	const normalizedArgs = args[0] === "--" ? args.slice(1) : args;

	return spawn(
		process.execPath,
		[playwrightCliPath, "test", ...normalizedArgs],
		{
			stdio: "inherit",
			shell: false,
		},
	);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
	const result = runPlaywright(process.argv.slice(2));

	process.exit(result.status ?? 1);
}
