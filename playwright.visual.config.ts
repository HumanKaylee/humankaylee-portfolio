import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests/e2e",
	use: {
		baseURL: "http://127.0.0.1:4321",
	},
	webServer: {
		command:
			"node node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4321",
		env: {
			ASTRO_DEV_BACKGROUND: "1",
		},
		url: "http://127.0.0.1:4321",
		reuseExistingServer: false,
	},
	workers: 1,
	expect: {
		timeout: 12_000,
		toHaveScreenshot: {
			threshold: 0.2,
			maxDiffPixels: 300,
		},
	},
});
