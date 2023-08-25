import { Hono } from "hono";
import { yoga } from "./yoga";

const app = new Hono();

app.on(["get", "post"], "/graphql", (c) => {
  return yoga.handle(c.req.raw, c);
});

app.get("/healthz", (c) => {
  return yoga.handle(c.req.raw, c);
});

export default app;
