import { int, tinyint, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table — расширенная версия с поддержкой карусели,
 * размерных сеток, характеристик и инструкций по уходу.
 * Поля images, features, specs, sizeTables, careInstructions хранятся как JSON-строки.
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
  description: text("description"),
  collection: varchar("collection", { length: 255 }),
  // JSON: string[]  — массив URL изображений в нужном порядке
  images: text("images"),
  // JSON: string[]  — список особенностей (с галочкой ✓)
  features: text("features"),
  // JSON: { label: string; value: string }[]  — характеристики
  specs: text("specs"),
  // JSON: { title: string; rows: { size: string; ru: string; col3: string; col3label: string; waist: string }[] }[]
  sizeTables: text("sizeTables"),
  // JSON: { icon: string; text: string }[]  — иконка (wash/bleach/iron/tumble/dry) + текст
  careInstructions: text("careInstructions"),
  careNote: text("careNote"),
  telegramLink: varchar("telegramLink", { length: 500 }),
  isVisible: tinyint("isVisible").notNull().default(1),
  // legacy поля — сохраняем для совместимости
  sizes: varchar("sizes", { length: 255 }).notNull().default("[]"),
  imageUrl: varchar("imageUrl", { length: 500 }),
  composition: text("composition"),
  care: text("care"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

export const contacts = mysqlTable("contacts", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = typeof contacts.$inferInsert;
