import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { sdk } from "./_core/sdk";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getAllProducts, getAllProductsAdmin, getProductById,
  createProduct, updateProduct, deleteProduct, createContact,
  getAllBloggerVideos, createBloggerVideo, deleteBloggerVideo,
  getSetting, setSetting,
  createOrder, getAllOrders,
  upsertUser,
} from "./db";
import { notifyOwner } from "./_core/notification";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
    adminLogin: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input, ctx }) => {
        const expectedUsername = (process.env.ADMIN_USERNAME || "admin").trim();
        const expectedPassword = process.env.ADMIN_PASSWORD?.trim();
        console.log("[adminLogin] expectedPw len:", expectedPassword?.length, "inputPw len:", input.password?.length, "userMatch:", input.username?.trim() === expectedUsername, "expectedPw codes:", [...(expectedPassword?.slice(0,4) ?? "")].map(c => c.charCodeAt(0)), "inputPw codes:", [...(String(input.password ?? "").slice(0,4))].map(c => c.charCodeAt(0)));
        if (!expectedPassword) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "ADMIN_PASSWORD не настроен на сервере" });
        }
        if (input.username?.trim() !== expectedUsername || String(input.password) !== expectedPassword) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Неверный логин или пароль" });
        }
        const ownerOpenId = ENV.ownerOpenId || "tansylate_admin";
        await upsertUser({ openId: ownerOpenId, name: "Admin", role: "admin", lastSignedIn: new Date() });
        const token = await sdk.createSessionToken(ownerOpenId, { name: "Admin", expiresInMs: ONE_YEAR_MS });
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true };
      }),
  }),

  catalog: router({
    products: publicProcedure.query(async () => getAllProducts()),
    product: publicProcedure
      .input((input: any) => input)
      .query(async ({ input }) => getProductById(input.id)),
  }),

  admin: router({
    products: adminProcedure.query(async () => getAllProductsAdmin()),

    createProduct: adminProcedure
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

    updateProduct: adminProcedure
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

    deleteProduct: adminProcedure
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

  settings: router({
    getAbout: publicProcedure.query(async () => {
      const raw = await getSetting("about_section");
      return raw ? JSON.parse(raw) : null;
    }),
    setAbout: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        await setSetting("about_section", JSON.stringify(input));
        return { success: true };
      }),
    getHero: publicProcedure.query(async () => {
      const raw = await getSetting("hero_section");
      return raw ? JSON.parse(raw) : null;
    }),
    setHero: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        await setSetting("hero_section", JSON.stringify(input));
        return { success: true };
      }),
    getDelivery: publicProcedure.query(async () => {
      const raw = await getSetting("delivery_section");
      return raw ? JSON.parse(raw) : null;
    }),
    setDelivery: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        await setSetting("delivery_section", JSON.stringify(input));
        return { success: true };
      }),
    getContacts: publicProcedure.query(async () => {
      const raw = await getSetting("contacts_section");
      return raw ? JSON.parse(raw) : null;
    }),
    setContacts: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        await setSetting("contacts_section", JSON.stringify(input));
        return { success: true };
      }),
    getLooks: publicProcedure.query(async () => {
      const raw = await getSetting("looks_section");
      return raw ? JSON.parse(raw) : null;
    }),
    setLooks: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        await setSetting("looks_section", JSON.stringify(input));
        return { success: true };
      }),
  }),

  bloggers: router({
    getAll: publicProcedure.query(async () => getAllBloggerVideos()),
    add: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => createBloggerVideo(input.url, input.description)),
    delete: adminProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => deleteBloggerVideo(input.id)),
  }),

  orders: router({
    create: publicProcedure
      .input((input: any) => input)
      .mutation(async ({ input }) => {
        const result = await createOrder({
          name: input.name,
          phone: input.phone,
          address: input.address ?? null,
          items: JSON.stringify(input.items),
          total: input.total,
        });
        try {
          await notifyOwner({
            title: `Новый заказ #${result.id}`,
            content: `Имя: ${input.name}\nТелефон: ${input.phone}\nАдрес: ${input.address ?? "не указан"}\nСумма: ${input.total.toLocaleString("ru-RU")} ₽`,
          });
        } catch {}
        return { id: result.id };
      }),
    getAll: adminProcedure.query(async () => getAllOrders()),
  }),
});

export type AppRouter = typeof appRouter;
