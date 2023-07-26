import type { Resolvers } from "@/generated/graphql";

export const resolvers: Resolvers = {
  Query: {
    account: (_, { id }, { prisma }) => {
      return prisma.account.findUnique({ where: { id } });
    },
  },
};
