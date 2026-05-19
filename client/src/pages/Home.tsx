import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Truck, RotateCcw, Leaf, Mail, Phone, Search, ChevronRight, ChevronLeft } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";

const LOGO_URL = "/manus-storage/tansylate-logo-cropped_660047f4.png";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  
  const { cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal } = useCart();
  
  const { data: products = [] } = trpc.catalog.products.useQuery();
  const submitContact = trpc.contacts.submit.useMutation();

  // Filter products based on search - compute directly without setState
  const filteredProducts = searchQuery.trim()
    ? products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : products;

  const handleCheckout = async () => {
    if (!checkoutForm.name || !checkoutForm.phone || !checkoutForm.address) {
      alert("Пожалуйста, заполните все поля");
      return;
    }

    const orderSummary = cartItems.map(item => `${item.name} x${item.quantity}`).join(", ");
    await submitContact.mutateAsync({
      name: checkoutForm.name,
      email: checkoutForm.phone,
      message: `Заказ: ${orderSummary}. Адрес доставки: ${checkoutForm.address}. Сумма: ${(cartTotal / 100).toFixed(2)} ₽`
    });

    alert("Спасибо! Ваш заказ принят. Мы свяжемся с вами в ближайшее время.");
    clearCart();
    setCheckoutForm({ name: "", phone: "", address: "" });
    setLocation("/");
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0);
  };

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
          <button onClick={() => setLocation("/cart")} className="relative p-2 hover:bg-[#E8E7E2] rounded-full transition-colors">
            <ShoppingCart size={20} className="text-[#5A6262]" />
            {cartItems.length > 0 && (
              <span className="absolute top-0 right-0 bg-[#5A6262] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{cartItems.length}</span>
            )}
          </button>
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
              <div className="max-w-2xl mx-auto">
                <div 
                  onClick={() => setSelectedProductId(1)}
                  className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer border border-[#E8E7E2]"
                >
                  <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                    <img src="/manus-storage/IMG_0063_e75f1e11.jpeg" alt="Спортивный костюм" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">Спортивный костюм</h3>
                    <p className="text-sm text-[#5A6262] mb-4">12 990 ₽</p>
                    <p className="text-xs text-[#5A6262] mb-4">Нажмите для полной информации</p>
                  </div>
                </div>
              </div>
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
                <img src="/manus-storage/IMG_0064_0e7e8e2e.jpeg" alt="Тансылу" className="w-full h-full object-cover" />
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
                <div className="bg-white rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Контактная информация</h3>
                  <div className="flex items-center gap-3 mb-4">
                    <Phone size={20} className="text-[#5A6262]" />
                    <a href="tel:+79953668498" className="text-[#5A6262] hover:text-black transition-colors">+7 995 366 8498</a>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-8">
                  <h3 className="font-serif text-[#1F1F1D] text-lg mb-6">Социальные сети</h3>
                  <p className="text-sm text-[#5A6262] mb-4">Следите за новыми коллекциями и новостями бренда</p>
                  <div className="space-y-2">
                    <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">Telegram</a>
                    <a href="https://wa.me/79953668498" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">WhatsApp</a>
                    <a href="https://www.tiktok.com/@tansylate" target="_blank" rel="noopener noreferrer" className="block text-[#5A6262] hover:text-black transition-colors text-sm">TikTok</a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />

        {/* Modal with Full Product Details */}
        {selectedProductId === 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProductId(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-serif text-[#1F1F1D]">Спортивный костюм</h2>
                  <button onClick={() => setSelectedProductId(null)} className="text-[#5A6262] hover:text-black">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <img src="/manus-storage/IMG_0063_e75f1e11.jpeg" alt="Спортивный костюм" className="w-full h-64 object-cover rounded-lg mb-6" />
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Описание</h3>
                  <p className="text-[#5A6262] leading-relaxed text-sm">
                    Премиальный спортивный костюм, созданный для тех, кто ценит качество и комфорт. Каждая деталь тщательно продумана, каждый шов выполнен на профессиональном оборудовании. Натуральные материалы обеспечивают идеальную терморегуляцию и комфорт при любых условиях.
                  </p>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Материал</h3>
                  <div className="space-y-2 text-sm text-[#5A6262]">
                    <p><strong>Состав:</strong> 80% хлопок, 20% полиэстер</p>
                    <p><strong>Тип ткани:</strong> Трёхнитка футер</p>
                    <p><strong>Плотность:</strong> 360 г/м²</p>
                  </div>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6 overflow-x-auto">
                  <h4 className="font-serif text-[#1F1F1D] mb-3 text-sm font-semibold">Размерная сетка: Кофта</h4>
                  <table className="w-full text-sm text-[#5A6262] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#1F1F1D]">
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">РУ размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват груди</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват талии</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E8E7E2]">
                        <td className="py-2 px-2">XS-S</td>
                        <td className="py-2 px-2">42</td>
                        <td className="py-2 px-2">84 см</td>
                        <td className="py-2 px-2">66 см</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">S-M</td>
                        <td className="py-2 px-2">44</td>
                        <td className="py-2 px-2">88 см</td>
                        <td className="py-2 px-2">70 см</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6 overflow-x-auto">
                  <h4 className="font-serif text-[#1F1F1D] mb-3 text-sm font-semibold">Размерная сетка: Штаны</h4>
                  <table className="w-full text-sm text-[#5A6262] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#1F1F1D]">
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">РУ размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват груди</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват талии</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E8E7E2]">
                        <td className="py-2 px-2">XS-S</td>
                        <td className="py-2 px-2">42</td>
                        <td className="py-2 px-2">66 см</td>
                        <td className="py-2 px-2">90 см</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">S-M</td>
                        <td className="py-2 px-2">44</td>
                        <td className="py-2 px-2">70 см</td>
                        <td className="py-2 px-2">94 см</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Особенности</h3>
                  <ul className="space-y-2 text-sm text-[#5A6262]">
                    <li>✓ Швы на профессиональном оборудовании</li>
                    <li>✓ Премиальная фурнитура</li>
                    <li>✓ Идеальная посадка по фигуре</li>
                    <li>✓ Натуральные материалы высочайшего качества</li>
                  </ul>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-6 mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-4 text-sm font-semibold">Уход за изделием</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">❄️</span>
                      <p className="text-sm text-[#5A6262]">Стирка 30°C, выверну наизнанку</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🚫</span>
                      <p className="text-sm text-[#5A6262]">Отбеливание: запрещено</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🌡️</span>
                      <p className="text-sm text-[#5A6262]">Утюжка: до 110°C</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🧺</span>
                      <p className="text-sm text-[#5A6262]">Машинная сушка: запрещена</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">☐</span>
                      <p className="text-sm text-[#5A6262]">Сушка: только горизонтально в тени</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#E8E7E2]">
                  <span className="text-3xl font-semibold text-[#1F1F1D]">12 990 ₽</span>
                  <a
                    href="https://t.me/tansylate_bot"
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

          {/* Minimalist Product Card */}
          <div className="max-w-2xl mx-auto">
            <div 
              onClick={() => setSelectedProductId(1)}
              className="rounded-2xl overflow-hidden bg-white hover:shadow-lg transition-shadow cursor-pointer border border-[#E8E7E2]"
            >
              <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                <img src="/manus-storage/IMG_0063_e75f1e11.jpeg" alt="Спортивный костюм" className="w-full h-full object-cover hover:scale-105 transition-transform" />
              </div>
              <div className="p-6">
                <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">Спортивный костюм</h3>
                <p className="text-sm text-[#5A6262] mb-4">12 990 ₽</p>
                <p className="text-xs text-[#5A6262] mb-4">Нажмите для полной информации</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />

        {/* Modal with Full Product Details */}
        {selectedProductId === 1 && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedProductId(null)}>
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-serif text-[#1F1F1D]">Спортивный костюм</h2>
                  <button onClick={() => setSelectedProductId(null)} className="text-[#5A6262] hover:text-black">
                    <X size={24} />
                  </button>
                </div>

                <div className="mb-6">
                  <img src="/manus-storage/IMG_0063_e75f1e11.jpeg" alt="Спортивный костюм" className="w-full h-64 object-cover rounded-lg mb-6" />
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Описание</h3>
                  <p className="text-[#5A6262] leading-relaxed text-sm">
                    Премиальный спортивный костюм, созданный для тех, кто ценит качество и комфорт. Каждая деталь тщательно продумана, каждый шов выполнен на профессиональном оборудовании. Натуральные материалы обеспечивают идеальную терморегуляцию и комфорт при любых условиях.
                  </p>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Материал</h3>
                  <div className="space-y-2 text-sm text-[#5A6262]">
                    <p><strong>Состав:</strong> 80% хлопок, 20% полиэстер</p>
                    <p><strong>Тип ткани:</strong> Трёхнитка футер</p>
                    <p><strong>Плотность:</strong> 360 г/м²</p>
                  </div>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6 overflow-x-auto">
                  <h4 className="font-serif text-[#1F1F1D] mb-3 text-sm font-semibold">Размерная сетка: Кофта</h4>
                  <table className="w-full text-sm text-[#5A6262] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#1F1F1D]">
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">РУ размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват груди</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват талии</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E8E7E2]">
                        <td className="py-2 px-2">XS-S</td>
                        <td className="py-2 px-2">42</td>
                        <td className="py-2 px-2">84 см</td>
                        <td className="py-2 px-2">66 см</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">S-M</td>
                        <td className="py-2 px-2">44</td>
                        <td className="py-2 px-2">88 см</td>
                        <td className="py-2 px-2">70 см</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-4 mb-6 overflow-x-auto">
                  <h4 className="font-serif text-[#1F1F1D] mb-3 text-sm font-semibold">Размерная сетка: Штаны</h4>
                  <table className="w-full text-sm text-[#5A6262] border-collapse">
                    <thead>
                      <tr className="border-b-2 border-[#1F1F1D]">
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">РУ размер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват бёдер</th>
                        <th className="text-left py-2 px-2 font-semibold text-[#1F1F1D]">Обхват талии</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-[#E8E7E2]">
                        <td className="py-2 px-2">XS-S</td>
                        <td className="py-2 px-2">42</td>
                        <td className="py-2 px-2">66 см</td>
                        <td className="py-2 px-2">90 см</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-2">S-M</td>
                        <td className="py-2 px-2">44</td>
                        <td className="py-2 px-2">94 см</td>
                        <td className="py-2 px-2">70 см</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-3">Особенности</h3>
                  <ul className="space-y-2 text-sm text-[#5A6262]">
                    <li>✓ Швы на профессиональном оборудовании</li>
                    <li>✓ Премиальная фурнитура</li>
                    <li>✓ Идеальная посадка по фигуре</li>
                    <li>✓ Натуральные материалы высочайшего качества</li>
                  </ul>
                </div>

                <div className="bg-[#F9F9D7] rounded-lg p-6 mb-6">
                  <h3 className="font-serif text-[#1F1F1D] mb-4 text-sm font-semibold">Уход за изделием</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="text-lg">❄️</span>
                      <p className="text-sm text-[#5A6262]">Стирка 30°C, выверну наизнанку</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🚫</span>
                      <p className="text-sm text-[#5A6262]">Отбеливание: запрещено</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🌡️</span>
                      <p className="text-sm text-[#5A6262]">Утюжка: до 110°C</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">🧺</span>
                      <p className="text-sm text-[#5A6262]">Машинная сушка: запрещена</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="text-lg">☐</span>
                      <p className="text-sm text-[#5A6262]">Сушка: только горизонтально в тени</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#5A6262] mt-4 italic">Первое время с изнанки может осыпаться лишний ворс — это особенность ткани. После 1–2 стирок всё пройдёт.</p>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-[#E8E7E2]">
                  <span className="text-3xl font-semibold text-[#1F1F1D]">12 990 ₽</span>
                  <a
                    href="https://t.me/tansylate_bot"
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

  // Cart Page
  if (location === "/cart") {
    return (
      <div className="min-h-screen bg-[#F0EFEA]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Корзина" }
          ]} />
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Корзина</h1>
          {cartItems.length === 0 ? (
            <p className="text-[#5A6262]">Ваша корзина пуста</p>
          ) : (
            <div className="bg-white rounded-2xl p-8">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center mb-4 pb-4 border-b border-[#E8E7E2]">
                  <div>
                    <h3 className="font-serif text-[#1F1F1D]">{item.name}</h3>
                    <p className="text-sm text-[#5A6262]">{formatPrice(item.price)} ₽ x {item.quantity}</p>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                    Удалить
                  </button>
                </div>
              ))}
              <div className="mt-8 pt-8 border-t border-[#E8E7E2]">
                <p className="text-lg font-semibold text-[#1F1F1D] mb-6">Итого: {(cartTotal / 100).toFixed(2)} ₽</p>
                <div className="space-y-4">
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={checkoutForm.name}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262]"
                  />
                  <input
                    type="tel"
                    placeholder="Ваш телефон"
                    value={checkoutForm.phone}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262]"
                  />
                  <input
                    type="text"
                    placeholder="Адрес доставки"
                    value={checkoutForm.address}
                    onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                    className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262]"
                  />
                  <button
                    onClick={handleCheckout}
                    className="w-full px-8 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium"
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  return null;
}
