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

type SizeRow = { size: string; ru: string; col3: string; col3label: string; waist: string; hips?: string; height?: string };
type SizeTable = { title: string; rows: SizeRow[] };
type Spec = { label: string; value: string };
type CareItem = { icon: string; text: string };
type CartItem = { id: number; name: string; price: number; image: string; qty: number; size?: string };

function CareIcon({ icon }: { icon: string }) {
  const p = {
    width: 24, height: 24, viewBox: "0 0 24 24", fill: "none",
    stroke: "#5A6262", strokeWidth: 1.5 as number,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className: "flex-shrink-0",
  };
  // Стирка — таз с волной и температурой
  if (icon === "wash") return (
    <svg {...p}>
      <path d="M3.5 8h17l-2 12H5.5L3.5 8z"/>
      <text x="12" y="15.5" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#5A6262" stroke="none" fontFamily="system-ui, Arial, sans-serif">30</text>
      <path d="M7 18.5c.5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0 .5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0"/>
    </svg>
  );
  // Не отбеливать — треугольник с крестом
  if (icon === "bleach") return (
    <svg {...p}>
      <path d="M12 3L22 21H2L12 3z"/>
      <line x1="8" y1="10" x2="16" y2="20"/>
      <line x1="16" y1="10" x2="8" y2="20"/>
    </svg>
  );
  // Утюг с одной точкой (110°С)
  if (icon === "iron") return (
    <svg {...p}>
      <path d="M3 19h18"/>
      <path d="M3 19V15l3-8h9l6 8v4"/>
      <path d="M9 7V5h6v2"/>
      <circle cx="12" cy="14" r="1.2" fill="#5A6262" stroke="none"/>
    </svg>
  );
  // Не сушить в машине — квадрат, круг, диагональ
  if (icon === "tumble" || icon === "tumble-dry") return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="1.5"/>
      <circle cx="12" cy="12" r="5"/>
      <line x1="5" y1="5" x2="19" y2="19"/>
    </svg>
  );
  // Сушить горизонтально — квадрат с горизонтальной линией
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
    <div className="border-t border-[#DEDBD3]">
      <button
        className="w-full flex items-center justify-between py-[14px] text-left"
        onClick={() => setOpen(o => !o)}
      >
        <span className="text-[15px] font-medium text-[#1F1F1D]">{title}</span>
        {open
          ? <X size={16} className="text-[#1F1F1D] flex-shrink-0" />
          : <Plus size={16} className="text-[#1F1F1D] flex-shrink-0" />
        }
      </button>
      {open && (
        <div className={`pb-5 text-sm leading-relaxed ${accent ? "text-[#8B5A3C]" : "text-[#5A6262]"}`}>
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
        className="bg-[#F5F2EB] rounded-2xl max-w-4xl w-full max-h-[94vh] overflow-hidden flex flex-col md:flex-row"
        onClick={e => e.stopPropagation()}
      >
        {/* Left: image carousel */}
        <div className="relative bg-[#EAE7DF] md:w-[55%] flex-shrink-0 flex flex-col">
          <div className="relative w-full aspect-[3/4]">
            <img
              src={images[carouselIndex]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {images.length > 1 && (
              <>
                <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all">
                  <ChevronLeft size={18} className="text-[#1F1F1D]" />
                </button>
                <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full w-9 h-9 flex items-center justify-center shadow transition-all">
                  <ChevronRight size={18} className="text-[#1F1F1D]" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-[#EAE7DF]">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => onSetIndex(idx)}
                  className={`flex-shrink-0 w-[60px] h-[60px] overflow-hidden transition-all ${
                    idx === carouselIndex
                      ? "outline outline-2 outline-[#1F1F1D]"
                      : "opacity-50 hover:opacity-80"
                  }`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: details */}
        <div className="flex-1 overflow-y-auto flex flex-col">
          {/* Close */}
          <div className="flex justify-end p-4 pb-0">
            <button onClick={onClose} className="text-[#5A6262] hover:text-[#1F1F1D] transition-colors">
              <X size={22} />
            </button>
          </div>

          <div className="px-6 md:px-8 pb-8 flex flex-col flex-1">
            {/* Name + article */}
            <h2 className="text-xl md:text-2xl font-bold text-[#1F1F1D] leading-tight mb-1">
              {product.name}
            </h2>
            {(product.sku || product.id) && (
              <p className="text-xs text-[#9A9A9A] mb-4 uppercase tracking-wider">
                Артикул: {product.sku || String(product.id).padStart(6, "0")}
              </p>
            )}

            {/* Price */}
            <p className="text-2xl font-medium text-[#1F1F1D] mb-2">
              {(product.price ?? 0).toLocaleString("ru-RU")} ₽
            </p>

            {product.description && (
              <p className="text-sm text-[#5A6262] leading-relaxed mb-5">{product.description}</p>
            )}

            {/* Sizes */}
            {availableSizes.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-[#8B5A3C] mb-3 uppercase tracking-wider">Размер</p>
                <div className="flex flex-wrap gap-3">
                  {availableSizes.map(size => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[52px] h-11 px-3 text-sm font-medium rounded transition-all ${
                        selectedSize === size
                          ? "border-2 border-[#1A1A1A] bg-white text-[#1A1A1A]"
                          : "border border-[#C8C4BC] bg-white text-[#5A6262] hover:border-[#1A1A1A] hover:text-[#1A1A1A]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="border-t border-[#DEDBD3] mb-4" />

            {/* Add to cart + wishlist */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => onAddToCart(selectedSize)}
                className="flex-1 h-12 bg-[#1A1A1A] text-white text-sm font-medium hover:bg-[#333] transition-colors rounded"
              >
                Добавить в корзину
              </button>
              <button
                onClick={() => onToggleWishlist(product.id)}
                className="w-12 h-12 border border-[#C8C4BC] bg-white flex items-center justify-center hover:border-[#1A1A1A] transition-colors flex-shrink-0 rounded"
                aria-label="Избранное"
              >
                <Heart
                  size={20}
                  className={wishlist.has(product.id) ? "text-red-500" : "text-[#5A6262]"}
                  fill={wishlist.has(product.id) ? "currentColor" : "none"}
                />
              </button>
            </div>

            {/* Accordions */}
            <div>
              {sizeTables.map((table, ti) => {
                const showHips = table.rows.some(r => r.hips);
                const showHeight = table.rows.some(r => r.height);
                const col3label = table.rows[0]?.col3label ?? "Обхват груди";
                return (
                  <AccordionSection key={ti} title="Размерная сетка">
                    <div className="rounded-lg overflow-hidden border border-[#DEDBD3] mb-1">
                      <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-sm border-collapse min-w-[320px]">
                          <thead>
                            <tr className="bg-[#1A1A1A] text-white">
                              <th className="text-left py-3 px-4 font-medium text-sm whitespace-nowrap">Размер</th>
                              <th className="py-3 px-3 font-medium text-sm text-center">Российский размер</th>
                              <th className="py-3 px-3 font-medium text-sm text-center">{col3label} (см)</th>
                              <th className="py-3 px-3 font-medium text-sm text-center">Обхват талии (см)</th>
                              {showHips && <th className="py-3 px-3 font-medium text-sm text-center">Обхват бёдер (см)</th>}
                              {showHeight && <th className="py-3 px-3 font-medium text-sm text-center">Рост (см)</th>}
                            </tr>
                          </thead>
                          <tbody>
                            {table.rows.map((row, ri) => (
                              <tr key={row.size} className={`${ri < table.rows.length - 1 ? "border-b border-[#DEDBD3]" : ""} bg-white`}>
                                <td className="py-3 px-4 font-semibold text-[#1F1F1D] whitespace-nowrap">{row.size}</td>
                                <td className="py-3 px-3 text-center text-[#5A6262]">{row.ru}</td>
                                <td className="py-3 px-3 text-center text-[#5A6262]">{row.col3}</td>
                                <td className="py-3 px-3 text-center text-[#5A6262]">{row.waist}</td>
                                {showHips && <td className="py-3 px-3 text-center text-[#5A6262]">{row.hips ?? "—"}</td>}
                                {showHeight && <td className="py-3 px-3 text-center text-[#5A6262]">{row.height ?? "—"}</td>}
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
                        <span className="text-[#8B5A3C] flex-shrink-0 select-none">—</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </AccordionSection>
              )}

              <div className="border-t border-[#DEDBD3]" />
            </div>
          </div>
        </div>
      </div>
    </div>
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

  useEffect(() => {
    localStorage.setItem("tansylate_cart", JSON.stringify(cart));
  }, [cart]);

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
  const closeMobileMenu = () => setMobileMenuOpen(false);

  const scrollToSection = (id: string) => {
    closeMobileMenu();
    setLocation("/");
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    }, 100);
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

  const checkoutTelegram = () => {
    const lines = cart.map(i => `${i.name}${i.size ? ` (${i.size})` : ""} × ${i.qty} — ${(i.price * i.qty).toLocaleString("ru-RU")} ₽`).join("\n");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const msg = encodeURIComponent(`Здравствуйте! Хочу оформить заказ:\n\n${lines}\n\nИтого: ${total.toLocaleString("ru-RU")} ₽`);
    window.open(`https://t.me/tansylate_bot?text=${msg}`, "_blank");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  const wishlistProducts = (products as any[]).filter((p: any) => wishlist.has(p.id));

  const Breadcrumbs = ({ items }: { items: { label: string; href?: string }[] }) => (
    <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-[#5A6262] mb-6">
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

  const navLink = "text-sm text-[#3a3a3a] hover:text-[#1A1A1A] transition-colors whitespace-nowrap";

  const Header = () => (
    <header className="fixed top-3 left-0 right-0 z-50 flex justify-center px-3 lg:px-6">
      <div className="w-full max-w-7xl bg-white rounded-2xl shadow-[0_4px_24px_0_rgba(0,0,0,0.10)]">

        {/* Desktop: single flex row, justify-between */}
        <div className="hidden lg:flex items-center justify-between px-8 h-[68px]">
          <a href="#catalog" onClick={(e) => { e.preventDefault(); scrollToSection("catalog"); }} className={navLink}>Каталог</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className={navLink}>О бренде</a>

          <a
            href="/"
            onClick={(e) => { e.preventDefault(); setLocation("/"); }}
            className="text-2xl text-[#1A1A1A] hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            TANSYLATE
          </a>

          <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className={navLink}>Оплата и доставка</a>
          <a href="#contacts" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }} className={navLink}>Контакты</a>

          <div className="flex items-center gap-2">
            <button onClick={() => setWishlistOpen(true)} className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center gap-1 hover:border-[#aaa] transition-colors text-[#3a3a3a]" aria-label="Избранное">
              <Heart size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{wishlist.size}</span>
            </button>
            <button onClick={() => setCartOpen(true)} className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center gap-1 hover:border-[#aaa] transition-colors text-[#3a3a3a]" aria-label="Корзина">
              <ShoppingBag size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile: hamburger + logo + icons */}
        <div className="lg:hidden grid grid-cols-[auto_1fr_auto] items-center px-4 h-[60px]">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center hover:border-[#aaa] transition-colors text-[#3a3a3a]"
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <a
            href="/"
            onClick={(e) => { e.preventDefault(); setLocation("/"); }}
            className="text-lg text-[#1A1A1A] hover:opacity-60 transition-opacity cursor-pointer whitespace-nowrap text-center"
            style={{ fontFamily: "'Montserrat', Arial, sans-serif", fontWeight: 800, letterSpacing: "-0.02em" }}
          >
            TANSYLATE
          </a>

          <div className="flex items-center gap-2">
            <button onClick={() => setWishlistOpen(true)} className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center gap-1 hover:border-[#aaa] transition-colors text-[#3a3a3a]" aria-label="Избранное">
              <Heart size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{wishlist.size}</span>
            </button>
            <button onClick={() => setCartOpen(true)} className="w-9 h-9 rounded-full border border-[#e0e0e0] flex items-center justify-center gap-1 hover:border-[#aaa] transition-colors text-[#3a3a3a]" aria-label="Корзина">
              <ShoppingBag size={15} strokeWidth={1.5} />
              <span className="text-[11px] font-medium leading-none">{cartCount}</span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-[#f0f0f0] py-4 px-6 rounded-b-2xl">
            <a href="#catalog" className="block py-3 text-sm text-[#3a3a3a] hover:text-[#1A1A1A] transition-colors border-b border-[#f0f0f0]" onClick={(e) => { e.preventDefault(); scrollToSection("catalog"); }}>Каталог</a>
            <a href="#about" className="block py-3 text-sm text-[#3a3a3a] hover:text-[#1A1A1A] transition-colors border-b border-[#f0f0f0]" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>О бренде</a>
            <a href="#delivery" className="block py-3 text-sm text-[#3a3a3a] hover:text-[#1A1A1A] transition-colors border-b border-[#f0f0f0]" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }}>Оплата и доставка</a>
            <a href="#contacts" className="block py-3 text-sm text-[#3a3a3a] hover:text-[#1A1A1A] transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }}>Контакты</a>
          </div>
        )}
      </div>
    </header>
  );

  const CartDrawer = () => (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/30" onClick={() => setCartOpen(false)} />
      <div className="relative bg-[#F5F2EB] w-full max-w-sm h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DDD6]">
          <h2 className="font-serif text-[#1F1F1D] text-lg">
            Корзина{cartCount > 0 ? ` (${cartCount})` : ""}
          </h2>
          <button onClick={() => setCartOpen(false)} className="text-[#5A6262] hover:text-[#1A1A1A] transition-colors">
            <X size={20} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#5A6262] gap-3">
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
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0 bg-[#E0DDD6]"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F1F1D] mb-0.5 line-clamp-2">{item.name}</p>
                    {item.size && <p className="text-xs text-[#8B5A3C] mb-0.5">Размер: {item.size}</p>}
                    <p className="text-sm text-[#5A6262] mb-2">{item.price.toLocaleString("ru-RU")} ₽</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCart(c => c.map(i => `${i.id}||${i.size ?? ""}` === `${item.id}||${item.size ?? ""}` ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                        className="w-6 h-6 rounded border border-[#C8C4BC] flex items-center justify-center text-sm text-[#5A6262] hover:border-[#1A1A1A] transition-colors"
                      >−</button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => setCart(c => c.map(i => `${i.id}||${i.size ?? ""}` === `${item.id}||${item.size ?? ""}` ? { ...i, qty: i.qty + 1 } : i))}
                        className="w-6 h-6 rounded border border-[#C8C4BC] flex items-center justify-center text-sm text-[#5A6262] hover:border-[#1A1A1A] transition-colors"
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

            <div className="p-5 border-t border-[#E0DDD6] bg-[#F5F2EB]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#5A6262]">Итого</span>
                <span className="font-semibold text-[#1F1F1D] whitespace-nowrap">
                  {cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <button
                onClick={checkoutTelegram}
                className="w-full py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors font-medium"
              >
                Оформить заказ
              </button>
              <button
                onClick={() => setCart([])}
                className="w-full py-2 mt-2 text-xs text-[#5A6262] hover:text-[#1A1A1A] transition-colors"
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
      <div className="relative bg-[#F5F2EB] w-full max-w-sm h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E0DDD6]">
          <h2 className="font-serif text-[#1F1F1D] text-lg">
            Избранное{wishlist.size > 0 ? ` (${wishlist.size})` : ""}
          </h2>
          <button onClick={() => setWishlistOpen(false)} className="text-[#5A6262] hover:text-[#1A1A1A] transition-colors">
            <X size={20} />
          </button>
        </div>

        {wishlistProducts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-[#5A6262] gap-3">
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
                    className="w-16 h-20 object-cover rounded-lg flex-shrink-0 bg-[#E0DDD6] cursor-pointer"
                    onClick={() => { setWishlistOpen(false); setSelectedProductId(p.id); setCarouselIndex(0); }}
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-medium text-[#1F1F1D] mb-0.5 line-clamp-2 cursor-pointer hover:opacity-70"
                      onClick={() => { setWishlistOpen(false); setSelectedProductId(p.id); setCarouselIndex(0); }}
                    >{p.name}</p>
                    <p className="text-sm text-[#5A6262] mb-2">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { addToCart(p); setWishlistOpen(false); setCartOpen(true); }}
                        className="flex-1 py-1.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest rounded-lg hover:bg-[#333] transition-colors"
                      >
                        В корзину
                      </button>
                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[#C8C4BC] hover:border-red-400 text-red-400 transition-colors"
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
    const lnk = "text-[11px] uppercase tracking-[0.18em] text-[#6B6558] hover:text-[#2B2521] transition-colors";
    return (
      <footer id="contacts" className="bg-[#F2EAE1]">
        {/* Logo wordmark */}
        <div className="flex justify-center pt-16 pb-10 px-8">
          <img src="/tansylate-logo.svg" alt="TANSYLATE" className="h-10 md:h-14" />
        </div>

        {/* Desktop: two-column layout */}
        <div className="hidden md:grid grid-cols-2 pb-16">
          {/* Left — navigation */}
          <div className="flex flex-col justify-center px-16 gap-7 border-r border-[#D5D0C8]">
            <a href="#catalog" onClick={(e) => { e.preventDefault(); scrollToSection("catalog"); }} className={lnk}>Каталог</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className={lnk}>О бренде</a>
            <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className={lnk}>Оплата и доставка</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); setLocation("/privacy"); }} className={lnk}>Политика конфиденциальности</a>
          </div>

          {/* Right — contacts */}
          <div className="flex flex-col justify-center px-16 gap-7">
            <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className={lnk}>Telegram</a>
            <a href="https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1" target="_blank" rel="noopener noreferrer" className={lnk}>Instagram</a>
            <a href="https://www.tiktok.com/@tansylate" target="_blank" rel="noopener noreferrer" className={lnk}>TikTok</a>
            <a href="tel:+79953668498" className={lnk}>+7 995 366 8498</a>
          </div>
        </div>

        {/* Mobile: two independent columns */}
        <div className="md:hidden flex gap-6 px-8 pb-12">
          <div className="flex flex-col gap-5 flex-1">
            <a href="#catalog" onClick={(e) => { e.preventDefault(); scrollToSection("catalog"); }} className={lnk}>Каталог</a>
            <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className={lnk}>О бренде</a>
            <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className={lnk}>Доставка</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); setLocation("/privacy"); }} className={lnk}>Политика</a>
          </div>
          <div className="flex flex-col gap-5 flex-1">
            <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className={lnk}>Telegram</a>
            <a href="https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1" target="_blank" rel="noopener noreferrer" className={lnk}>Instagram</a>
            <a href="https://www.tiktok.com/@tansylate" target="_blank" rel="noopener noreferrer" className={lnk}>TikTok</a>
            <a href="tel:+79953668498" className={lnk}>+7 995 366 8498</a>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-[#D5D0C8] px-8 md:px-12 py-5 flex justify-center text-[10px] uppercase tracking-widest text-[#9A9590]">
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
      <div className="rounded-2xl overflow-hidden bg-[#F5F2EB] hover:shadow-lg transition-shadow flex flex-col">
        <div
          className="w-full aspect-square bg-[#EAE7DF] overflow-hidden relative cursor-pointer"
          onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
        >
          <img
            src={img}
            alt={p.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
            aria-label="Добавить в избранное"
          >
            <Heart
              size={16}
              className={wishlist.has(p.id) ? "text-red-500" : "text-[#5A6262]"}
              fill={wishlist.has(p.id) ? "currentColor" : "none"}
            />
          </button>
          {hasWash && (
            <div className="absolute bottom-3 left-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow-sm" title="Машинная стирка">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5A6262" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3.5 8h17l-2 12H5.5L3.5 8z"/>
                <path d="M7.5 17c.5-.6 1-.6 1.5 0 .5.6 1 .6 1.5 0 .5-.6 1-.6 1.5 0"/>
              </svg>
            </div>
          )}
        </div>
        <div className="p-4 flex flex-col flex-1">
          <h3
            className="text-base font-semibold text-[#1F1F1D] mb-1 cursor-pointer hover:opacity-70 transition-opacity leading-snug"
            onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
          >{p.name}</h3>
          {p.collection && <p className="text-xs text-[#8B5A3C] uppercase tracking-wide mb-1">{p.collection}</p>}
          <p className="text-sm font-medium text-[#1F1F1D] mb-3">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
          <button
            onClick={(e) => { e.stopPropagation(); addToCart(p); setCartOpen(true); }}
            className="mt-auto w-full py-2.5 bg-[#1A1A1A] text-white text-xs uppercase tracking-widest rounded hover:bg-[#333] transition-colors active:scale-95"
          >
            В корзину
          </button>
        </div>
      </div>
    );
  };

  const Modals = () => (
    <>
      {cartOpen && <CartDrawer />}
      {wishlistOpen && <WishlistDrawer />}
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

  if (location === "/" || location === "/home") {
    return (
      <div className="min-h-screen bg-[#FFFDF0]">
        <Header />
        <main className="pt-24 lg:pt-28">
          <section className="py-16 text-center px-4">
            <p className="text-xs uppercase tracking-widest text-[#8B5A3C] mb-4">Основано в 2026</p>
            <h1 className="text-5xl md:text-6xl font-serif text-[#2B2521] mb-6">История в двух цветах</h1>
            <p className="text-lg text-[#5A6262] mb-12 max-w-2xl mx-auto leading-relaxed">
              Одежда, в которой ты разный
            </p>
            <button
              onClick={() => scrollToSection("catalog")}
              className="px-8 py-3 bg-[#1A1A1A] text-white text-sm uppercase tracking-widest rounded-xl hover:bg-[#333] transition-colors font-medium"
            >
              Каталог
            </button>
          </section>

          <section id="catalog" className="py-16 px-4 md:px-6">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-10 text-center">Каталог</h2>
              {filteredProducts.length === 0 ? (
                <p className="text-center text-[#5A6262]">Товары не найдены</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </section>

          <section id="about" className="bg-[#F2EAE1] overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2">
              {/* Text */}
              <div className="py-20 px-8 md:px-16 flex flex-col justify-center">
                <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-6">О бренде</h2>
                <p className="text-[#5A6262] mb-4 leading-relaxed">
                  Меня зовут Тансылу, мне 16 лет. Моя цель — создавать по-настоящему долговечную одежду.
                </p>
                <p className="text-[#5A6262] mb-4 leading-relaxed">
                  Все ключевые этапы контролирую лично: от разработки удобных эскизов и работы с дизайнерами до проверки швейного цеха и финальной упаковки.
                </p>
                <p className="text-[#5A6262] leading-relaxed">
                  Это не просто бизнес, а ответственность за внешний вид и качество готового изделия. В процесс вкладывается максимум сил, чтобы гарантировать высокое качество исполнения и внимание к каждому шву.
                </p>
              </div>
              {/* Photo — fills full column height, no rounded corners */}
              <div className="h-72 md:h-auto overflow-hidden">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/IQqWhEnndFbtqytb.jpeg" alt="Тансылу" className="w-full h-full object-cover object-center" />
              </div>
            </div>
          </section>

          <section id="trust" className="py-20 px-4 md:px-6 bg-[#FFFDF0]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Почему нам верят</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                    <Truck size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Доставка с примеркой</h3>
                  <p className="text-sm text-[#5A6262] font-light">
                    Оцените вещь перед покупкой. Пожалуйста, примеряйте аккуратно: без следов макияжа и парфюма.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                    <RotateCcw size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Возврат 14 дней</h3>
                  <p className="text-sm text-[#5A6262] font-light">
                    Возврат оформляется, если бирки не срезаны и остаются на одежде, а на вещи нет следов носки и посторонних запахов.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#1A1A1A] rounded-full flex items-center justify-center">
                    <Leaf size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Премиальные материалы</h3>
                  <p className="text-sm text-[#5A6262] font-light">
                    Только износостойкие ткани высшего качества с заботой о вашем комфорте.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section id="delivery" className="py-20 px-4 md:px-6 bg-[#F2EAE1]">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-12 text-center">Доставка и возврат</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-[#FFFFFF] rounded-2xl p-8">
                  <h3 className="font-serif text-[#2B2521] text-lg mb-6">Доставка</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Доставка по всей России (СДЭК / Почта России)</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Сроки: 3–7 рабочих дней</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Стоимость уточняется при оформлении</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Примерка перед оплатой</span></li>
                  </ul>
                </div>
                <div className="bg-[#FFFFFF] rounded-2xl p-8">
                  <h3 className="font-serif text-[#2B2521] text-lg mb-6">Возврат</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Возврат в течение 14 дней</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Бирки не срезаны, нет следов носки</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#8B5A3C] font-semibold mt-0.5">•</span><span>Стоимость упаковки не возвращается</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

        </main>
        <FooterEditorial />
        <Modals />
      </div>
    );
  }

  if (location === "/catalog") {
    return (
      <div className="min-h-screen bg-[#FFFDF0]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 lg:pt-32 pb-12">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#2B2521] mb-8">Каталог товаров</h1>

          <div className="mb-12 relative">
            <Search className="absolute left-4 top-3 text-[#5A6262]" size={20} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#E0DDD6] rounded-xl focus:outline-none focus:border-[#1A1A1A] bg-[#F5F2EB]"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-[#5A6262]">
              <p className="text-lg mb-2">Товары не найдены</p>
              {searchQuery && <p className="text-sm">Попробуйте изменить запрос</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </main>
        <FooterEditorial />
        <Modals />
      </div>
    );
  }

  if (location === "/privacy") {
    return (
      <div className="min-h-screen bg-[#F9F9D7]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 pt-28 lg:pt-32 pb-12">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Политика конфиденциальности" }]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Политика конфиденциальности</h1>
          <div className="prose prose-sm max-w-none">
            <p className="text-[#5A6262] leading-relaxed mb-4">
              Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.
            </p>
          </div>
        </main>
        <FooterEditorial />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9D7]">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 pt-28 lg:pt-32 pb-20 text-center">
        <p className="text-[#5A6262]">Страница не найдена</p>
      </main>
      <FooterEditorial />
    </div>
  );
}
