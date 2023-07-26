import type { Context } from "@/graphql/context";
import { useGenericAuth } from "@envelop/generic-auth";
import type { User } from "@prisma/client";
import { GraphQLError } from "graphql";

export const security = useGenericAuth<User, Context>({
  mode: "protect-granular",
  resolveUserFn: ({ prisma, request }) => {
    const token = request.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      return null;
    }

    return prisma.user.findUnique({
      where: { email: token },
    });
  },
  validateUser: ({ user, fieldAuthDirectiveNode }) => {
    if (!fieldAuthDirectiveNode) {
      return;
    }

    if (!user) {
      return new GraphQLError("You must be logged in to do that", {
        extensions: { code: "UNAUTHENTICATED" },
      });
    }
  },
});
