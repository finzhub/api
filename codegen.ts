import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/graphql/**/*.gql",
  generates: {
    "src/generated/graphql.ts": {
      config: {
        useTypeImports: true,
        contextType: "Context",
      },
      plugins: [
        "typescript",
        "typescript-resolvers",
        {
          add: {
            content: 'import type { Context } from "@/graphql/context";',
          },
        },
      ],
    },
  },
};

export default config;
