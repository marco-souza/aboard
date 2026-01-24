import { writeFile } from "node:fs/promises";
import { app } from "../src/server/router.ts";

const spec = app.getOpenAPIDocument({
  openapi: "3.0.0",
  info: {
    version: "1.0.0",
    title: "Aboard API",
  },
});

await writeFile("openapi.json", JSON.stringify(spec, null, 2));
console.log("✅ Generated openapi.json");
