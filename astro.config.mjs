import { defineConfig } from "astro/config";

export default defineConfig({
	output: "static",
	srcDir: "./apps/web/src",
	publicDir: "./apps/web/public",
});
