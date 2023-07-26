import { schema } from "@/graphql/schema";
import { createYoga } from "graphql-yoga";
import { prisma } from "@/lib/db";
import { security } from "./lib/security";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import { env } from "@/lib/env";

export const yoga = createYoga({
  schema,
  context: { prisma, env },
  plugins: [security, useCookies()],
  healthCheckEndpoint: "/healthz",
  logging: "debug",
});
