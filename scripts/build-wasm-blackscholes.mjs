/**
 * build-wasm-blackscholes.mjs
 *
 * Wrapper script for building the blackscholes-wasm Rust crate with wasm-pack.
 * Invoked by `pnpm wasm:build` and the CI wasm-build job.
 *
 * Usage:
 *   node scripts/build-wasm-blackscholes.mjs
 *
 * Requires:
 *   - Rust toolchain (stable) with wasm32-unknown-unknown target
 *   - wasm-pack (cargo install wasm-pack)
 */

import { execSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const CRATE_DIR = resolve(
	repoRoot,
	"apps/api/crates/blackscholes-wasm",
);
const OUT_DIR = resolve(
	repoRoot,
	"apps/web/public/wasm/blackscholes",
);
const WASM_BINARY = resolve(OUT_DIR, "blackscholes_wasm_bg.wasm");
const WASM_JS = resolve(OUT_DIR, "blackscholes_wasm.js");

// ── Preflight ─────────────────────────────────────────────────────────────────

if (!existsSync(CRATE_DIR)) {
	console.error(`[wasm-build] ERROR: crate not found at ${CRATE_DIR}`);
	process.exit(1);
}

let wasmPackPath = "wasm-pack";
try {
	execSync("wasm-pack --version", { stdio: "pipe" });
} catch {
	console.error(
		"[wasm-build] ERROR: wasm-pack not found. Install with:\n  cargo install wasm-pack",
	);
	process.exit(1);
}

// ── Build ─────────────────────────────────────────────────────────────────────

const cmd = [
	wasmPackPath,
	"build",
	"--target", "web",
	"--release",
	"--out-dir", OUT_DIR,
	CRATE_DIR,
].join(" ");

console.log(`[wasm-build] Running: ${cmd}`);

try {
	execSync(cmd, { stdio: "inherit", cwd: repoRoot });
} catch (err) {
	console.error("[wasm-build] ERROR: wasm-pack build failed.");
	process.exit(1);
}

// wasm-pack writes a .gitignore that would hide the output from git —
// remove it so the built assets are committed.
const gitignorePath = resolve(OUT_DIR, ".gitignore");
if (existsSync(gitignorePath)) {
	const { unlinkSync } = await import("node:fs");
	unlinkSync(gitignorePath);
	console.log("[wasm-build] Removed wasm-pack .gitignore from output dir.");
}

// ── Verify ────────────────────────────────────────────────────────────────────

if (!existsSync(WASM_BINARY)) {
	console.error(`[wasm-build] ERROR: WASM binary not found at ${WASM_BINARY}`);
	process.exit(1);
}

if (!existsSync(WASM_JS)) {
	console.error(`[wasm-build] ERROR: JS glue not found at ${WASM_JS}`);
	process.exit(1);
}

const wasmBytes = statSync(WASM_BINARY).size;
const jsBytes = statSync(WASM_JS).size;
const KB = (n) => `${(n / 1024).toFixed(1)} KB`;

console.log(`[wasm-build] OK`);
console.log(`  WASM binary : ${WASM_BINARY} (${KB(wasmBytes)} raw)`);
console.log(`  JS glue     : ${WASM_JS} (${KB(jsBytes)})`);

const RAW_CEILING_BYTES = 102_400; // 100 KB — generous ceiling
if (wasmBytes > RAW_CEILING_BYTES) {
	console.warn(
		`[wasm-build] WARNING: WASM binary is ${KB(wasmBytes)}, ` +
		`above the ${KB(RAW_CEILING_BYTES)} ceiling. ` +
		`Run wasm-opt -Oz to reduce size.`,
	);
}
