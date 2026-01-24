import { defineConfig } from "orval";
import { config } from "./src/config";

export default defineConfig({
  "aboard-api": {
    input: "./openapi.json",
    output: {
      target: "./src/lib/api-client.ts",
      mode: "single",
      client: "fetch",
      httpClient: "fetch",
      baseUrl: config.BASE_URL,
    },
  },
});
