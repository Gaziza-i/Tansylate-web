import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Menu, X, Plus, Truck, RotateCcw, Leaf, Search, ChevronRight, ChevronLeft, Heart, ShoppingBag } from "lucide-react";
import { useLocation } from "wouter";

function parseJSON<T>(val: string | null | undefined, fallback: T): T {
  if (!val) return fallback;
  try { return JSON.parse(val) as T; } catch { return fallback; }
}

const FALLBACK_IMAGES = [
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/kirptveKGcDaZRyF.jpeg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/ccDvhQruEybysjHS.jpeg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/zapsecMLpJMkiiEY.jpeg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/StimjAPVCzkzGPYg.jpeg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/WMXUqCBpOZdkohTw.jpeg",
];

const NAV_LEFT = [
  { label: "Каталог", id: "catalog" },
  { label: "О бренде", id: "about" },
  { label: "Образы", id: "looks" },
];
const NAV_RIGHT = [
  { label: "Оплата и доставка", id: "delivery" },
  { label: "Контакты", id: "contacts" },
];
const ALL_NAV = [...NAV_LEFT, ...NAV_RIGHT];

const navLink = "text-sm text-[#6B5C52] hover:text-[#2B2521] transition-colors whitespace-nowrap";

type SizeTable = { title: string; cols?: string[]; rows: any[] };

function normalizeSizeTable(raw: any): { title: string; cols: string[]; rows: string[][] } {
  if (raw.cols && Array.isArray(raw.rows?.[0])) return raw;
  const col3label = raw.rows?.[0]?.col3label ?? "Обхват груди";
  const extraCols: string[] = [];
  if (raw.rows?.some((r: any) => r.hips)) extraCols.push("Обхват бёдер (см)");
  if (raw.rows?.some((r: any) => r.height)) extraCols.push("Рост (см)");
  return {
    title: raw.title ?? "Размерная сетка",
    cols: ["Размер", "RU", col3label, "Обхват талии (см)", ...extraCols],
    rows: (raw.rows ?? []).map((r: any) => {
      const base = [r.size ?? "", r.ru ?? "", r.col3 ?? "", r.waist ?? ""];
      if (extraCols.includes("Обхват бёдер (см)")) base.push(r.hips ?? "—");
      if (extraCols.includes("Рост (см)")) base.push(r.height ?? "—");
      return base;
    }),
  };
}
type Spec = { label: string; value: string };
type CareItem = { icon: string; text: string };
type CartItem = { id: number; name: string; price: number; image: string; qty: number; size?: string };

function CareIcon({ icon }: { icon: string }) {
  const p = {
    width: 24, height: 24, viewBox: "0 0 24 24", fill: "none",
    stroke: "#6B5C52", strokeWidth: 1.5 as number,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className: "flex-shrink-0",
  };
  if (icon === "wash") return (
    <svg {...p}>
      <path d="M3.5 8h17l-2 12H5.5L3.5 8z"/>
      <text x="12" y="15.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#6B5C52" stroke="none" fontFamily="system-ui, Arial, sans-serif">30</text>
      <path d="M7 18.5c.5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0 .5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0"/>
    </svg>
  );
  if (icon === "bleach") return (
    <svg {...p}>
      <path d="M12 3L22 21H2L12 3z"/>
      <line x1="8" y1="10" x2="16" y2="20"/>
      <line x1="16" y1="10" x2="8" y2="20"/>
    </svg>
  );
  if (icon === "iron") return (
    <svg {...p}>
      <path d="M3 19h18"/>
      <path d="M3 19V15l3-8h9l6 8v4"/>
      <path d="M9 7V5h6v2"/>
      <circle cx="12" cy="14" r="1.2" fill="#6B5C52" stroke="none"/>
    </svg>
  );
  if (icon === "tumble" || icon === "tumble-dry") return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="1.5"/>
      <circle cx="12" cy="12" r="5"/>
      <line x1="5" y1="5" x2="19" y2="19"/>
    </svg>
  );
  if (icon === "dry") return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="1"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
    </svg>
  );
  if (icon === "hang") return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="7" y1="12" x2="17" y2="12"/>
    </svg>
  );
  return null;
}

