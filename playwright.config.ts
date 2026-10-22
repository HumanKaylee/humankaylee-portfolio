import { defineConfig } from "@playwright/test";

// PLAYWRIGHT_PREVIEW=1 serves the built dist/ via `astro preview` instead of the
// dev server. CI's navigation gates use it: the astro dev server can navigate on
// its own after the first load, which flaked them (issue #81). Requires a prior
// `pnpm build`. @security stays on dev, where middleware sets the headers.
const usePreview = process.env.PLAYWRIGHT_PREVIEW === "1";

export default defineConfig({
	testDir: "tests/e2e",
	testIgnore: "**/visual-regression.spec.ts",
	use: {
		baseURL: "http://127.0.0.1:4321",
	},
	webServer: usePreview
		? {
				command:
					"node node_modules/astro/bin/astro.mjs preview --host 127.0.0.1 --port 4321",
				url: "http://127.0.0.1:4321",
				reuseExistingServer: false,
			}
		: {
				command:
					"node node_modules/astro/bin/astro.mjs dev --host 127.0.0.1 --port 4321",
				env: {
					ASTRO_DEV_BACKGROUND: "1",
				},
				url: "http://127.0.0.1:4321",
				reuseExistingServer: false,
			},
});
