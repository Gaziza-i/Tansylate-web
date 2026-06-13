import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Menu, X, Truck, RotateCcw, Leaf, Phone, Search, ChevronRight, ChevronLeft } from "lucide-react";
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

const LOGO_URL = "https://files.manuscdn.com/user_upload_by_module/session_file/310519663598344304/aOLIVKokFqpLkQid.png";

type SizeRow = { size: string; ru: string; col3: string; col3label: string; waist: string };
type SizeTable = { title: string; rows: SizeRow[] };
type Spec = { label: string; value: string };
type CareItem = { icon: string; text: string };

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
  product, images, carouselIndex, onClose, onPrev, onNext, onSetIndex,
}: {
  product: any; images: string[]; carouselIndex: number;
  onClose: () => void; onPrev: () => void; onNext: () => void; onSetIndex: (i: number) => void;
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

          <div className="flex items-center justify-between pt-6 border-t border-[#E8E7E2]">
            <span className="text-3xl font-semibold text-[#1F1F1D] whitespace-nowrap">{(product.price ?? 0).toLocaleString("ru-RU")} ₽</span>
            <a
              href={product.telegramLink ?? "https://t.me/tansylate_bot"}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium inline-block"
            >
              Заказать в Telegram
            </a>
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

  const { data: products = [] } = trpc.catalog.products.useQuery();

  // Filter products based on search
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

  // Breadcrumbs Component
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

  // Header Component
  const Header = () => (
    <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
        <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
          <img src={LOGO_URL} alt="Tansylate" className="h-12 w-auto" />
        </a>

        <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#5A6262]">
          <a href="/catalog" onClick={(e) => { e.preventDefault(); setLocation("/catalog"); }} className="hover:text-black transition-colors">Каталог</a>
          <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className="hover:text-black transition-colors">Доставка</a>
          <a href="#delivery" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }} className="hover:text-black transition-colors">Возврат</a>
          <a href="#contacts" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }} className="hover:text-black transition-colors">Контакты</a>
        </nav>

        <div className="flex items-center space-x-4">
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-[#E8E7E2] rounded-full transition-colors">
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-[#E8E7E2] py-4 px-6">
          <a href="/catalog" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/catalog"); }}>Каталог</a>
          <a href="#delivery" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }}>Доставка</a>
          <a href="#delivery" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection("delivery"); }}>Возврат</a>
          <a href="#contacts" className="block py-3 text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={(e) => { e.preventDefault(); scrollToSection("contacts"); }}>Контакты</a>
        </div>
      )}
    </header>
  );

  // Footer Component
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

  // Home Page
  if (location === "/" || location === "/home") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-20">
          {/* Hero Section */}
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

          {/* Catalog Section */}
          <section id="catalog" className="py-20 px-4 md:px-6 bg-white">
            <div className="max-w-7xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Каталог</h2>
              {filteredProducts.length === 0 ? (
                <p className="text-center text-[#5A6262]">Товары не найдены</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((p: any) => {
                    const imgs = parseJSON<string[]>(p.images, FALLBACK_IMAGES);
                    const img = imgs[0] ?? FALLBACK_IMAGES[0];
                    return (
                      <div
                        key={p.id}
                        onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
                        className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer border border-[#E8E7E2]"
                      >
                        <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                          <img src={img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">{p.name}</h3>
                          <p className="text-sm text-[#5A6262] mb-2">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
                          {p.collection && <p className="text-xs text-[#5A6262] uppercase tracking-wide">{p.collection}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* About Section */}
          <section className="py-20 px-4 md:px-6 bg-white">
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

          {/* Why Trust Us */}
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

          {/* Delivery & Returns */}
          <section id="delivery" className="py-20 px-4 md:px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Доставка и возврат</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="bg-[#F9F9D7] rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Доставка</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Доставка по всей России (СДЭК / Почта России)</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Сроки: 3–7 рабочих дней</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Стоимость уточняется при оформлении</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Примерка перед оплатой — можно оценить вещь, примерять без макияжа и парфюма</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#F9F9D7] rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Возврат</h3>
                  <ul className="space-y-3 text-sm text-[#5A6262]">
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Возврат в течение 14 дней</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Бирки не срезаны, нет следов носки и посторонних запахов</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <span className="text-[#1F1F1D] font-semibold mt-0.5">•</span>
                      <span>Стоимость упаковки не возвращается</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Contacts */}
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

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            images={selImages_ne}
            carouselIndex={carouselIndex}
            onClose={() => setSelectedProductId(null)}
            onPrev={prevSlide}
            onNext={nextSlide}
            onSetIndex={setCarouselIndex}
          />
        )}
      </div>
    );
  }

  // Catalog Page
  if (location === "/catalog") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Каталог" }
          ]} />

          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Каталог товаров</h1>

          {/* Search */}
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

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 text-[#5A6262]">
              <p className="text-lg mb-2">Товары не найдены</p>
              {searchQuery && <p className="text-sm">Попробуйте изменить запрос</p>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((p: any) => {
                const imgs = parseJSON<string[]>(p.images, FALLBACK_IMAGES);
                const img = imgs[0] ?? FALLBACK_IMAGES[0];
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelectedProductId(p.id); setCarouselIndex(0); }}
                    className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer border border-[#E8E7E2]"
                  >
                    <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                      <img src={img} alt={p.name} className="w-full h-full object-cover hover:scale-105 transition-transform" onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">{p.name}</h3>
                      <p className="text-sm text-[#5A6262] mb-2">{(p.price ?? 0).toLocaleString("ru-RU")} ₽</p>
                      {p.collection && <p className="text-xs text-[#5A6262] uppercase tracking-wide">{p.collection}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
        <Footer />

        {selectedProduct && (
          <ProductModal
            product={selectedProduct}
            images={selImages_ne}
            carouselIndex={carouselIndex}
            onClose={() => setSelectedProductId(null)}
            onPrev={prevSlide}
            onNext={nextSlide}
            onSetIndex={setCarouselIndex}
          />
        )}
      </div>
    );
  }

  // Privacy Page
  if (location === "/privacy") {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Политика конфиденциальности" }
          ]} />
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

  return null;
}
