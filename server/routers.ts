import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { getAllProducts, getProductById, createContact } from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  catalog: router({
    products: publicProcedure.query(async () => {
      return getAllProducts();
    }),
    product: publicProcedure
      .input((input: any) => input)
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),
  }),

  contacts: router({
    submit: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        try {
          await createContact({
            name: input.name,
            email: input.email,
            message: input.message,
          });

          // Notify owner of new contact submission
          await notifyOwner({
            title: "New Contact Form Submission",
            content: `From: ${input.name}\nEmail: ${input.email}\n\nMessage: ${input.message}`,
          });

          return { success: true };
        } catch (error) {
          console.error("Failed to submit contact:", error);
          throw error;
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
