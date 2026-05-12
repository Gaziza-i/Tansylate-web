import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X, Truck, RotateCcw, Leaf } from "lucide-react";
import { useLocation } from "wouter";

const LOGO_URL = "/manus-storage/tansylate-logo-cropped_660047f4.png";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [checkoutForm, setCheckoutForm] = useState({ name: "", phone: "", address: "" });

  // Fetch products
  const { data: products = [] } = trpc.catalog.products.useQuery();
  const submitContact = trpc.contacts.submit.useMutation();

  const handleAddToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item =>
        item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCartItems([...cartItems, { ...product, quantity: 1 }]);
    }
    setCartOpen(true);
  };

  const handleRemoveFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  const handleUpdateQuantity = (productId: number, quantity: number) => {
    if (quantity > 0) {
      setCartItems(cartItems.map(item =>
        item.id === productId ? { ...item, quantity } : item
      ));
    } else {
      handleRemoveFromCart(productId);
    }
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

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
    setCartItems([]);
    setCheckoutForm({ name: "", phone: "", address: "" });
    setLocation("/");
  };

  const formatPrice = (price: number) => {
    return (price / 100).toFixed(0);
  };

  // Catalog Page
  if (location === "/catalog") {
    return (
      <div className="min-h-screen bg-[#F0EFEA]">
        {/* HEADER */}
        <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
              <img src={LOGO_URL} alt="Tansylate" className="h-8 w-auto" />
            </a>

            <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#5A6262]">
              <a href="/catalog" className="hover:text-black transition-colors">Каталог</a>
              <a href="#delivery" className="hover:text-black transition-colors">Доставка</a>
              <a href="#contacts" className="hover:text-black transition-colors">Контакты</a>
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
              <a href="/catalog" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Каталог</a>
              <a href="#delivery" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Доставка</a>
              <a href="#contacts" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Контакты</a>
            </div>
          )}
        </header>

        {/* CATALOG */}
        <main className="max-w-7xl mx-auto px-4 md:px-6 py-12">
          <h1 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12">Каталог товаров</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#5A6262] text-sm">Фото товара</div>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">{product.name}</h3>
                  <p className="text-sm text-[#5A6262] mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-semibold text-[#1F1F1D]">{formatPrice(product.price)} ₽</span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="px-4 py-2 bg-[#5A6262] text-white text-xs uppercase tracking-widest rounded-full hover:bg-[#3a4242] transition-colors"
                    >
                      В корзину
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="py-12 px-4 md:px-6 border-t border-[#E8E7E2] bg-[#F9F9D7] w-full mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
              <img src={LOGO_URL} alt="Tansylate" className="h-6 w-auto" />
            </a>
            <div className="flex gap-8 text-xs uppercase tracking-widest text-[#5A6262]">
              <a href="#" className="hover:text-black transition-colors">Доставка</a>
              <a href="#" className="hover:text-black transition-colors">Обмен</a>
              <a href="#" className="hover:text-black transition-colors">Публичная оферта</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Cart Page
  if (location === "/cart") {
    return (
      <div className="min-h-screen bg-[#F0EFEA]">
        {/* HEADER */}
        <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
            <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
              <img src={LOGO_URL} alt="Tansylate" className="h-8 w-auto" />
            </a>

            <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#5A6262]">
              <a href="/catalog" className="hover:text-black transition-colors">Каталог</a>
              <a href="#delivery" className="hover:text-black transition-colors">Доставка</a>
              <a href="#contacts" className="hover:text-black transition-colors">Контакты</a>
            </nav>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 hover:bg-[#E8E7E2] rounded-full transition-colors">
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden bg-[#F9F9D7] border-b border-[#E8E7E2] px-4 py-4 space-y-3">
              <a href="/catalog" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Каталог</a>
              <a href="#delivery" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Доставка</a>
              <a href="#contacts" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Контакты</a>
            </div>
          )}
        </header>

        {/* CART PAGE */}
        <main className="max-w-4xl mx-auto px-4 md:px-6 py-12">
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
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="bg-white p-6 rounded-lg border border-[#E8E7E2] flex gap-4">
                    <div className="w-24 h-24 bg-[#E8E7E2] rounded-lg flex-shrink-0 overflow-hidden">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[#5A6262]">Фото</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-serif text-[#1F1F1D] mb-2">{item.name}</h3>
                      <p className="text-[#5A6262] text-sm mb-4">{formatPrice(item.price)} ₽</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 border border-[#E8E7E2] rounded hover:bg-[#E8E7E2] transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 border border-[#E8E7E2] rounded hover:bg-[#E8E7E2] transition-colors"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveFromCart(item.id)}
                          className="ml-auto text-xs text-[#5A6262] hover:text-red-500 transition-colors"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Checkout Form */}
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

        {/* FOOTER */}
        <footer className="py-12 px-4 md:px-6 border-t border-[#E8E7E2] bg-[#F9F9D7] w-full mt-20">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
            <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
              <img src={LOGO_URL} alt="Tansylate" className="h-6 w-auto" />
            </a>
            <div className="flex gap-8 text-xs uppercase tracking-widest text-[#5A6262]">
              <a href="#" className="hover:text-black transition-colors">Доставка</a>
              <a href="#" className="hover:text-black transition-colors">Обмен</a>
              <a href="#" className="hover:text-black transition-colors">Публичная оферта</a>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // Home Page
  return (
    <div className="min-h-screen bg-[#F0EFEA]">
      {/* HEADER */}
      <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-20 flex items-center justify-between">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
            <img src={LOGO_URL} alt="Tansylate" className="h-8 w-auto" />
          </a>

          <nav className="hidden md:flex items-center space-x-8 text-[11px] uppercase tracking-[0.2em] font-medium text-[#5A6262]">
            <a href="/catalog" className="hover:text-black transition-colors">Каталог</a>
            <a href="#delivery" className="hover:text-black transition-colors">Доставка</a>
            <a href="#contacts" className="hover:text-black transition-colors">Контакты</a>
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
            <a href="/catalog" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Каталог</a>
            <a href="#delivery" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Доставка</a>
            <a href="#contacts" className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors" onClick={() => setMobileMenuOpen(false)}>Контакты</a>
          </div>
        )}
      </header>

      <main>
        {/* HERO */}
        <section className="py-20 md:py-32 px-4 md:px-6 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-[#5A6262] mb-8">Основано в 2024</p>
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

        {/* NEW ARRIVALS - Product Grid */}
        <section id="catalog" className="py-20 px-4 md:px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-12 text-center">Новые поступления</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.slice(0, 6).map((product: any) => (
                <div key={product.id} className="rounded-2xl overflow-hidden bg-[#F0EFEA] hover:shadow-lg transition-shadow">
                  <div className="w-full h-64 bg-[#E8E7E2] overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#5A6262] text-sm">Фото товара</div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-serif text-[#1F1F1D] mb-2">{product.name}</h3>
                    <p className="text-sm text-[#5A6262] mb-4">{formatPrice(product.price)} ₽</p>
                    <button
                      onClick={() => handleAddToCart(product)}
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
                  Примеряйте товар перед оплатой. Если не подошло — вернём деньги без вопросов.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-[#5A6262] rounded-full flex items-center justify-center">
                  <RotateCcw size={32} className="text-white" />
                </div>
                <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Возврат 14 дней</h3>
                <p className="text-sm text-[#5A6262] font-light">
                  Измените решение? Вернуть товар можно в течение 14 дней с момента получения.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-[#5A6262] rounded-full flex items-center justify-center">
                  <Leaf size={32} className="text-white" />
                </div>
                <h3 className="font-serif text-[#1F1F1D] text-lg mb-3">Натуральные ткани</h3>
                <p className="text-sm text-[#5A6262] font-light">
                  Только натуральные материалы: хлопок, лён, шерсть. Забота о вас и планете.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CONTACTS */}
        <section id="contacts" className="py-20 px-4 md:px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-serif text-[#1F1F1D] mb-8">Контакты</h2>
            <p className="text-[#5A6262] mb-8 text-lg">
              Есть вопросы? Напишите нам, и мы ответим в течение 24 часов.
            </p>
            <div className="flex flex-col md:flex-row gap-8 justify-center">
              <a href="https://t.me/tansylate" target="_blank" rel="noopener noreferrer" className="text-[#5A6262] hover:text-[#1F1F1D] transition-colors">
                Telegram
              </a>
              <a href="https://wa.me/79999999999" target="_blank" rel="noopener noreferrer" className="text-[#5A6262] hover:text-[#1F1F1D] transition-colors">
                WhatsApp
              </a>
              <a href="https://instagram.com/tansylate" target="_blank" rel="noopener noreferrer" className="text-[#5A6262] hover:text-[#1F1F1D] transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-12 px-4 md:px-6 border-t border-[#E8E7E2] bg-[#F9F9D7] w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <a href="/" onClick={(e) => { e.preventDefault(); setLocation("/"); }} className="flex items-center space-x-3 cursor-pointer">
            <img src={LOGO_URL} alt="Tansylate" className="h-6 w-auto" />
          </a>
          <div className="flex gap-8 text-xs uppercase tracking-widest text-[#5A6262]">
            <a href="#" className="hover:text-black transition-colors">Доставка</a>
            <a href="#" className="hover:text-black transition-colors">Обмен</a>
            <a href="#" className="hover:text-black transition-colors">Публичная оферта</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