function AccordionSection({ title, children, accent = false }: {
  title: string; children: React.ReactNode; accent?: boolean;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-[#DDD5C0]">
      <button
        className="w-full flex items-center justify-between py-[14px] text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[15px] font-medium text-[#2B2521]">{title}</span>
        {open
          ? <X size={16} className="text-[#2B2521] flex-shrink-0" />
          : <Plus size={16} className="text-[#2B2521] flex-shrink-0" />
        }
      </button>
      {open && (
        <div className={`pb-5 text-sm leading-relaxed ${accent ? "text-[#A0755A]" : "text-[#6B5C52]"}`}>
          {children}
        </div>
      )}
    </div>
  );
}

function ProductModal({
  product, images, carouselIndex, onClose, onPrev, onNext, onSetIndex, onAddToCart,
  wishlist, onToggleWishlist,
}: {
  product: any; images: string[]; carouselIndex: number;
  onClose: () => void; onPrev: () => void; onNext: () => void; onSetIndex: (i: number) => void;
  onAddToCart: (size?: string) => void;
  wishlist: Set<number>; onToggleWishlist: (id: number) => void;
}) {
  const specs = parseJSON<Spec[]>(product.specs, []);
  const sizeTables = parseJSON<SizeTable[]>(product.sizeTables, []);
  const features = parseJSON<string[]>(product.features, []);
  const careInstructions = parseJSON<CareItem[]>(product.careInstructions, []);

  const availableSizes = sizeTables.length > 0
    ? sizeTables[0].rows.map(r => r.size)
    : [];
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    availableSizes.length > 0 ? availableSizes[0] : undefined
  );

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 md:p-6" onClick={onClose}>
      <div
        className="bg-[#EEE8D2] rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-y-auto md:overflow-hidden flex flex-col md:flex-row relative"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow transition-all"
          aria-label="Закрыть"
        >
          <X size={18} className="text-[#2B2521]" />
        </button>
        <div className="relative bg-[#DDD5C0] md:w-[55%] flex-shrink-0 flex flex-col">
          <div className="relative w-full aspect-[3/4] md:aspect-auto md:flex-1 overflow-hidden">
            <img
              src={images[carouselIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all">
                  <ChevronLeft size={18} className="text-[#2B2521]" />
                </button>
                <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all">
                  <ChevronRight size={18} className="text-[#2B2521]" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-[#DDD5C0]">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => onSetIndex(idx)}
                  className={`flex-shrink-0 w-[60px] h-[60px] overflow-hidden transition-all ${
                    idx === carouselIndex
                      ? "outline outline-2 outline-[#2B2521]"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 md:overflow-y-auto flex flex-col">
          <div className="px-6 md:px-8 pt-6 pb-8 flex flex-col flex-1">
            <h2 className="text-xl md:text-2xl font-bold text-[#2B2521] leading-tight mb-1">
              {product.name}
            </h2>
            {(product.sku || product.id) && (
              <p className="text-xs text-[#9A9A9A] mb-4 uppercase tracking-wider">
                Артикул: {product.sku || String(product.id).padStart(6, "0")}
              </p>
            )}

            <p className="text-2xl font-medium text-[#2B2521] mb-2">
              {(product.price ?? 0).toLocaleString("ru-RU")} ₽
            </p>

            {product.description && (
              <p className="text-[15px] text-[#2B2521] leading-relaxed mb-5">{product.description}</p>
            )}

            {availableSizes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#A0755A] mb-3 uppercase tracking-wider">Размер</p>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-11 px-3 text-sm font-medium rounded transition-all ${
                        selectedSize === size
                          ? "border-2 border-[#1A1A1A] bg-white text-[#1A1A1A]"
                          : "border border-[#DDD5C0] bg-white text-[#6B5C52] hover:border-[#1A1A1A] hover:text-[#2B2521]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-[#DDD5C0] mb-4" />

            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => onAddToCart(selectedSize)}
                className="flex-1 h-12 bg-[#A0755A] text-white text-sm font-medium hover:bg-[#8B6444] transition-colors rounded"
              >
                Добавить в корзину
              </button>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="w-12 h-12 border border-[#DDD5C0] bg-white flex items-center justify-center hover:border-[#1A1A1A] transition-colors flex-shrink-0 rounded"
                aria-label="Избранное"
              >
                <Heart
                  size={20}
                  className={wishlist.has(product.id) ? "text-red-500" : "text-[#6B5C52]"}
                  fill={wishlist.has(product.id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            <div>
              {sizeTables.map((raw, ti) => {
                const table = normalizeSizeTable(raw);
                return (
                  <AccordionSection key={ti} title={table.title || "Размерная сетка"}>
                    <div className="rounded-lg overflow-hidden border border-[#DDD5C0] mb-1">
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm border-collapse min-w-[320px]">
                          <thead>
                            <tr className="bg-[#1A1A1A] text-white">
                              {table.cols.map((col, ci) => (
                                <th key={ci} className={`py-3 px-3 font-medium text-sm whitespace-nowrap ${ci === 0 ? "text-left px-4" : "text-center"}`}>{col}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, ri) => (
                              <tr key={ri} className={`${ri < table.rows.length - 1 ? "border-b border-[#DDD5C0]" : ""} bg-white`}>
                                {row.map((cell: string, ci: number) => (
                                  <td key={ci} className={`py-3 px-3 ${ci === 0 ? "font-semibold text-[#2B2521] text-left px-4 whitespace-nowrap" : "text-center text-[#6B5C52]"}`}>{cell}</td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </AccordionSection>
                );
              })}

              {specs.length > 0 && (
                <AccordionSection title="Состав" accent>
                  <div className="space-y-1">
                    {specs.map((spec, i) => (
                      <p key={i}>{spec.label}: {spec.value}</p>
                    ))}
                  </div>
                </AccordionSection>
              )}

              {(careInstructions.length > 0 || product.careNote) && (
                <AccordionSection title="Уход за изделием">
                  {careInstructions.length > 0 && (
                    <div className="space-y-3">
                      {careInstructions.map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <CareIcon icon={item.icon} />
                          <p>{item.text}</p>
                        </div>
                      ))}
                    </div>
                  )}
                  {product.careNote && <p className="italic mt-3">{product.careNote}</p>}
                </AccordionSection>
              )}

              {features.length > 0 && (
                <AccordionSection title="Информация об изделии">
                  <ul className="space-y-2">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-[#A0755A] flex-shrink-0 select-none">—</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              <div className="border-t border-[#DDD5C0]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_HERO = {
  badge: "Основано в 2026",
  title: "История в двух цветах",
  subtitle: "Одежда, в которой ты разный",
  buttonText: "Каталог",
};
const DEFAULT_DELIVERY = {
  title: "Доставка и возврат",
  cards: [
    { title: "Доставка", items: ["Доставка по всей России (СДЭК / Почта России)", "Сроки: 3–7 рабочих дней", "Стоимость уточняется при оформлении", "Примерка перед оплатой"] },
    { title: "Возврат", items: ["Возврат в течение 14 дней", "Бирки не срезаны, нет следов носки", "Стоимость упаковки не возвращается"] },
  ],
};
const DEFAULT_CONTACTS = {
  telegram: "https://t.me/tansylate",
  instagram: "https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1",
  tiktok: "https://www.tiktok.com/@tansylate",
};
const DEFAULT_LOOKS = {
  title: "Образы",
  description: "Скоро здесь появятся образы с нашими изделиями",
  photos: [] as string[],
};

const DEFAULT_ABOUT = {
  title: "О бренде",
  paragraphs: [
    "Меня зовут Тансылу, мне 16 лет. Моя цель — создавать по-настоящему долговечную одежду.",
    "Все ключевые этапы контролирую лично: от разработки удобных эскизов и работы с дизайнерами до проверки швейного цеха и финальной упаковки.",
    "Это не просто бизнес, а ответственность за внешний вид и качество готового изделия. В процесс вкладывается максимум сил, чтобы гарантировать высокое качество исполнения и внимание к каждому шву.",
  ],
  photo: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/IQqWhEnndFbtqytb.jpeg",
};

function AboutSection() {
  const { data } = trpc.settings.getAbout.useQuery();
  const about = data ?? DEFAULT_ABOUT;
  return (
    <section id="about" className="bg-[#EEE8D2] overflow-hidden">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
        <div className="py-20 px-8 md:px-16 flex flex-col justify-center">
          <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-6">{about.title}</h2>
          {about.paragraphs.map((p: string, i: number) => (
            <p key={i} className={`text-[#6B5C52] leading-relaxed ${i < about.paragraphs.length - 1 ? "mb-4" : ""}`}>{p}</p>
          ))}
        </div>
        {about.photo && (
          <div className="aspect-[3/4] md:h-auto md:aspect-auto overflow-hidden">
            <img src={about.photo} alt={about.title} className="w-full h-full object-cover object-top" />
          </div>
        )}
      </div>
    </section>
  );
}

function getYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

function BloggersSection() {
  const { data: videos = [] } = trpc.bloggers.getAll.useQuery();
  if ((videos as any[]).length === 0) return null;
  return (
    <section className="py-20 px-4 md:px-6 bg-[#EEE8D2]">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-10 text-center">Нас носят блогеры</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {(videos as any[]).map((v: any) => {
            const ytId = getYoutubeId(v.videoUrl);
            return (
              <div key={v.id} className="bg-[#f8f9d7] rounded-2xl overflow-hidden">
                {ytId ? (
                  <div className="aspect-video">
                    <iframe
                      src={`https://www.youtube.com/embed/${ytId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <a href={v.videoUrl} target="_blank" rel="noopener noreferrer"
                    className="aspect-video flex items-center justify-center bg-[#DDD5C0] text-[#6B5C52] hover:text-[#2B2521] transition-colors block"
                  >
                    <div className="text-center p-6">
                      <div className="w-14 h-14 rounded-full border-2 border-[#A0755A] flex items-center justify-center mx-auto mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#A0755A"><polygon points="5,3 19,12 5,21"/></svg>
                      </div>
                      <p className="text-xs uppercase tracking-widest">Смотреть видео</p>
                    </div>
                  </a>
                )}
                {v.description && (
                  <p className="px-4 py-3 text-sm text-[#6B5C52]">{v.description}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem("tansylate_cart") ?? "[]") as CartItem[]; }
    catch { return []; }
  });
  const [wishlist, setWishlist] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("tansylate_wishlist") ?? "[]") as number[]); }
    catch { return new Set<number>(); }
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [wishlistOpen, setWishlistOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" });
  const [orderConfirm, setOrderConfirm] = useState<{ id: number; telegramUrl: string } | null>(null);

  useEffect(() => {
    localStorage.setItem("tansylate_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    if (location === "/catalog") {
      setTimeout(() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, [location]);

  const createOrder = trpc.orders.create.useMutation({
    onSuccess: (data, variables) => {
      const lines = (variables.items as CartItem[]).map(i => `${i.name}${i.size ? ` (${i.size})` : ""} × ${i.qty}`).join(", ");
      const total = (variables.total as number).toLocaleString("ru-RU");
      const msg = encodeURIComponent(`Заказ #${data.id}\n${lines}\nИтого: ${total} ₽\nИмя: ${variables.name}\nТел: ${variables.phone}${variables.address ? `\nАдрес: ${variables.address}` : ""}`);
      setOrderConfirm({ id: data.id, telegramUrl: `https://t.me/tansylate_bot?text=${msg}` });
    },
  });

  const { data: heroData } = trpc.settings.getHero.useQuery();
  const { data: deliveryData } = trpc.settings.getDelivery.useQuery();
  const { data: contactsData } = trpc.settings.getContacts.useQuery();
  const { data: looksData } = trpc.settings.getLooks.useQuery();

  const heroS = (heroData ?? DEFAULT_HERO) as typeof DEFAULT_HERO;
  const deliveryS = (deliveryData ?? DEFAULT_DELIVERY) as typeof DEFAULT_DELIVERY;
  const contactsS = (contactsData ?? DEFAULT_CONTACTS) as typeof DEFAULT_CONTACTS;
  const looksS = (looksData ?? DEFAULT_LOOKS) as typeof DEFAULT_LOOKS;

  const { data: products = [] } = trpc.catalog.products.useQuery();

  const filteredProducts = searchQuery.trim()
    ? (products as any[]).filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : (products as any[]);

  const selectedProduct = selectedProductId !== null
    ? filteredProducts.find((p: any) => p.id === selectedProductId) ?? null
    : null;
  const selImages = selectedProduct ? parseJSON<string[]>(selectedProduct.images, FALLBACK_IMAGES) : [];
  const selImages_ne = selImages.length > 0 ? selImages : FALLBACK_IMAGES;

  const prevSlide = () => setCarouselIndex(i => (i - 1 + selImages_ne.length) % selImages_ne.length);
  const nextSlide = () => setCarouselIndex(i => (i + 1) % selImages_ne.length);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    setLocation("/");
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 100);
  };

  const addToCart = (p: any, size?: string) => {
    const img = parseJSON<string[]>(p.images, FALLBACK_IMAGES)[0] ?? FALLBACK_IMAGES[0];
    const key = `${p.id}||${size ?? ""}`;
    setCart(c => {
      const existing = c.find(i => `${i.id}||${i.size ?? ""}` === key);
      if (existing) return c.map(i => `${i.id}||${i.size ?? ""}` === key ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: p.id, name: p.name, price: p.price ?? 0, image: img, qty: 1, size }];
    });
  };

  const toggleWishlist = (id: number) => {
    setWishlist(w => {
      const next = new Set(w);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("tansylate_wishlist", JSON.stringify(Array.from(next)));
      return next;
    });
  };

  const openCheckout = () => {
    setCheckoutForm({ name: "", phone: "", address: "" });
    setOrderConfirm(null);
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  const submitOrder = () => {
    if (!checkoutForm.name.trim() || !checkoutForm.phone.trim()) return;
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    createOrder.mutate({
      name: checkoutForm.name.trim(),
      phone: checkoutForm.phone.trim(),
      address: checkoutForm.address.trim() || undefined,
      items: cart,
      total,
    });
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishlistProducts = (products as any[]).filter((p: any) => wishlist.has(p.id));

  const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#6B5C52] mb-6">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          {item.href ? (
            <a href={item.href} onClick={(e) => { e.preventDefault(); setLocation(item.href!); }} className="hover:text-black transition-colors cursor-pointer">
              {item.label}
            </a>
          ) : (
            <span>{item.label}</span>
          )}
          {idx < items.length - 1 && <ChevronRight size={14} />}
        </div>
      ))}
    </div>
  );

  const navClick = (item: { href?: string; id?: string }) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (item.href) { setMobileMenuOpen(false); setLocation(item.href); }
    else if (item.id) scrollToSection(item.id);
  };

  const Header = () => (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center">
      <div className="w-full bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(0,0,0,0.10)]">
        <div className="hidden lg:grid grid-cols-[1fr_auto_1fr] items-center px-8 h-[68px]">
          <div className="flex items-center justify-end gap-8 pr-8">
            {NAV_LEFT.map(item => (
              <a key={item.label} href={`#${item.id}`} onClick={navClick(item)} className={navLink}>{item.label}</a>
            ))}
          </div>
          <a href="/" onClick={e => { e.preventDefault(); setLocation("/"); }} className="hover:opacity-60 transition-opacity cursor-pointer">
            <img src="/tansylate-logo.svg" alt="TANSYLATE" className="h-11" />
          </a>
          <div className="flex items-center justify-between pl-8">
            <div className="flex items-center gap-8">
              {NAV_RIGHT.map(item => (
                <a key={item.label} href={`#${item.id}`} onClick={navClick(item)} className={navLink}>{item.label}</a>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setWishlistOpen(true)} className="w-9 h-9 rounded-full border border-[#DDD5C0] flex items-center justify-center gap-1 hover:border-[#A0755A] transition-colors text-[#6B5C52]" aria-label="Избранное">
                <Heart size={15} strokeWidth={1.5} />
                <span className="text-[11px] font-medium leading-none">{wishlist.size}</span>
              </button>
              <button onClick={() => setCartOpen(true)} className="w-9 h-9 rounded-full border border-[#DDD5C0] flex items-center justify-center gap-1 hover:border-[#A0755A] transition-colors text-[#6B5C52]" aria-label="Корзина">
                <ShoppingBag size={15} strokeWidth={1.5} />
                <span className="text-[11px] font-medium leading-none">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="lg:hidden grid grid-cols-[auto_1fr_auto] items-center px-4 h-[60px]">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full border border-[#DDD5C0] flex items-center justify-center hover:border-[#A0755A] transition-colors text-[#6B5C52]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          <a href="/" onClick={e => { e.preventDefault(); setLocation("/"); }} className="hover:opacity-60 transition-opacity cursor-pointer flex justify-center">
            <img src="/tansylate-logo.svg" alt="TANSYLATE" className="h-7" />
          </a>
          <div className="flex items-center gap-2">
            <button onClick={() => setWishlistOpen(true)} className="w-9 h-9 rounded-full border border-[#DDD5C0] flex items-center justify-center gap-1 hover:border-[#A0755A] transition-colors text-[#6B5C52]" aria-label="Избранное">
              <Heart size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{wishlist.size}</span>
            </button>
            <button onClick={() => setCartOpen(true)} className="w-9 h-9 rounded-full border border-[#DDD5C0] flex items-center justify-center gap-1 hover:border-[#A0755A] transition-colors text-[#6B5C52]" aria-label="Корзина">
              <ShoppingBag size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{cartCount}</span>
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#f0f0f0] py-4 px-6 rounded-b-2xl">
            {ALL_NAV.map((item, i) => (
              <a key={item.label} href={`#${item.id}`}
                className={`block py-3 text-sm text-[#6B5C52] hover:text-[#2B2521] transition-colors${i < ALL_NAV.length - 1 ? " border-b border-[#f0f0f0]" : ""}`}
                onClick={navClick(item)}
              >{item.label}</a>
            ))}
          </div>
        )}
      </div>
    </header>
  );

  const CartDrawer = () => (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
      <div className="relative bg-[#EEE8D2] w-full max-w-sm h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDD5C0]">
          <h2 className="font-serif text-[#2B2521] text-lg">
            Корзина{cartCount > 0 ? ` (${cartCount})` : ""}
          </h2>
          <button onClick={() => setCartOpen(false)} className="text-[#6B5C52] hover:text-[#2B2521] transition-colors">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6B5C52] gap-3">
            <ShoppingBag size={40} className="opacity-30" />
            <p className="text-sm">Корзина пуста</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.map(item => (
                <div key={`${item.id}||${item.size ?? ""}`} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0 bg-[#DDD5C0]"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#2B2521] mb-0.5 line-clamp-2">{item.name}</p>
                    {item.size && <p className="text-xs text-[#A0755A] mb-0.5">Размер: {item.size}</p>}
                    <p className="text-sm text-[#6B5C52] mb-2">{item.price.toLocaleString("ru-RU")} ₽</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCart(c => c.map(i => `${i.id}||${i.size ?? ""}` === `${item.id}||${item.size ?? ""}` ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                        className="w-6 h-6 rounded border border-[#DDD5C0] flex items-center justify-center text-sm text-[#6B5C52] hover:border-[#1A1A1A] transition-colors"
                      >−</button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => setCart(c => c.map(i => `${i.id}||${i.size ?? ""}` === `${item.id}||${item.size ?? ""}` ? { ...i, qty: i.qty + 1 } : i))}
                        className="w-6 h-6 rounded border border-[#DDD5C0] flex items-center justify-center text-sm text-[#6B5C52] hover:border-[#1A1A1A] transition-colors"
                      >+</button>
                      <button
                        onClick={() => setCart(c => c.filter(i => `${i.id}||${i.size ?? ""}` !== `${item.id}||${item.size ?? ""}`))}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                      ><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#DDD5C0] bg-[#EEE8D2]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#6B5C52]">Итого</span>
                <span className="font-semibold text-[#2B2521] whitespace-nowrap">
                  {cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <button
                onClick={openCheckout}
                className="w-full py-3 bg-[#A0755A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#8B6444] transition-colors font-medium"
              >
                Оформить заказ
              </button>
              <button
                onClick={() => setCart([])}
                className="w-full py-2 mt-2 text-xs text-[#6B5C52] hover:text-[#2B2521] transition-colors"
              >
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const WishlistDrawer = () => (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={() => setWishlistOpen(false)} />
      <div className="relative bg-[#EEE8D2] w-full max-w-sm h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#DDD5C0]">
          <h2 className="font-serif text-[#2B2521] text-lg">
            Избранное{wishlist.size > 0 ? ` (${wishlist.size})` : ""}
          </h2>
          <button onClick={() => setWishlistOpen(false)} className="text-[#6B5C52] hover:text-[#2B2521] transition-colors">
            <X size={20} />
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#6B5C52] gap-3">
            <Heart size={40} className="opacity-30" />
            <p className="text-sm">Нет избранных товаров</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {wishlistProducts.map((p: any) => {
              const img = parseJSON<string[]>(p.images, FALLBACK_IMAGES)[0] ?? FALLBACK_IMAGES[0];
              return (
                <div key={p.id} className="flex gap-3">
                  <img
                    src={img}
                    alt={p.name}
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0 bg-[#DDD5C0] cursor-pointer"
                    onClick={() => { setWishlistOpen(false); setSelectedProductId(p.id); setCarouselIndex(0); }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-[#2B2521] mb-0.5 line-clamp-2 cursor-pointer hover:opacity-70"
                      onClick={() => { setWishlistOpen(false); setSelectedProductId(p.id); setCarouselIndex(0); }}
                    >{p.name}</p>
                    <p className="text-sm text-[#6B5C52] mb-2">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { addToCart(p); setWishlistOpen(false); setCartOpen(true); }}
                        className="flex-1 py-1.5 bg-[#A0755A] text-white text-xs uppercase tracking-widest rounded-lg hover:bg-[#8B6444] transition-colors"
                      >
                        В корзину
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#DDD5C0] hover:border-red-400 text-red-400 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );

  const FooterEditorial = () => {
    const lnk = "text-[11px] uppercase tracking-[0.18em] text-[#6B5C52] hover:text-[#2B2521] transition-colors";
    return (
      <footer id="contacts" className="bg-[#EEE8D2] border-t border-[#D5D0C8] pt-16 md:pt-0">
        <div className="hidden md:grid grid-cols-2 py-20">
          <div className="flex flex-col justify-center px-16 gap-7 border-r border-[#D5D0C8]">
            <a href="#catalog" onClick={e => { e.preventDefault(); scrollToSection("catalog"); }} className={lnk}>Каталог</a>
            <a href="#about" onClick={e => { e.preventDefault(); scrollToSection("about"); }} className={lnk}>О бренде</a>
            <a href="#looks" onClick={e => { e.preventDefault(); scrollToSection("looks"); }} className={lnk}>Образы</a>
            <a href="#delivery" onClick={e => { e.preventDefault(); scrollToSection("delivery"); }} className={lnk}>Оплата и доставка</a>
            <a href="/privacy" onClick={e => { e.preventDefault(); setLocation("/privacy"); }} className={lnk}>Политика конфиденциальности</a>
          </div>
          <div className="flex flex-col justify-center px-16 gap-7">
            {contactsS.telegram && <a href={contactsS.telegram} target="_blank" rel="noopener noreferrer" className={lnk}>Telegram</a>}
            {contactsS.instagram && <a href={contactsS.instagram} target="_blank" rel="noopener noreferrer" className={lnk}>Instagram</a>}
            {contactsS.tiktok && <a href={contactsS.tiktok} target="_blank" rel="noopener noreferrer" className={lnk}>TikTok</a>}
          </div>
        </div>

        <div className="md:hidden flex gap-6 px-8 pb-12">
          <div className="flex flex-col gap-5 flex-1">
            <a href="#catalog" onClick={e => { e.preventDefault(); scrollToSection("catalog"); }} className={lnk}>Каталог</a>
            <a href="#about" onClick={e => { e.preventDefault(); scrollToSection("about"); }} className={lnk}>О бренде</a>
            <a href="#looks" onClick={e => { e.preventDefault(); scrollToSection("looks"); }} className={lnk}>Образы</a>
            <a href="#delivery" onClick={e => { e.preventDefault(); scrollToSection("delivery"); }} className={lnk}>Доставка</a>
            <a href="/privacy" onClick={e => { e.preventDefault(); setLocation("/privacy"); }} className={lnk}>Политика</a>
          </div>
          <div className="flex flex-col gap-5 flex-1">
            {contactsS.telegram && <a href={contactsS.telegram} target="_blank" rel="noopener noreferrer" className={lnk}>Telegram</a>}
            {contactsS.instagram && <a href={contactsS.instagram} target="_blank" rel="noopener noreferrer" className={lnk}>Instagram</a>}
            {contactsS.tiktok && <a href={contactsS.tiktok} target="_blank" rel="noopener noreferrer" className={lnk}>TikTok</a>}
          </div>
        </div>

        <div className="border-t border-[#D5D0C8] px-8 md:px-12 py-5 flex justify-center text-[10px] uppercase tracking-widest text-[#9A8B7E]">
          <span>© 2026 Tansylate. Все права защищены.</span>
        </div>
      </footer>
    );
  };

  const ProductCard = ({ p }: { p: any }) => {
    const imgs = parseJSON<string[]>(p.images, FALLBACK_IMAGES);
    const img = imgs[0] ?? FALLBACK_IMAGES[0];
    const care = parseJSON<CareItem[]>(p.careInstructions, []);
    const hasWash = care.some(c => c.icon === "wash");
    return (
      <div className="rounded-2xl overflow-hidden bg-[#EEE8D2] hover:shadow-lg transition-shadow flex flex-col">
        <div
          className="w-full aspect-square bg-[#DDD5C0] overflow-hidden relative cursor-pointer"
          onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
        >
          <img
            src={img}
            alt={p.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            onClick={e => { e.stopPropagation(); toggleWishlist(p.id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
            aria-label="Добавить в избранное"
          >
            <Heart
              size={16}
              className={wishlist.has(p.id) ? "text-red-500" : "text-[#6B5C52]"}
              fill={wishlist.has(p.id) ? "currentColor" : "none"}
            />
          </button>
          {hasWash && (
            <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm" title="Машинная стирка">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B5C52" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8h17l-2 12H5.5L3.5 8z"/>
                <path d="M7.5 17c.5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0 .5-.6 1-.6 1.5 0"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="text-base font-semibold text-[#2B2521] mb-1 cursor-pointer hover:opacity-70 transition-opacity leading-snug"
            onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
          >{p.name}</h3>
          {p.collection && <p className="text-xs text-[#A0755A] uppercase tracking-wide mb-1">{p.collection}</p>}
          <p className="text-sm font-medium text-[#2B2521] mb-3">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
          <button
            onClick={e => { e.stopPropagation(); addToCart(p); setCartOpen(true); }}
            className="mt-auto w-full py-2.5 bg-[#A0755A] text-white text-xs uppercase tracking-widest rounded hover:bg-[#8B6444] transition-colors active:scale-95"
          >
            В корзину
          </button>
        </div>
      </div>
    );
  };

  const CheckoutModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => { if (!createOrder.isPending) setCheckoutOpen(false); }}>
      <div className="bg-[#EEE8D2] rounded-2xl w-full max-w-md p-6 shadow-xl relative" onClick={e => e.stopPropagation()}>
        <button
          onClick={() => setCheckoutOpen(false)}
          disabled={createOrder.isPending}
          className="absolute top-4 right-4 text-[#6B5C52] hover:text-[#2B2521] transition-colors disabled:opacity-40"
        >
          <X size={20} />
        </button>

        {orderConfirm ? (
          <div className="text-center py-4">
            <div className="w-14 h-14 bg-[#A0755A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#A0755A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="font-serif text-[#2B2521] text-xl mb-1">Заказ принят!</h3>
            <p className="text-sm text-[#6B5C52] mb-6">Номер заказа: <span className="font-semibold text-[#2B2521]">#{orderConfirm.id}</span></p>
            <a
              href={orderConfirm.telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => { setCheckoutOpen(false); setCart([]); }}
              className="block w-full py-3 bg-[#A0755A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#8B6444] transition-colors font-medium text-center mb-3"
            >
              Перейти в Telegram
            </a>
            <button
              onClick={() => { setCheckoutOpen(false); setCart([]); }}
              className="text-sm text-[#6B5C52] hover:text-[#2B2521] transition-colors"
            >
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h3 className="font-serif text-[#2B2521] text-xl mb-5">Оформление заказа</h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#6B5C52] mb-1.5">Имя *</label>
                <input
                  type="text"
                  value={checkoutForm.name}
                  onChange={e => setCheckoutForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Ваше имя"
                  className="w-full px-4 py-3 border border-[#DDD5C0] rounded-xl bg-white focus:outline-none focus:border-[#1A1A1A] text-sm text-[#2B2521]"
                  disabled={createOrder.isPending}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#6B5C52] mb-1.5">Телефон *</label>
                <input
                  type="tel"
                  value={checkoutForm.phone}
                  onChange={e => setCheckoutForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full px-4 py-3 border border-[#DDD5C0] rounded-xl bg-white focus:outline-none focus:border-[#1A1A1A] text-sm text-[#2B2521]"
                  disabled={createOrder.isPending}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#6B5C52] mb-1.5">Адрес доставки</label>
                <textarea
                  value={checkoutForm.address}
                  onChange={e => setCheckoutForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Город, улица, дом, квартира"
                  rows={2}
                  className="w-full px-4 py-3 border border-[#DDD5C0] rounded-xl bg-white focus:outline-none focus:border-[#1A1A1A] text-sm text-[#2B2521] resize-none"
                  disabled={createOrder.isPending}
                />
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-[#6B5C52]">Итого</span>
              <span className="font-semibold text-[#2B2521]">
                {cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("ru-RU")} ₽
              </span>
            </div>
            {createOrder.isError && (
              <p className="text-red-500 text-xs mb-3">Ошибка. Попробуйте ещё раз.</p>
            )}
            <button
              onClick={submitOrder}
              disabled={!checkoutForm.name.trim() || !checkoutForm.phone.trim() || createOrder.isPending}
              className="w-full py-3 bg-[#A0755A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#8B6444] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrder.isPending ? "Отправка..." : "Подтвердить заказ"}
            </button>
          </>
        )}
      </div>
    </div>
  );

  const Modals = () => (
    <>
      {cartOpen && <CartDrawer />}
      {wishlistOpen && <WishlistDrawer />}
      {checkoutOpen && <CheckoutModal />}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          images={selImages_ne}
          carouselIndex={carouselIndex}
          onClose={() => setSelectedProductId(null)}
          onPrev={prevSlide}
          onNext={nextSlide}
          onSetIndex={setCarouselIndex}
          wishlist={wishlist}
          onToggleWishlist={toggleWishlist}
          onAddToCart={(size) => { addToCart(selectedProduct, size); setSelectedProductId(null); setCartOpen(true); }}
        />
      )}
    </>
  );

  if (location === "/" || location === "/home" || location === "/catalog") {
    return (
      <div className="min-h-screen bg-[#f8f9d7]">
        <Header />
        <main className="pt-24 lg:pt-28">
          <section className="min-h-[calc(100vh-88px)] flex flex-col items-center justify-center text-center px-4">
            <p className="text-xs uppercase tracking-widest text-[#A0755A] mb-4">{heroS.badge}</p>
            <h1 className="text-5xl md:text-6xl font-serif text-[#2B2521] mb-6">{heroS.title}</h1>
            <p className="text-lg text-[#6B5C52] mb-12 max-w-2xl mx-auto leading-relaxed">
              {heroS.subtitle}
            </p>
            <button
              onClick={() => scrollToSection("catalog")}
              className="px-8 py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors font-medium"
            >
              {heroS.buttonText}
            </button>
          </section>

          <section id="catalog" className="py-20 px-4 md:px-6 bg-[#f8f9d7]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-8 text-center">Каталог товаров</h2>

              <div className="mb-12 relative max-w-xl mx-auto">
                <Search className="absolute left-4 top-3 text-[#6B5C52]" size={20} />
                <input
                  type="text"
                  placeholder="Поиск товаров..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-[#DDD5C0] rounded-xl focus:outline-none focus:border-[#1A1A1A] bg-[#EEE8D2]"
                />
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-[#6B5C52]">
                  <p className="text-lg mb-2">Товары не найдены</p>
                  {searchQuery && <p className="text-sm">Попробуйте изменить запрос</p>}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </section>

          <AboutSection />

          <section id="trust" className="py-20 px-4 md:px-6 bg-[#f8f9d7]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-12 text-center">Почему нам верят</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border-2 border-[#A0755A] rounded-full flex items-center justify-center">
                    <Truck size={28} className="text-[#A0755A]" />
                  </div>
                  <h3 className="font-serif text-[#2B2521] text-lg mb-3">Доставка с примеркой</h3>
                  <p className="text-sm text-[#6B5C52] font-light">
                    Оцените вещь перед покупкой. Пожалуйста, примеряйте аккуратно: без следов макияжа и парфюма.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border-2 border-[#A0755A] rounded-full flex items-center justify-center">
                    <RotateCcw size={28} className="text-[#A0755A]" />
                  </div>
                  <h3 className="font-serif text-[#2B2521] text-lg mb-3">Возврат 14 дней</h3>
                  <p className="text-sm text-[#6B5C52] font-light">
                    Возврат оформляется, если бирки не срезаны и остаются на одежде, а на вещи нет следов носки и посторонних запахов.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 border-2 border-[#A0755A] rounded-full flex items-center justify-center">
                    <Leaf size={28} className="text-[#A0755A]" />
                  </div>
                  <h3 className="font-serif text-[#2B2521] text-lg mb-3">Премиальные материалы</h3>
                  <p className="text-sm text-[#6B5C52] font-light">
                    Только износостойкие ткани высшего качества с заботой о вашем комфорте.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <BloggersSection />

          <section id="looks" className="py-20 px-4 md:px-6 bg-[#EEE8D2]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-4 text-center">{looksS.title}</h2>
              {(looksS.photos ?? []).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mt-8">
                  {(looksS.photos ?? []).map((src, i) => (
                    <div key={i} className="aspect-[3/4] overflow-hidden rounded-xl">
                      <img src={src} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                        onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[#6B5C52] text-center">{looksS.description}</p>
              )}
            </div>
          </section>

          <section id="delivery" className="py-20 px-4 md:px-6 bg-[#f8f9d7]">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-12 text-center">{deliveryS.title}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(deliveryS.cards ?? []).map((dc: any, ci: number) => (
                  <div key={ci} className="bg-[#FFFFFF] rounded-2xl p-8">
                    <h3 className="font-serif text-[#2B2521] text-lg mb-6">{dc.title}</h3>
                    <ul className="space-y-3 text-sm text-[#6B5C52]">
                      {(dc.items ?? []).map((item: string, ii: number) => (
                        <li key={ii} className="flex items-start gap-3">
                          <span className="text-[#A0755A] font-semibold mt-0.5">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

        </main>
        <FooterEditorial />
        <Modals />
      </div>
    );
  }

  if (location === "/privacy") {
    return (
      <div className="min-h-screen bg-[#f8f9d7]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 pt-28 lg:pt-32 pb-12">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Политика конфиденциальности" }]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-8">Политика конфиденциальности</h1>
          <div className="prose prose-sm max-w-none">
            <p className="text-[#6B5C52] leading-relaxed mb-4">
              Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.
            </p>
          </div>
        </main>
        <FooterEditorial />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9d7]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 lg:pt-32 pb-20 text-center">
        <p className="text-[#6B5C52]">Страница не найдена</p>
      </main>
      <FooterEditorial />
    </div>
  );
}
