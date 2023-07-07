import { loadFilesSync } from "@graphql-tools/load-files";
import { mergeTypeDefs } from "@graphql-tools/merge";
import { createSchema } from "graphql-yoga";

const typesArray = loadFilesSync(`${import.meta.dir}`, { extensions: ["gql"] });

const typeDefs = mergeTypeDefs(typesArray);

export const schema = createSchema({
  typeDefs,
  resolvers: {},
});
