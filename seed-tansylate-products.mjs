#!/usr/bin/env node
// Запуск: node seed-tansylate-products.mjs
// Сервер должен быть запущен (pm2 start tansylate или npm run dev)

const BASE_URL = process.env.SERVER_URL || "http://localhost:3000";

const specsCommon = [
  { label: "Материал", value: "Трёхнитка футер (без начеса)" },
  { label: "Класс ткани", value: 'Премиум-качество «Пенье»' },
  { label: "Состав", value: "80% хлопок, 20% полиэстер" },
  { label: "Плотность", value: "360 г/м²" },
];

const featuresCommon = [
  "Износостойкий материал",
  "Швы обработаны на профессиональном оборудовании",
  "Премиальная фурнитура",
  "Авторский бренд, производство Россия",
];

const sizeTableHoodie = [
  {
    title: "Размерная сетка: кофта",
    rows: [
      { size: "XS-S", ru: "42", col3: "84 см", col3label: "Обхват груди", waist: "66 см" },
      { size: "S-M",  ru: "44", col3: "88 см", col3label: "Обхват груди", waist: "70 см" },
    ],
  },
];

const sizeTablePants = [
  {
    title: "Размерная сетка: штаны",
    rows: [
      { size: "XS-S", ru: "42", col3: "66 см", col3label: "Обхват талии", waist: "90 см" },
      { size: "S-M",  ru: "44", col3: "70 см", col3label: "Обхват талии", waist: "94 см" },
    ],
  },
];

const sizeTableSuit = [...sizeTableHoodie, ...sizeTablePants];

const products = [
  {
    name: "Спортивный костюм",
    price: 8900,
    collection: "Базовая коллекция",
    description: "Спортивный / повседневный костюм из трёхнитки футер (без начеса). Премиум-качество «Пенье». Комплект: кофта + брюки.",
    specs: specsCommon,
    sizeTables: sizeTableSuit,
    features: featuresCommon,
    careInstructions: [
      { icon: "wash", text: "Стирать при 30°C" },
      { icon: "bleach", text: "Не отбеливать" },
      { icon: "iron", text: "Гладить при низкой температуре" },
      { icon: "dry", text: "Не использовать барабанную сушку" },
    ],
    telegramLink: "https://t.me/tansylate_bot",
    isVisible: 1,
    sizes: ["XS-S", "S-M"],
    images: [],
  },
  {
    name: "Худи",
    price: 5400,
    collection: "Базовая коллекция",
    description: "Кофта из трёхнитки футер (без начеса). Премиум-качество «Пенье». Мягкая, тёплая, износостойкая.",
    specs: specsCommon,
    sizeTables: sizeTableHoodie,
    features: featuresCommon,
    careInstructions: [
      { icon: "wash", text: "Стирать при 30°C" },
      { icon: "bleach", text: "Не отбеливать" },
      { icon: "iron", text: "Гладить при низкой температуре" },
      { icon: "dry", text: "Не использовать барабанную сушку" },
    ],
    telegramLink: "https://t.me/tansylate_bot",
    isVisible: 1,
    sizes: ["XS-S", "S-M"],
    images: [],
  },
  {
    name: "Брюки",
    price: 4500,
    collection: "Базовая коллекция",
    description: "Спортивные брюки из трёхнитки футер (без начеса). Премиум-качество «Пенье». Удобные, практичные, долговечные.",
    specs: specsCommon,
    sizeTables: sizeTablePants,
    features: featuresCommon,
    careInstructions: [
      { icon: "wash", text: "Стирать при 30°C" },
      { icon: "bleach", text: "Не отбеливать" },
      { icon: "iron", text: "Гладить при низкой температуре" },
      { icon: "dry", text: "Не использовать барабанную сушку" },
    ],
    telegramLink: "https://t.me/tansylate_bot",
    isVisible: 1,
    sizes: ["XS-S", "S-M"],
    images: [],
  },
];

async function createProduct(product) {
  const url = `${BASE_URL}/api/trpc/admin.createProduct`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ json: product }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = await res.json();
  if (data?.error) throw new Error(JSON.stringify(data.error));
  return data;
}

async function main() {
  console.log(`Подключаемся к ${BASE_URL}...\n`);

  for (const product of products) {
    try {
      await createProduct(product);
      console.log(`✓ Добавлен: ${product.name} — ${product.price.toLocaleString("ru-RU")} ₽`);
    } catch (err) {
      console.error(`✗ Ошибка при добавлении "${product.name}":`, err.message);
    }
  }

  console.log("\nГотово!");
}

main();
