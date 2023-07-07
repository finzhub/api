import { schema } from "@/graphql/schema";
import { createYoga } from "graphql-yoga";

const yoga = createYoga({ schema });
const server = Bun.serve(yoga);

console.info(
  `Server is running on ${new URL(
    yoga.graphqlEndpoint,
    `http://${server.hostname}:${server.port}`
  )}`
);
