import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const normalizedArgs = args[0] === "--" ? args.slice(1) : args;

const result = spawnSync("playwright", ["test", ...normalizedArgs], {
	stdio: "inherit",
	shell: process.platform === "win32",
});

process.exit(result.status ?? 1);
