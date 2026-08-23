import { defineConfig } from "astro/config";

export default defineConfig({
	devToolbar: {
		enabled: false,
	},
	output: "static",
	srcDir: "./apps/web/src",
	publicDir: "./apps/web/public",
	vite: {
		build: {
			rollupOptions: {
				// The wasm-pack JS glue is served from /public/wasm/ as a static asset
				// and loaded via dynamic import at runtime. Rollup cannot resolve it at
				// build time — mark it external so the build succeeds.
				external: ["/wasm/blackscholes/blackscholes_wasm.js"],
			},
		},
	},
});
