import { z } from "zod";

export const authenticatorTransportFutureSchema = z.union([
  z.literal("ble"),
  z.literal("internal"),
  z.literal("nfc"),
  z.literal("usb"),
  z.literal("cable"),
  z.literal("hybrid"),
]);

export const publicKeyCredentialTypeSchema = z.literal("public-key");

export const authenticatorAttachmentSchema = z.union([
  z.literal("cross-platform"),
  z.literal("platform"),
]);

export const userVerificationRequirementSchema = z.union([
  z.literal("discouraged"),
  z.literal("preferred"),
  z.literal("required"),
]);

export const response = z.object({
  clientDataJSON: z.string(),
  attestationObject: z.string(),
  transports: z.array(authenticatorTransportFutureSchema).optional(),
});

export const clientExtensionResults = z.object({
  appid: z.boolean().optional(),
  credProps: z.object({ rk: z.boolean().optional() }).optional(),
  hmacCreateSecret: z.boolean().optional(),
});

export const verifyRegistrationInputSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response,
  authenticatorAttachment: authenticatorAttachmentSchema.optional(),
  clientExtensionResults,
  type: publicKeyCredentialTypeSchema,
});

export const credentialPropertiesOutputSchema = z.object({
  rk: z.boolean().optional(),
});

export const authenticatorAssertionResponseJSONSchema = z.object({
  clientDataJSON: z.string(),
  authenticatorData: z.string(),
  signature: z.string(),
  userHandle: z.string().optional(),
});

export const authenticationExtensionsClientOutputsSchema = z.object({
  appid: z.boolean().optional(),
  credProps: credentialPropertiesOutputSchema.optional(),
  hmacCreateSecret: z.boolean().optional(),
});

export const verifyAuthenticationInputSchema = z.object({
  id: z.string(),
  rawId: z.string(),
  response: authenticatorAssertionResponseJSONSchema,
  authenticatorAttachment: authenticatorAttachmentSchema.optional(),
  clientExtensionResults: authenticationExtensionsClientOutputsSchema,
  type: publicKeyCredentialTypeSchema,
});
