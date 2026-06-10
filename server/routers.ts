import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import {
  getAllProducts, getAllProductsAdmin, getProductById,
  createProduct, updateProduct, deleteProduct, createContact
} from "./db";
import { notifyOwner } from "./_core/notification";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  catalog: router({
    products: publicProcedure.query(async () => getAllProducts()),
    product: publicProcedure
      .input((input: any) => input)
      .query(async ({ input }) => getProductById(input.id)),
  }),

  admin: router({
    // Получить все товары (включая скрытые)
    products: publicProcedure.query(async () => getAllProductsAdmin()),

    // Создать товар
    createProduct: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        return createProduct({
          name: input.name,
          price: input.price,
          description: input.description ?? null,
          collection: input.collection ?? null,
          images: input.images ? JSON.stringify(input.images) : null,
          features: input.features ? JSON.stringify(input.features) : null,
          specs: input.specs ? JSON.stringify(input.specs) : null,
          sizeTables: input.sizeTables ? JSON.stringify(input.sizeTables) : null,
          careInstructions: input.careInstructions ? JSON.stringify(input.careInstructions) : null,
          careNote: input.careNote ?? null,
          telegramLink: input.telegramLink ?? "https://t.me/tansylate_bot",
          isVisible: input.isVisible ?? 1,
          sizes: input.sizes ? JSON.stringify(input.sizes) : "[]",
          imageUrl: input.imageUrl ?? null,
          sku: input.sku ?? null,
        });
      }),

    // Обновить товар
    updateProduct: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const updateData: any = { ...data };
        if (data.images !== undefined) updateData.images = JSON.stringify(data.images);
        if (data.features !== undefined) updateData.features = JSON.stringify(data.features);
        if (data.specs !== undefined) updateData.specs = JSON.stringify(data.specs);
        if (data.sizeTables !== undefined) updateData.sizeTables = JSON.stringify(data.sizeTables);
        if (data.careInstructions !== undefined) updateData.careInstructions = JSON.stringify(data.careInstructions);
        if (data.sizes !== undefined) updateData.sizes = JSON.stringify(data.sizes);
        return updateProduct(id, updateData);
      }),

    // Удалить товар
    deleteProduct: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => deleteProduct(input.id)),
  }),

  contacts: router({
    submit: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        try {
          await createContact({ name: input.name, email: input.email, message: input.message });
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
