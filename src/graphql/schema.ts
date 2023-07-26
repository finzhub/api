import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { createSchema } from "graphql-yoga";
import type { Context } from "./context";
import {
  JSONObjectDefinition,
  JSONObjectResolver,
  VoidTypeDefinition,
  VoidResolver,
} from "graphql-scalars";

const typesArray = loadFilesSync(`${import.meta.dir}`, { extensions: ["gql"] });
const resolversArray = loadFilesSync(`${import.meta.dir}/**/*.resolvers.ts`, {
  extensions: ["ts"],
});

const typeDefs = mergeTypeDefs([
  typesArray,
  JSONObjectDefinition,
  VoidTypeDefinition,
]);

const resolvers = mergeResolvers([
  ...resolversArray,
  { JSONObject: JSONObjectResolver },
  { Void: VoidResolver },
]);

export const schema = createSchema<Context>({ typeDefs, resolvers });
