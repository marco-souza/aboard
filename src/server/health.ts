import { createRoute, OpenAPIHono, z } from "@hono/zod-openapi";

export const health = new OpenAPIHono();

health.openapi(
  createRoute({
    method: "get",
    path: "/",
    responses: {
      200: {
        description: "Health check",
        content: {
          "application/json": {
            schema: z.object({
              status: z.string(),
            }),
          },
        },
      },
    },
  }),
  (c) => {
    return c.json({ status: "ok" });
  },
);
