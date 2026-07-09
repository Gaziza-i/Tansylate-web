import { getDb } from "../db";
import mysql2 from "mysql2/promise";

export async function runStartupMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) return;

  let conn: mysql2.Connection | undefined;
  try {
    conn = await mysql2.createConnection(url);

    // Add sku column if missing
    const [rows] = await conn.query<mysql2.RowDataPacket[]>(
      "SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'products' AND COLUMN_NAME = 'sku'"
    );
    if (rows.length === 0) {
      await conn.query("ALTER TABLE `products` ADD `sku` varchar(100)");
      console.log("[migrate] Added column: products.sku");
    }

    // Create blogger_videos table if missing
    await conn.query(`
      CREATE TABLE IF NOT EXISTS \`blogger_videos\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`videoUrl\` varchar(1000) NOT NULL,
        \`description\` text,
        \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (\`id\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);
    console.log("[migrate] Ensured table: blogger_videos");
  } catch (err) {
    console.warn("[migrate] Startup migration warning:", err);
  } finally {
    conn?.end().catch(() => {});
  }
}
