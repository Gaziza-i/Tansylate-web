import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, contacts, bloggerVideos, siteSettings, orders, InsertContact, InsertProduct, InsertOrder, Product } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllProducts() {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get products: database not available"); return []; }
  try {
    const result = await db.select().from(products).where(eq(products.isVisible, 1));
    return result;
  } catch (error) { console.error("[Database] Failed to get products:", error); throw error; }
}

export async function getAllProductsAdmin() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(products);
  } catch (error) { console.error("[Database] Failed to get products (admin):", error); throw error; }
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get product: database not available"); return undefined; }
  try {
    const result = await db.select().from(products).where(eq((products as any).id, id)).limit(1);
    return result.length > 0 ? result[0] : undefined;
  } catch (error) { console.error("[Database] Failed to get product:", error); throw error; }
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    const result = await db.insert(products as any).values(data);
    return result;
  } catch (error) { console.error("[Database] Failed to create product:", error); throw error; }
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.update(products as any).set(data).where(eq((products as any).id, id));
    return { success: true };
  } catch (error) { console.error("[Database] Failed to update product:", error); throw error; }
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  try {
    await db.delete(products as any).where(eq((products as any).id, id));
    return { success: true };
  } catch (error) { console.error("[Database] Failed to delete product:", error); throw error; }
}

export async function createContact(contact: InsertContact) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot create contact: database not available"); return undefined; }
  try {
    const result = await db.insert(contacts as any).values(contact);
    return result;
  } catch (error) { console.error("[Database] Failed to create contact:", error); throw error; }
}

export async function getSetting(key: string): Promise<string | null> {
  const db = await getDb();
  if (!db) return null;
  try {
    const rows = await db.select().from(siteSettings as any).where(eq((siteSettings as any).key, key)).limit(1);
    return rows[0]?.value ?? null;
  } catch { return null; }
}

export async function setSetting(key: string, value: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(siteSettings as any).values({ key, value })
    .onDuplicateKeyUpdate({ set: { value } });
}

export async function getAllBloggerVideos() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(bloggerVideos as any).orderBy((bloggerVideos as any).createdAt);
  } catch { return []; }
}

export async function createBloggerVideo(videoUrl: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(bloggerVideos as any).values({ videoUrl, description: description ?? null });
}

export async function deleteBloggerVideo(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.delete(bloggerVideos as any).where(eq((bloggerVideos as any).id, id));
}

export async function createOrder(data: Omit<InsertOrder, "id" | "status" | "createdAt">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders as any).values(data);
  return { id: (result as any)[0].insertId as number };
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  try {
    return await db.select().from(orders as any).orderBy((orders as any).createdAt);
  } catch { return []; }
}
