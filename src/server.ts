import { Hono } from "hono";
import { yoga } from "./yoga";
import { serveStatic } from "hono/bun";

const app = new Hono();

app.on(["get", "post"], "/graphql", (c) => {
  return yoga.handle(c.req.raw, c);
});

app.get("/healthz", (c) => {
  return yoga.handle(c.req.raw, c);
});

app.use("*", serveStatic({ root: "public" }));

export default app;
