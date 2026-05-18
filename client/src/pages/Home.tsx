import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Truck, RotateCcw, Leaf, Mail, Phone, Search, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { useCart } from "@/contexts/CartContext";

const LOGO_URL = "/manus-storage/tansylate-logo-cropped_660047f4.png";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" });
  const [searchQuery, setSearchQuery] = useState("");
  
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
          <a href="/#delivery" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="hover:text-black transition-colors">Доставка</a>
          <a href="/#delivery" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="hover:text-black transition-colors">Возврат</a>
          <a href="/#contacts" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="hover:text-black transition-colors">Контакты</a>
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

      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F9D7] border-b border-[#E8E7E2] px-4 py-4 space-y-3">
          <a href="/catalog" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/catalog"); }}>Каталог</a>
          <a href="/#delivery" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/"); }}>Доставка</a>
          <a href="/#delivery" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/"); }}>Возврат</a>
          <a href="/#contacts" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/"); }}>Контакты</a>
          <a href="/privacy" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => { closeMobileMenu(); setLocation("/privacy"); }}>Политика</a>
          <button onClick={() => { setLocation("/cart"); closeMobileMenu(); }} className="block w-full text-left text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors">Корзина</button>
        </div>
      )}
    </header>
  );

  // Footer Component
  const Footer = () => (
    <footer className="py-12 px-4 md:px-6 border-t border-[#E8E7E2] bg-[#F9F9D7] w-full">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
        <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
          <img src={LOGO_URL} alt="Tansylate" className="h-10 w-auto" />
        </a>
        <div className="flex gap-8 text-xs uppercase tracking-widest text-[#5A6262]">
          <a href="/#delivery" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="hover:text-black transition-colors">Доставка</a>
          <a href="#" className="hover:text-black transition-colors">Обмен</a>
          <a href="/privacy" onClick={(e) => { e.preventDefault(); setLocation("/privacy"); }} className="hover:text-black transition-colors">Политика</a>
        </div>
      </div>
    </footer>
  );

  // Product Detail Page
  const productId = location.match(/\/product\/(\d+)/)?.[1];
  if (productId) {
    const product = products.find(p => p.id === parseInt(productId));
    if (!product) {
      return (
        <div className="min-h-screen bg-[#F0EFEA]">
          <Header />
          <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
            <p className="text-center text-[#5A6262]">Товар не найден</p>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#F0EFEA]">
        <Header />
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Каталог", href: "/catalog" },
            { label: product.name }
          ]} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white rounded-2xl overflow-hidden h-96 md:h-full">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#5A6262]">Фото товара</div>
              )}
            </div>

            <div>
              <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-4">{product.name}</h1>
              <p className="text-2xl font-semibold text-[#1F1F1D] mb-6">{formatPrice(product.price)} ₽</p>
              
              <div className="mb-8">
                <h3 className="font-serif text-[#1F1F1D] text-lg mb-4">Описание</h3>
                <p className="text-[#5A6262] font-light leading-relaxed">{product.description}</p>
              </div>

              <div className="mb-8">
                <h3 className="font-serif text-[#1F1F1D] text-lg mb-4">Размеры</h3>
                <div className="flex gap-3">
                  {["XS", "S", "M", "L", "XL", "XXL"].map(size => (
                    <button key={size} className="px-4 py-2 border border-[#E8E7E2] rounded-lg hover:bg-[#E8E7E2] transition-colors text-[#1F1F1D]">
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h3 className="font-serif text-[#1F1F1D] text-lg mb-4">Состав</h3>
                <p className="text-[#5A6262] font-light">100% натуральный хлопок</p>
              </div>

              <button
                onClick={() => addToCart(product)}
                className="w-full px-8 py-4 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors font-medium"
              >
                Добавить в корзину
              </button>

              <button
                onClick={() => setLocation("/catalog")}
                className="w-full mt-4 px-8 py-4 border border-[#5A6262] text-[#5A6262] text-sm uppercase tracking-widest rounded-full hover:bg-[#5A6262] hover:text-white transition-colors"
              >
                Вернуться в каталог
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Privacy Policy Page
  if (location === "/privacy") {
    return (
      <div className="min-h-screen bg-[#F0EFEA]">
        <Header />
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
          <Breadcrumbs items={[
            { label: "Главная", href: "/" },
            { label: "Политика конфиденциальности" }
          ]} />

          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Политика конфиденциальности</h1>

          <div className="bg-white p-8 rounded-2xl space-y-6 text-[#5A6262] font-light">
            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">1. Общие положения</h2>
              <p>Настоящая Политика конфиденциальности определяет, как компания Tansylate собирает, использует и защищает личные данные пользователей при использовании нашего веб-сайта и услуг.</p>
            </section>

            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">2. Собираемые данные</h2>
              <p>Мы собираем следующие данные при оформлении заказа:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Имя и фамилия</li>
                <li>Номер телефона</li>
                <li>Адрес доставки</li>
                <li>Email адрес (если предоставлен)</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">3. Использование данных</h2>
              <p>Собранные данные используются исключительно для:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Обработки и доставки вашего заказа</li>
                <li>Связи с вами по поводу вашего заказа</li>
                <li>Улучшения качества наших услуг</li>
              </ul>
            </section>

            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">4. Защита данных</h2>
              <p>Мы применяем современные методы защиты для обеспечения безопасности ваших личных данных. Ваша информация хранится в защищённой базе данных и не передаётся третьим лицам без вашего согласия.</p>
            </section>

            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">5. Ваши права</h2>
              <p>Вы имеете право на доступ, исправление или удаление ваших личных данных. Для этого свяжитесь с нами через контактную форму на сайте.</p>
            </section>

            <section>
              <h2 className="font-serif text-[#1F1F1D] text-xl mb-3">6. Контакты</h2>
              <p>Если у вас есть вопросы о нашей Политике конфиденциальности, пожалуйста, свяжитесь с нами:</p>
              <p className="mt-2">Email: hello@tansylate.ru</p>
              <p>Телефон: +7 (999) 999-99-99</p>
            </section>

            <section className="pt-4 border-t border-[#E8E7E2]">
              <p className="text-sm">Последнее обновление: май 2026</p>
            </section>
          </div>

          <button
            onClick={() => setLocation("/")}
            className="mt-8 px-8 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
          >
            Вернуться на главную
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Catalog Page
  if (location === "/catalog") {
    return (
      <div className="min-h-screen bg-[#F0EFEA]">
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

          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#5A6262]">Товары не найдены</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product: any) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <div 
                    onClick={() => setLocation(`/product/${product.id}`)}
                    className="w-full h-64 bg-[#E8E7E2] overflow-hidden"
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5A6262] text-sm">Фото товара</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 
                      onClick={() => setLocation(`/product/${product.id}`)}
                      className="text-lg font-serif text-[#1F1F1D] mb-2 hover:text-[#5A6262] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#5A6262] mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-semibold text-[#1F1F1D]">{formatPrice(product.price)} ₽</span>
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
                      >
                        В корзину
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12">Корзина</h1>

          {cartItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#5A6262] text-lg mb-6">Ваша корзина пуста</p>
              <button
                onClick={() => setLocation("/catalog")}
                className="px-8 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
              >
                Перейти в каталог
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg border border-[#E8E7E2] flex gap-4">
                    <div className="w-24 h-24 bg-[#E8E7E2] rounded-lg flex-shrink-0 overflow-hidden cursor-pointer" onClick={() => setLocation(`/product/${item.id}`)}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#5A6262]">Фото</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-[#1F1F1D] mb-2 cursor-pointer hover:text-[#5A6262]" onClick={() => setLocation(`/product/${item.id}`)}>{item.name}</h3>
                      <p className="text-[#5A6262] text-sm mb-4">{formatPrice(item.price)} ₽</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-[#E8E7E2] rounded hover:bg-[#E8E7E2] transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-[#E8E7E2] rounded hover:bg-[#E8E7E2] transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-auto text-xs text-[#5A6262] hover:text-red-500 transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 rounded-lg border border-[#E8E7E2] h-fit">
                <h2 className="font-serif text-[#1F1F1D] text-lg mb-6">Оформление заказа</h2>

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#5A6262] mb-2">Имя</label>
                    <input
                      type="text"
                      value={checkoutForm.name}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262]"
                      placeholder="Ваше имя"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#5A6262] mb-2">Телефон</label>
                    <input
                      type="tel"
                      value={checkoutForm.phone}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262]"
                      placeholder="+7 (999) 000-00-00"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-widest text-[#5A6262] mb-2">Адрес доставки</label>
                    <textarea
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className="w-full px-4 py-2 border border-[#E8E7E2] rounded-lg focus:outline-none focus:border-[#5A6262] resize-none"
                      placeholder="Город, улица, дом..."
                      rows={3}
                    />
                  </div>
                </div>

                <div className="border-t border-[#E8E7E2] pt-4 mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-[#5A6262]">Сумма:</span>
                    <span className="font-semibold text-[#1F1F1D]">{formatPrice(cartTotal)} ₽</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={submitContact.isPending}
                  className="w-full px-6 py-3 bg-[#5A6262] text-white text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors disabled:opacity-50"
                >
                  {submitContact.isPending ? "Обработка..." : "Оформить заказ"}
                </button>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-[#F0EFEA]">
      <Header />

      <main>
        {/* HERO */}
        <section className="py-20 md:py-32 px-4 md:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5A6262] mb-8">Основано в 2026</p>
          <h1 className="text-4xl md:text-6xl font-serif text-[#1F1F1D] mb-8 leading-tight">
            Искусство быть собой
          </h1>
          <p className="text-sm md:text-base text-[#5A6262] max-w-2xl mx-auto mb-12 font-light">
            Премиальная одежда из натуральных материалов. Каждая вещь — это произведение искусства, созданное для тех, кто ценит качество и стиль.
          </p>
          <button
            onClick={() => setLocation("/catalog")}
            className="px-8 md:px-12 py-3 md:py-4 bg-[#5A6262] text-white text-xs md:text-sm uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
          >
            Исследовать
          </button>
        </section>

        {/* NEW ARRIVALS */}
        <section id="catalog" className="py-20 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Новые поступления</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product: any) => (
                <div key={product.id} className="rounded-2xl overflow-hidden bg-[#F0EFEA] hover:shadow-lg transition-shadow cursor-pointer">
                  <div 
                    onClick={() => setLocation(`/product/${product.id}`)}
                    className="w-full h-64 bg-[#E8E7E2] overflow-hidden"
                  >
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5A6262] text-sm">Фото товара</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 
                      onClick={() => setLocation(`/product/${product.id}`)}
                      className="text-lg font-serif text-[#1F1F1D] mb-2 hover:text-[#5A6262] transition-colors"
                    >
                      {product.name}
                    </h3>
                    <p className="text-sm text-[#5A6262] mb-4">{formatPrice(product.price)} ₽</p>
                    <button
                      onClick={() => addToCart(product)}
                      className="w-full px-4 py-2 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <button
                onClick={() => setLocation("/catalog")}
                className="px-8 py-3 border border-[#5A6262] text-[#5A6262] text-xs uppercase tracking-widest rounded-full hover:bg-[#5A6262] hover:text-white transition-colors"
              >
                Смотреть весь каталог
              </button>
            </div>
          </div>
        </section>

        {/* WHY TRUST US */}
        <section id="delivery" className="py-20 px-4 md:px-6 bg-[#F9F9D7]">
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

        {/* FOUNDER STORY */}
        <section className="py-20 px-4 md:px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="order-2 md:order-1">
                <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">О себе</h2>
                <div className="space-y-6 text-[#1F1F1D] font-light leading-relaxed">
                  <p>
                    Меня зовут <span className="font-semibold">Тансылу</span>, мне 16 лет. Моя цель — создавать по-настоящему долговечную одежду.
                  </p>
                  <p>
                    Все ключевые этапы контролирую лично: от разработки удобных эскизов и работы с дизайнерами до проверки швейного цеха и финальной упаковки.
                  </p>
                  <p>
                    Это не просто бизнес, а ответственность за внешний вид и качество готового изделия. В процесс вкладывается максимум сил, чтобы гарантировать высокое качество исполнения и внимание к каждому шву.
                  </p>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <img 
                  src="/manus-storage/IMG_0057_729af000.jpeg" 
                  alt="Тансылу" 
                  className="w-full h-auto rounded-2xl object-cover shadow-lg"
                />
              </div>
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section id="contacts" className="py-20 px-4 md:px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Свяжитесь с нами</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="bg-[#F9F9D7] p-8 rounded-2xl">
                <h3 className="font-serif text-[#1F1F1D] text-xl mb-6">Контактная информация</h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <Phone size={24} className="text-[#5A6262] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#5A6262] mb-1">Телефон</p>
                      <a href="tel:+79999999999" className="text-[#1F1F1D] hover:text-[#5A6262] transition-colors font-medium">+7 (999) 999-99-99</a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <Mail size={24} className="text-[#5A6262] mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-widest text-[#5A6262] mb-1">Email</p>
                      <a href="mailto:hello@tansylate.ru" className="text-[#1F1F1D] hover:text-[#5A6262] transition-colors font-medium">hello@tansylate.ru</a>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-[#F9F9D7] p-8 rounded-2xl">
                <h3 className="font-serif text-[#1F1F1D] text-xl mb-6">Социальные сети</h3>
                <p className="text-[#5A6262] mb-6 text-sm font-light">Следите за новыми коллекциями и новостями бренда</p>
                <div className="flex flex-col gap-3">
                  <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors text-center font-medium">
                    Telegram
                  </a>
                  <a href="https://wa.me/79999999999" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors text-center font-medium">
                    WhatsApp
                  </a>
                  <a href="https://instagram.com/tansylate" target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors text-center font-medium">
                    Instagram
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
