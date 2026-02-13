import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import {
  createUserRequestSchema,
  listUsersQuerySchema,
  updateUserRequestSchema,
  userIdParamSchema,
} from "~/domain/user/schema";

export const users = new Hono()
  // list
  .get("/", zValidator("query", listUsersQuerySchema), (c) => {
    const { provider, limit, offset } = c.req.valid("query");
    // TODO: fetch from DB with filters
    return c.json({ users: [], provider, limit, offset });
  })
  // get by id
  .get("/:id", zValidator("param", userIdParamSchema), (c) => {
    const { id } = c.req.valid("param");
    // TODO: fetch from DB
    return c.json({ id });
  })
  // create
  .post("/", zValidator("json", createUserRequestSchema), (c) => {
    const data = c.req.valid("json");
    // TODO: persist to DB
    return c.json({ id: crypto.randomUUID(), ...data }, 201);
  })
  // update
  .put(
    "/:id",
    zValidator("param", userIdParamSchema),
    zValidator("json", updateUserRequestSchema),
    (c) => {
      const { id } = c.req.valid("param");
      const data = c.req.valid("json");
      // TODO: update in DB
      return c.json({ id, ...data });
    },
  )
  // delete
  .delete("/:id", zValidator("param", userIdParamSchema), (c) => {
    const { id } = c.req.valid("param");
    // TODO: delete from DB
    return c.json({ id, deleted: true });
  });
