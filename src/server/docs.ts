import { createRoute, type OpenAPIHono, z } from "@hono/zod-openapi";
import { Scalar } from "@scalar/hono-api-reference";

const docsResponseSchema = z
  .object({
    openapi: z.string(),
    info: z.object({
      title: z.string(),
      version: z.string(),
    }),
  })
  .loose();

export function configureDocs(app: OpenAPIHono) {
  // Serve the OpenAPI JSON
  app.openapi(
    createRoute({
      method: "get",
      path: "/openapi",
      responses: {
        200: {
          description: "OpenAPI Specification JSON",
          content: {
            "application/json": {
              schema: docsResponseSchema,
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
    "/openapi/ui",
    Scalar({
      defaultOpenAllTags: true,
      url: "/api/openapi",
    }),
  );
}
