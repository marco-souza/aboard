import { defineConfig } from "vitest/config";
import solidPlugin from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [solidPlugin(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    ui: true,
  },
});
