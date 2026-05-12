import { getDb } from './server/db.ts';
import { products } from './drizzle/schema.ts';

const sampleProducts = [
  {
    name: "Платье из льна",
    price: 4500,
    sizes: "XS,S,M,L,XL",
    description: "Элегантное платье из 100% натурального льна. Идеально для летнего сезона.",
    image_url: "https://images.unsplash.com/photo-1595777707802-21b287d3c311?w=500&h=600&fit=crop"
  },
  {
    name: "Рубашка оверсайз",
    price: 3200,
    sizes: "XS,S,M,L,XL,XXL",
    description: "Свободная рубашка из хлопка с минималистичным дизайном. Универсальный предмет гардероба.",
    image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=600&fit=crop"
  },
  {
    name: "Брюки классические",
    price: 3800,
    sizes: "XS,S,M,L,XL",
    description: "Классические брюки из смеси хлопка и льна. Подходят для любого случая.",
    image_url: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=500&h=600&fit=crop"
  },
  {
    name: "Кардиган шерстяной",
    price: 5200,
    sizes: "XS,S,M,L,XL",
    description: "Теплый кардиган из премиальной шерсти. Идеален для холодного сезона.",
    image_url: "https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=500&h=600&fit=crop"
  },
  {
    name: "Юбка миди",
    price: 3500,
    sizes: "XS,S,M,L,XL",
    description: "Элегантная юбка миди из натурального хлопка. Идеальный выбор для повседневного стиля.",
    image_url: "https://images.unsplash.com/photo-1606927437129-d1e8a5e8f1d5?w=500&h=600&fit=crop"
  },
  {
    name: "Топ из хлопка",
    price: 2200,
    sizes: "XS,S,M,L,XL",
    description: "Простой и элегантный топ из 100% хлопка. Базовый предмет любого гардероба.",
    image_url: "https://images.unsplash.com/photo-1589637318914-1755a6b8ccb5?w=500&h=600&fit=crop"
  }
];

async function seedProducts() {
  try {
    const db = await getDb();
    if (!db) {
      console.error("Database not available");
      return;
    }

    for (const product of sampleProducts) {
      await db.insert(products).values(product);
      console.log(`✓ Added: ${product.name}`);
    }

    console.log("\n✓ All products seeded successfully!");
  } catch (error) {
    console.error("Error seeding products:", error);
  }
}

seedProducts();
