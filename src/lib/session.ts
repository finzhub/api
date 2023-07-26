import { env } from "./env";

export const getSession = async (request: Request) => {
  const session = await request.cookieStore?.get("session");
  if (!session) {
    throw new Error("No session found");
  }
  return session.value;
};

export const setSession = async (request: Request, userId: string) => {
  await request.cookieStore?.set({
    name: "session",
    value: userId,
    httpOnly: true,
    domain: env.DOMAIN,
    expires: 5 * 60 * 1000,
  });
};

export const deleteSession = async (request: Request) =>
  request.cookieStore?.delete("session");
