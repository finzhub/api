import type { Resolvers } from "@/generated/graphql";
import { cacheGetChallenge, cacheSetChallenge } from "@/lib/memory_store";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import {
  verifyAuthenticationInputSchema,
  verifyRegistrationInputSchema,
} from "./validate";
import { getSession, setSession, deleteSession } from "@/lib/session";

export const resolvers: Resolvers = {
  Mutation: {
    generateRegistrationOptions: async (
      _,
      { input },
      { prisma, request, env }
    ) => {
      const user = await prisma.user.upsert({
        where: input,
        create: input,
        update: {},
        include: { credentials: true },
      });

      const options = generateRegistrationOptions({
        rpID: env.DOMAIN,
        rpName: "Finz",
        userID: user.id,
        userName: user.username,
        timeout: 60000,
        attestationType: "none",
        authenticatorSelection: {
          residentKey: "required",
          userVerification: "preferred",
          requireResidentKey: false,
        },
        supportedAlgorithmIDs: [-7, -257],
        excludeCredentials: user.credentials.map((credential) => ({
          id: credential.externalId,
          type: "public-key",
          transports: credential.transports as AuthenticatorTransport[],
        })),
        extensions: { credProps: true },
      });

      cacheSetChallenge(user.id, options.challenge);
      await setSession(request, user.id);

      return { ...options };
    },
    verifyRegistration: async (_, { input }, { prisma, request, env }) => {
      const session = await getSession(request);
      const response = verifyRegistrationInputSchema.parse(input);
      const expectedChallenge = cacheGetChallenge(session);

      const verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: `https://${env.DOMAIN}`,
        expectedRPID: env.DOMAIN,
        supportedAlgorithmIDs: [-7, -257],
        requireUserVerification: true,
      });

      const { verified, registrationInfo } = verification;

      if (verified && registrationInfo) {
        await prisma.credential.create({
          data: {
            externalId: Buffer.from(registrationInfo.credentialID),
            publicKey: Buffer.from(registrationInfo.credentialPublicKey),
            signCount: registrationInfo.counter,
            transports: response.response.transports,
            user: { connect: { id: session } },
          },
        });
      }

      await request.cookieStore?.delete("session");

      return verified;
    },

    generateAuthenticationOptions: async (
      _,
      { input },
      { prisma, request, env }
    ) => {
      const user = await prisma.user.findFirstOrThrow({
        where: {
          OR: [{ email: input.identifier }, { username: input.identifier }],
        },
        include: { credentials: true },
      });

      const options = generateAuthenticationOptions({
        timeout: 60000,
        allowCredentials: user.credentials.map((credential) => ({
          id: credential.externalId,
          type: "public-key",
          transports: credential.transports as AuthenticatorTransport[],
        })),
        userVerification: "required",
        rpID: env.DOMAIN,
      });

      cacheSetChallenge(user.id, options.challenge);
      await setSession(request, user.id);

      return { ...options };
    },

    verifyAuthentication: async (_, { input }, { prisma, request, env }) => {
      const session = await getSession(request);
      const response = verifyAuthenticationInputSchema.parse(input);
      const expectedChallenge = cacheGetChallenge(session);

      const credential = await prisma.credential.findFirstOrThrow({
        where: {
          userId: session,
          externalId: Buffer.from(response.rawId, "base64"),
        },
      });

      const verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: `https://${env.DOMAIN}`,
        expectedRPID: env.DOMAIN,
        requireUserVerification: true,
        authenticator: {
          counter: credential.signCount,
          credentialID: credential.externalId,
          credentialPublicKey: credential.publicKey,
          transports: credential.transports as AuthenticatorTransport[],
        },
      });

      const { verified, authenticationInfo } = verification;

      if (verified && authenticationInfo) {
        await prisma.credential.update({
          where: { id: credential.id },
          data: { signCount: authenticationInfo.newCounter },
        });
      }

      await deleteSession(request);

      return verified;
    },
  },
};
