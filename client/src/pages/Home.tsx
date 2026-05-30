import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Menu, X, Truck, RotateCcw, Leaf, Phone, Search, ChevronRight, ChevronLeft, Heart, ShoppingBag } from "lucide-react";
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

type SizeRow = { size: string; ru: string; col3: string; col3label: string; waist: string };
type SizeTable = { title: string; rows: SizeRow[] };
type Spec = { label: string; value: string };
type CareItem = { icon: string; text: string };
type CartItem = { id: number; name: string; price: number; image: string; qty: number };

function CareIcon({ icon }: { icon: string }) {
  const p = {
    width: 22, height: 22, viewBox: "0 0 24 24", fill: "none",
    stroke: "#5A6262", strokeWidth: 1.5 as number,
    strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    className: "flex-shrink-0",
  };
  if (icon === "wash") return (
    <svg {...p}>
      <path d="M2 8h20v2a10 10 0 0 1-20 0V8z"/>
      <path d="M2 8l2-5h16l2 5"/>
      <path d="M9 13v3m6-3v3"/>
    </svg>
  );
  if (icon === "bleach") return (
    <svg {...p}>
      <path d="M3 6h18v2a9 9 0 0 1-18 0V6z"/>
      <path d="M3 6l1-3h16l1 3"/>
      <line x1="4" y1="4" x2="20" y2="20"/>
    </svg>
  );
  if (icon === "iron") return (
    <svg {...p}>
      <path d="M4 6h16a1 1 0 0 1 1 1v1H3V7a1 1 0 0 1 1-1z"/>
      <path d="M3 8h18v1a9 9 0 0 1-2 5.7V19a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-4.3A9 9 0 0 1 3 9V8z"/>
      <circle cx="12" cy="11" r="1" fill="#5A6262" stroke="none"/>
    </svg>
  );
  if (icon === "dry") return (
    <svg {...p}>
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="3" y1="3" x2="21" y2="21"/>
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

function ProductModal({
  product, images, carouselIndex, onClose, onPrev, onNext, onSetIndex, onAddToCart,
}: {
  product: any; images: string[]; carouselIndex: number;
  onClose: () => void; onPrev: () => void; onNext: () => void; onSetIndex: (i: number) => void;
  onAddToCart: () => void;
}) {
  const specs = parseJSON<Spec[]>(product.specs, []);
  const sizeTables = parseJSON<SizeTable[]>(product.sizeTables, []);
  const features = parseJSON<string[]>(product.features, []);
  const careInstructions = parseJSON<CareItem[]>(product.careInstructions, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-serif text-[#1F1F1D]">{product.name}</h2>
            <button onClick={onClose} className="text-[#5A6262] hover:text-black">
              <X size={24} />
            </button>
          </div>

          <div className="mb-6 relative">
            <div className="relative w-full h-80 overflow-hidden rounded-lg bg-[#E8E7E2]">
              <img
                src={images[carouselIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-opacity duration-300"
              />
              <button onClick={onPrev} className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all shadow">
                <ChevronLeft size={18} className="text-[#1F1F1D]" />
              </button>
              <button onClick={onNext} className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-2 transition-all shadow">
                <ChevronRight size={18} className="text-[#1F1F1D]" />
              </button>
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                  <button key={idx} onClick={() => onSetIndex(idx)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${idx === carouselIndex ? "bg-white w-4" : "bg-white bg-opacity-50"}`}
                  />
                ))}
              </div>
            </div>
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((src, idx) => (
                <button key={idx} onClick={() => onSetIndex(idx)}
                  className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${idx === carouselIndex ? "border-[#5A6262]" : "border-transparent"}`}
                >
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {product.description && (
            <div className="mb-6">
              <h3 className="font-serif text-[#1F1F1D] mb-3">Описание</h3>
              <p className="text-[#5A6262] leading-relaxed text-sm">{product.description}</p>
            </div>
          )}

          {specs.length > 0 && (
            <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6">
              <h3 className="font-serif text-[#1F1F1D] mb-3">Материал</h3>
              <div className="space-y-2 text-sm text-[#5A6262]">
                {specs.map((spec, i) => (
                  <p key={i}><strong>{spec.label}:</strong> {spec.value}</p>
                ))}
              </div>
            </div>
          )}

          {sizeTables.map((table, ti) => (
            <div key={ti} className="bg-[#F9F9D7] rounded-lg p-4 mb-6 overflow-x-auto">
              <h4 className="font-serif text-[#1F1F1D] mb-3 text-sm font-semibold">{table.title}</h4>
              <table className="w-full text-sm text-[#5A6262] border-collapse">
                <thead>
                  <tr className="border-b-2 border-[#1F1F1D]">
                    <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Размер</th>
                    <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">РУ размер</th>
                    <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">{table.rows[0]?.col3label ?? "Обхват груди"}</th>
                    <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват талии</th>
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, ri) => (
                    <tr key={ri} className={ri < table.rows.length - 1 ? "border-b border-[#E8E7E2]" : ""}>
                      <td className="py-2 px-2">{row.size}</td>
                      <td className="py-2 px-2">{row.ru}</td>
                      <td className="py-2 px-2">{row.col3}</td>
                      <td className="py-2 px-2">{row.waist}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {features.length > 0 && (
            <div className="mb-6">
              <h3 className="font-serif text-[#1F1F1D] mb-3">Особенности</h3>
              <ul className="space-y-2 text-sm text-[#5A6262]">
                {features.map((feat, i) => (
                  <li key={i}>✓ {feat}</li>
                ))}
              </ul>
            </div>
          )}

          {(careInstructions.length > 0 || product.careNote) && (
            <div className="bg-[#F9F9D7] rounded-lg p-6 mb-6">
              <h3 className="font-serif text-[#1F1F1D] mb-4 text-sm font-semibold">Уход за изделием</h3>
              {careInstructions.length > 0 && (
                <div className="space-y-4">
                  {careInstructions.map((item, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <CareIcon icon={item.icon} />
                      <p className="text-sm text-[#5A6262]">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
              {product.careNote && (
                <p className="text-xs text-[#5A6262] mt-4 italic">{product.careNote}</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-6 border-t border-[#E8E7E2]">
            <span className="text-3xl font-semibold text-[#1F1F1D] whitespace-nowrap">{(product.price ?? 0).toLocaleString("ru-RU")} ₽</span>
            <div className="flex gap-2 sm:ml-auto">
              <button
                onClick={onAddToCart}
                className="px-6 py-3 border border-[#5A6262] text-[#5A6262] text-sm uppercase tracking-widest rounded-full hover:bg-[#5A6262] hover:text-white transition-colors font-medium"
              >
                В корзину
              </button>
              <a
                href={product.telegramLink ?? "https://t.me/tansylate_bot"}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium inline-block"
              >
                Заказать
              </a>
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(() => {
    try { return new Set(JSON.parse(localStorage.getItem("tansylate_wishlist") ?? "[]") as number[]); }
    catch { return new Set<number>(); }
  });
  const [cartOpen, setCartOpen] = useState(false);

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

  const addToCart = (p: any) => {
    const img = parseJSON<string[]>(p.images, FALLBACK_IMAGES)[0] ?? FALLBACK_IMAGES[0];
    setCart(c => {
      const existing = c.find(i => i.id === p.id);
      if (existing) return c.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i);
      return [...c, { id: p.id, name: p.name, price: p.price ?? 0, image: img, qty: 1 }];
    });
  };

  const toggleWishlist = (id: number) => {
    setWishlist(w => {
      const next = new Set(w);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem("tansylate_wishlist", JSON.stringify([...next]));
      return next;
    });
  };

  const checkoutTelegram = () => {
    const lines = cart.map(i => `${i.name} × ${i.qty} — ${(i.price * i.qty).toLocaleString("ru-RU")} ₽`).join("\n");
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    const msg = encodeURIComponent(`Здравствуйте! Хочу оформить заказ:\n\n${lines}\n\nИтого: ${total.toLocaleString("ru-RU")} ₽`);
    window.open(`https://t.me/tansylate_bot?text=${msg}`, "_blank");
  };

  const cartCount = cart.reduce((s, i) => s + i.qty, 0);

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

  const Header = () => (
    <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
        {/* Left nav */}
        <nav className="hidden md:flex items-center gap-8">
          <a href="/catalog" onClick={(e) => { e.preventDefault(); setLocation("/catalog"); }} className="text-[11px] uppercase tracking-[0.2em] text-[#5A6262] hover:text-black transition-colors">Каталог</a>
          <a href="#about" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }} className="text-[11px] uppercase tracking-[0.2em] text-[#5A6262] hover:text-black transition-colors">О бренде</a>
        </nav>

        {/* Center logo */}
        <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="font-serif text-xl md:text-2xl text-[#1F1F1D] tracking-[0.3em] hover:opacity-70 transition-opacity cursor-pointer whitespace-nowrap justify-self-center">
          TANSYLATE
        </a>

        {/* Right nav + icons */}
        <div className="flex items-center justify-end gap-4 md:gap-6">
          <nav className="hidden md:flex items-center gap-8">
            <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className="text-[11px] uppercase tracking-[0.2em] text-[#5A6262] hover:text-black transition-colors">Оплата и доставка</a>
            <a href="#contacts" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }} className="text-[11px] uppercase tracking-[0.2em] text-[#5A6262] hover:text-black transition-colors">Контакты</a>
          </nav>

          <div className="flex items-center gap-1">
            <button
              onClick={() => {}}
              className="relative p-2 hover:bg-[#E8E7E2] rounded-full transition-colors"
              aria-label="Избранное"
            >
              <Heart size={20} className="text-[#5A6262]" />
              {wishlist.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1F1F1D] text-white text-[9px] rounded-full flex items-center justify-center font-medium leading-none">
                  {wishlist.size}
                </span>
              )}
            </button>

            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 hover:bg-[#E8E7E2] rounded-full transition-colors"
              aria-label="Корзина"
            >
              <ShoppingBag size={20} className="text-[#5A6262]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#1F1F1D] text-white text-[9px] rounded-full flex items-center justify-center font-medium leading-none">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#E8E7E2] rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={20} className="text-[#5A6262]" /> : <Menu size={20} className="text-[#5A6262]" />}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F9D7] border-t border-[#E8E7E2] py-4 px-6">
          <a href="/catalog" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors border-b border-[#E8E7E2]" onClick={() => { closeMobileMenu(); setLocation("/catalog"); }}>Каталог</a>
          <a href="#about" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors border-b border-[#E8E7E2]" onClick={(e) => { e.preventDefault(); scrollToSection("about"); }}>О бренде</a>
          <a href="#delivery" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors border-b border-[#E8E7E2]" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }}>Оплата и доставка</a>
          <a href="#contacts" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }}>Контакты</a>
        </div>
      )}
    </header>
  );

  const CartDrawer = () => (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black bg-opacity-30" onClick={() => setCartOpen(false)} />
      <div className="relative bg-white w-full max-w-sm h-full flex flex-col shadow-xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E8E7E2]">
          <h2 className="font-serif text-[#1F1F1D] text-lg">
            Корзина{cartCount > 0 ? ` (${cartCount})` : ""}
          </h2>
          <button onClick={() => setCartOpen(false)} className="text-[#5A6262] hover:text-black transition-colors">
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
                <div key={item.id} className="flex gap-3">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg flex-shrink-0 bg-[#E8E7E2]"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1F1F1D] mb-0.5 line-clamp-2">{item.name}</p>
                    <p className="text-sm text-[#5A6262] mb-2">{item.price.toLocaleString("ru-RU")} ₽</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))}
                        className="w-6 h-6 rounded border border-[#E8E7E2] flex items-center justify-center text-sm text-[#5A6262] hover:border-[#5A6262] transition-colors"
                      >−</button>
                      <span className="text-sm w-5 text-center">{item.qty}</span>
                      <button
                        onClick={() => setCart(c => c.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                        className="w-6 h-6 rounded border border-[#E8E7E2] flex items-center justify-center text-sm text-[#5A6262] hover:border-[#5A6262] transition-colors"
                      >+</button>
                      <button
                        onClick={() => setCart(c => c.filter(i => i.id !== item.id))}
                        className="ml-auto text-red-400 hover:text-red-600 transition-colors"
                      ><X size={14} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-5 border-t border-[#E8E7E2] bg-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#5A6262]">Итого</span>
                <span className="font-semibold text-[#1F1F1D] whitespace-nowrap">
                  {cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <button
                onClick={checkoutTelegram}
                className="w-full py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium"
              >
                Оформить заказ
              </button>
              <button
                onClick={() => setCart([])}
                className="w-full py-2 mt-2 text-xs text-[#5A6262] hover:text-black transition-colors"
              >
                Очистить корзину
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const Footer = () => (
    <footer className="bg-[#F0EFEA] border-t border-[#E8E7E2] py-12 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h4 className="font-semibold text-[#1F1F1D] mb-4 text-sm uppercase tracking-widest">Помощь</h4>
            <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className="text-sm text-[#5A6262] hover:text-black transition-colors block mb-2">Доставка</a>
            <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className="text-sm text-[#5A6262] hover:text-black transition-colors block mb-2">Возврат</a>
            <a href="/privacy" onClick={(e) => { e.preventDefault(); setLocation("/privacy"); }} className="text-sm text-[#5A6262] hover:text-black transition-colors block">Политика конфиденциальности</a>
          </div>
          <div>
            <h4 className="font-semibold text-[#1F1F1D] mb-4 text-sm uppercase tracking-widest">Контакты</h4>
            <a href="tel:+79953668498" className="text-sm text-[#5A6262] hover:text-black transition-colors block mb-2">+7 995 366 8498</a>
          </div>
          <div>
            <h4 className="font-semibold text-[#1F1F1D] mb-4 text-sm uppercase tracking-widest">Следите за нами</h4>
            <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className="text-sm text-[#5A6262] hover:text-black transition-colors block mb-2">Telegram</a>
            <a href="https://www.instagram.com/p/DYaX6I5iA-x/?img_index=9&igsh=MTFnZDI4b3A1Ymx1" target="_blank" rel="noopener noreferrer" className="text-sm text-[#5A6262] hover:text-black transition-colors block mb-2">Instagram</a>
            <a href="https://www.tiktok.com/@tansylate" target="_blank" rel="noopener noreferrer" className="text-sm text-[#5A6262] hover:text-black transition-colors block">TikTok</a>
          </div>
        </div>
        <div className="border-t border-[#E8E7E2] pt-8 text-center text-sm text-[#5A6262]">
          <p>&copy; 2026 Tansylate. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );

  const ProductCard = ({ p }: { p: any }) => {
    const imgs = parseJSON<string[]>(p.images, FALLBACK_IMAGES);
    const img = imgs[0] ?? FALLBACK_IMAGES[0];
    return (
      <div className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow border border-[#E8E7E2] flex flex-col">
        <div
          className="w-full h-64 bg-[#E8E7E2] overflow-hidden relative cursor-pointer"
          onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
        >
          <img
            src={img}
            alt={p.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
            onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
          />
          <button
            onClick={(e) => { e.stopPropagation(); toggleWishlist(p.id); }}
            className="absolute top-3 right-3 w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center hover:bg-opacity-100 transition-all shadow-sm"
            aria-label="Добавить в избранное"
          >
            <Heart
              size={16}
              className={wishlist.has(p.id) ? "text-red-500" : "text-[#5A6262]"}
              fill={wishlist.has(p.id) ? "currentColor" : "none"}
            />
          </button>
        </div>
        <div className="p-6 flex flex-col flex-1">
          <h3
            className="text-lg font-serif text-[#1F1F1D] mb-2 cursor-pointer hover:opacity-70 transition-opacity"
            onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
          >{p.name}</h3>
          <p className="text-sm text-[#5A6262] mb-1 whitespace-nowrap">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
          {p.collection && <p className="text-xs text-[#5A6262] uppercase tracking-wide mb-3">{p.collection}</p>}
          <button
            onClick={() => addToCart(p)}
            className="mt-auto w-full py-2.5 border border-[#5A6262] text-[#5A6262] text-xs uppercase tracking-widest rounded-full hover:bg-[#5A6262] hover:text-white transition-colors active:scale-95"
          >
            В корзину
          </button>
        </div>
      </div>
    );
  };

  if (location === "/" || location === "/home") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-20">
          <section className="py-20 text-center mb-20">
            <p className="text-xs uppercase tracking-widest text-[#5A6262] mb-4">Основано в 2026</p>
            <h1 className="text-5xl md:text-6xl font-serif text-[#1F1F1D] mb-6">Искусство быть собой</h1>
            <p className="text-lg text-[#5A6262] mb-12 max-w-2xl mx-auto">
              Премиальная одежда из натуральных материалов. Каждая вещь — это произведение искусства, созданное для тех, кто ценит качество и стиль.
            </p>
            <button
              onClick={() => setLocation("/catalog")}
              className="px-8 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium"
            >
              Исследовать
            </button>
          </section>

          <section id="catalog" className="py-20 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Каталог</h2>
              {filteredProducts.length === 0 ? (
                <p className="text-center text-[#5A6262]">Товары не найдены</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} />)}
                </div>
              )}
            </div>
          </section>

          <section id="about" className="py-20 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-6">О себе</h2>
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
              <div className="bg-[#E8E7E2] rounded-2xl h-96 overflow-hidden">
                <img src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/IQqWhEnndFbtqytb.jpeg" alt="Тансылу" className="w-full h-full object-cover" />
              </div>
            </div>
          </section>

          <section id="trust" className="py-20 px-4 md:px-6 bg-[#F9F9D7]">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Почему нам верят</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#5A6262] rounded-full flex items-center justify-center">
                    <Truck size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Доставка с примеркой</h3>
                  <p className="text-sm text-[#5A6262] font-light">
                    Оцените вещь перед покупкой. Пожалуйста, примеряйте аккуратно: без следов макияжа и парфюма.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#5A6262] rounded-full flex items-center justify-center">
                    <RotateCcw size={32} className="text-white" />
                  </div>
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Возврат 14 дней</h3>
                  <p className="text-sm text-[#5A6262] font-light">
                    Возврат оформляется, если бирки не срезаны и остаются на одежде, а на вещи нет следов носки и посторонних запахов. Стоимость упаковки не возвращается.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-6 bg-[#5A6262] rounded-full flex items-center justify-center">
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

          <section id="delivery" className="py-20 px-4 md:px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Доставка и возврат</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-[#F9F9D7] rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Доставка</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Доставка по всей России (СДЭК / Почта России)</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Сроки: 3–7 рабочих дней</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Стоимость уточняется при оформлении</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Примерка перед оплатой — можно оценить вещь, примерять без макияжа и парфюма</span></li>
                  </ul>
                </div>
                <div className="bg-[#F9F9D7] rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Возврат</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Возврат в течение 14 дней</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Бирки не срезаны, нет следов носки и посторонних запахов</span></li>
                    <li className="flex items-start gap-3"><span className="text-[#1F1F1D] font-semibold mt-0.5">•</span><span>Стоимость упаковки не возвращается</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section id="contacts" className="py-20 px-4 md:px-6 bg-[#F0EFEA]">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Свяжитесь с нами</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="p-6">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Контактная информация</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Phone size={20} className="text-[#5A6262]" />
                    <a href="tel:+79953668498" className="text-[#5A6262] hover:text-black transition-colors">+7 995 366 8498</a>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Социальные сети</h3>
                  <p className="text-sm text-[#5A6262] mb-4">Следите за новыми коллекциями и новостями бренда</p>
                  <div className="space-y-2">
                    <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">Telegram</a>
                    <a href="https://www.instagram.com/tansylate" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">Instagram</a>
                    <a href="https://www.tiktok.com/@tansylate" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">TikTok</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />

        {cartOpen && <CartDrawer />}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            images={selImages_ne}
            carouselIndex={carouselIndex}
            onClose={() => setSelectedProductId(null)}
            onPrev={prevSlide}
            onNext={nextSlide}
            onSetIndex={setCarouselIndex}
            onAddToCart={() => { addToCart(selectedProduct); setSelectedProductId(null); setCartOpen(true); }}
          />
        )}
      </div>
    );
  }

  if (location === "/catalog") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Каталог" }]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Каталог товаров</h1>

          <div className="mb-12 relative">
            <Search className="absolute left-4 top-3 text-[#5A6262]" size={20} />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262] bg-white"
            />
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-[#5A6262]">
              <p className="text-lg mb-2">Товары не найдены</p>
              {searchQuery && <p className="text-sm">Попробуйте изменить запрос</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p: any) => <ProductCard key={p.id} p={p} />)}
            </div>
          )}
        </main>
        <Footer />

        {cartOpen && <CartDrawer />}

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            images={selImages_ne}
            carouselIndex={carouselIndex}
            onClose={() => setSelectedProductId(null)}
            onPrev={prevSlide}
            onNext={nextSlide}
            onSetIndex={setCarouselIndex}
            onAddToCart={() => { addToCart(selectedProduct); setSelectedProductId(null); setCartOpen(true); }}
          />
        )}
      </div>
    );
  }

  if (location === "/privacy") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[{ label: "Главная", href: "/" }, { label: "Политика конфиденциальности" }]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Политика конфиденциальности</h1>
          <div className="prose prose-sm max-w-none">
            <p className="text-[#5A6262] leading-relaxed mb-4">
              Мы уважаем вашу конфиденциальность и обязуемся защищать ваши персональные данные.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-20 text-center">
        <p className="text-[#5A6262]">Страница не найдена</p>
      </main>
      <Footer />
    </div>
  );
}
