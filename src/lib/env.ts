import { z } from "zod";

export const envSchema = z.object({
  DOMAIN: z.string(),
});

export type Env = z.infer<typeof envSchema>;

export const env = envSchema.parse(process.env);
