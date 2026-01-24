import { Hono } from "hono";
import { posts } from "./posts";

export const app = new Hono()
	.basePath("/api/")
	// add routers
	.route("/posts", posts);
