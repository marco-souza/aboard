import { Hono } from "hono";

export const posts = new Hono()
  // list
  .get("/", async (c) => {
    return c.json({
      posts: [
        { id: 1, title: "Hello World" },
        { id: 2, title: "Goodbye World" },
      ],
    });
  });
