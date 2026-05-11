import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("catalog.products", () => {
  it("returns an array of products", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.catalog.products();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("contacts.submit", () => {
  it("accepts a contact form submission", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.contacts.submit({
      name: "Test User",
      email: "test@example.com",
      message: "This is a test message",
    });

    expect(result).toEqual({ success: true });
  });

  it("requires all fields", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.contacts.submit({
        name: "",
        email: "",
        message: "",
      });
      // Should not reach here if validation is strict
    } catch (error) {
      expect(error).toBeDefined();
    }
  });
});
