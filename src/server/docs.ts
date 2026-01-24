import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

export function configureDocs(app: OpenAPIHono) {
  // Serve the OpenAPI JSON
  app.openapi(
    createRoute({
      method: "get",
      path: "/docs",
      responses: {
        200: {
          description: "OpenAPI Specification JSON",
          content: {
            "application/json": {
              schema: z.object({
                openapi: z.string(),
                info: z.object({
                  title: z.string(),
                  version: z.string(),
                }),
              }),
            },
          },
        },
      },
    }),
    (c) => {
      const spec = app.getOpenAPIDocument({
        openapi: "3.0.0",
        info: {
          version: "1.0.0",
          title: "Aboard API",
        },
      });
      return c.json(spec);
    },
  );

  // Serve the Scalar UI
  app.get(
    "/docs/ui",
    Scalar({
      defaultOpenAllTags: true,
      url: "/api/docs",
    }),
  );
}
