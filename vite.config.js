import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import tailwindcss from "@tailwindcss/vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		react(),
		tailwindcss(),
		nodePolyfills({
			include: ["buffer", "process", "crypto", "stream"],
			globals: {
				Buffer: true,
				global: true,
				process: true,
			},
		}),
	],
	resolve: {
		alias: {
			constants: resolve(__dirname, "src/constants"),
			helpers: resolve(__dirname, "src/helpers"),
			services: resolve(__dirname, "src/services"),
			pages: resolve(__dirname, "src/pages"),
			types: resolve(__dirname, "src/types"),
			assets: resolve(__dirname, "src/assets"),
			store: resolve(__dirname, "src/store"),
			web: resolve(__dirname, "src/web"),
			basics: resolve(__dirname, "src/web/basics"),
			api: resolve(__dirname, "src/api"),
			components: resolve(__dirname, "src/components"),
			hooks: resolve(__dirname, "src/hooks"),
		},
	},
});
