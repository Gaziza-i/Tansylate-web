import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import { parse as parseCookieHeader } from "cookie";
import { SITE_COOKIE_NAME } from "@shared/const";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
  siteAccess: boolean;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  let siteAccess = false;
  try {
    const cookies = parseCookieHeader(opts.req.headers.cookie || "");
    const session = await sdk.verifySession(cookies[SITE_COOKIE_NAME]);
    siteAccess = !!session;
  } catch {
    siteAccess = false;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    siteAccess,
  };
}
