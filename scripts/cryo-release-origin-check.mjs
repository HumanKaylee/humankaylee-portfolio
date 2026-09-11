#!/usr/bin/env node
// CryoSim M11 stage 1 - production-origin check (plan unit 3, clauses 3 and 6).
// Run ONLY against an origin the owner names, after the owner's merge deployed:
//   node scripts/cryo-release-origin-check.mjs --origin https://joepoznanski.io
// For every media URL the case study references it asserts: HTTP 206 with a
// valid Content-Range for a byte-range request (seekable), and - for the M10
// stills - the served SHA-256 equals the manifest's. Prints a JSON record the
// program's exit evidence copies verbatim. Exit 1 on any failure.
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const originIndex = args.indexOf("--origin");
if (originIndex === -1 || !args[originIndex + 1]) {
	console.error(
		"usage: node scripts/cryo-release-origin-check.mjs --origin https://host",
	);
	process.exit(2);
}
const origin = args[originIndex + 1].replace(/\/$/, "");
const manifest = JSON.parse(
	readFileSync("apps/web/src/data/cryo-m10-media-manifest.json", "utf8"),
);
const page = await fetch(`${origin}/work/cryo-flow-sim/`);
const html = await page.text();
const mediaUrls = [
	...new Set(
		[...html.matchAll(/(?:src|href)="(\/media\/[^"]+)"/g)].map((m) => m[1]),
	),
];

const record = {
	contract: "cryosim.m11_stage1_origin_check",
	origin,
	checked_at: new Date().toISOString(),
	page_status: page.status,
	page_bytes: Buffer.byteLength(html),
	security_headers: Object.fromEntries(
		[
			"content-security-policy",
			"x-frame-options",
			"x-content-type-options",
			"strict-transport-security",
			"server",
		].map((h) => [h, page.headers.get(h)]),
	),
	media: [],
	failures: [],
};

for (const url of mediaUrls) {
	// Cloudflare serves byte ranges from its edge cache: an asset that has never
	// been requested answers 200 to the first range request (measured 2026-09-11
	// on a preview deployment). Warm the asset once, then ask for the range.
	await fetch(`${origin}${url}`);
	const range = await fetch(`${origin}${url}`, {
		headers: { Range: "bytes=0-99" },
	});
	const entry = {
		url,
		range_status: range.status,
		content_range: range.headers.get("content-range"),
	};
	if (
		range.status !== 206 ||
		!/^bytes 0-99\/\d+$/.test(entry.content_range ?? "")
	) {
		record.failures.push(
			`${url}: expected 206 with Content-Range, got ${range.status} ${entry.content_range}`,
		);
	}
	const derivative = manifest.items
		.flatMap((i) => i.derivatives)
		.find((d) => url.endsWith(`/${d.file}`));
	if (derivative) {
		const full = await fetch(`${origin}${url}`);
		const bytes = Buffer.from(await full.arrayBuffer());
		entry.sha256 = createHash("sha256").update(bytes).digest("hex");
		entry.manifest_sha256 = derivative.sha256;
		if (entry.sha256 !== derivative.sha256)
			record.failures.push(`${url}: served hash differs from the manifest`);
	}
	record.media.push(entry);
}
if (record.media.length === 0)
	record.failures.push("no media URLs found on the page");
console.log(JSON.stringify(record, null, 2));
process.exit(record.failures.length === 0 ? 0 : 1);
