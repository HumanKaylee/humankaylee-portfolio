import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const dockerfile = readFileSync("apps/api/Dockerfile", "utf8");

test("API dependency cache includes every Cargo workspace manifest before cargo fetch", () => {
	const workspaceManifest =
		"COPY crates/blackscholes-wasm/Cargo.toml crates/blackscholes-wasm/Cargo.toml";
	const workspaceLibrary =
		"COPY crates/blackscholes-wasm/src/lib.rs crates/blackscholes-wasm/src/lib.rs";
	const ogTemplate = "COPY templates ./templates";
	const workspaceManifestIndex = dockerfile.indexOf(workspaceManifest);
	const workspaceLibraryIndex = dockerfile.indexOf(workspaceLibrary);
	const ogTemplateIndex = dockerfile.indexOf(ogTemplate);
	const fetchIndex = dockerfile.indexOf("RUN cargo fetch --locked");

	assert.ok(
		workspaceManifestIndex >= 0,
		"the dependency-cache stage must copy the blackscholes-wasm workspace manifest",
	);
	assert.ok(
		workspaceLibraryIndex >= 0,
		"Cargo workspace validation requires the blackscholes-wasm library source to exist",
	);
	assert.ok(
		fetchIndex >= 0,
		"the dependency-cache stage must run cargo fetch --locked",
	);
	assert.ok(
		workspaceManifestIndex < fetchIndex,
		"the workspace manifest must be available before cargo fetch resolves the workspace",
	);
	assert.ok(
		workspaceLibraryIndex < fetchIndex,
		"the workspace library source must be available before cargo fetch validates the workspace",
	);
	assert.ok(
		ogTemplateIndex >= 0,
		"the build stage must include the Open Graph SVG required by include_str!",
	);
});
