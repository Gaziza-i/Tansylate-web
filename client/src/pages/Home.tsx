import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Menu, X } from "lucide-react";

const LOGO_URL = "/manus-storage/tansylate-logo-cropped_660047f4.png";

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [selectedSize, setSelectedSize] = useState("M");

  // Fetch products
  const { data: products = [] } = trpc.catalog.products.useQuery();
  const submitContact = trpc.contacts.submit.useMutation();

  // Get first product for detail section
  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  const handleAddToCart = () => {
    if (selectedProduct) {
      const newItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        price: selectedProduct.price,
        size: selectedSize,
        quantity: 1,
      };
      setCartItems([...cartItems, newItem]);
      setCartOpen(true);
    }
  };

  const handleRemoveFromCart = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    const updated = [...cartItems];
    if (quantity > 0) {
      updated[index].quantity = quantity;
      setCartItems(updated);
    }
  };

  const cartTotal = cartItems.reduce(
    (sum, item) => sum + (item.price / 100) * item.quantity,
    0
  );

  const handleContactSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      await submitContact.mutateAsync({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        message: formData.get("message") as string,
      });
      (e.target as HTMLFormElement).reset();
      alert("Спасибо за ваше сообщение!");
    } catch (error) {
      console.error("Failed to submit contact:", error);
      alert("Ошибка при отправке сообщения");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* CART OVERLAY */}
      {cartOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
          onClick={() => setCartOpen(false)}
        />
      )}

      {/* CART DRAWER */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-[450px] bg-[#F0EFEA] z-[70] shadow-2xl flex flex-col transition-transform duration-300 ${
          cartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="p-8 flex justify-between items-center border-b border-[#E8E7E2]">
          <h3 className="font-serif text-2xl tracking-tight">Ваша корзина</h3>
          <button
            onClick={() => setCartOpen(false)}
            className="p-2 hover:bg-[#E8E7E2] rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <p className="text-[#5A6262] font-light text-sm">
                Ваша корзина пока пуста
              </p>
              <button
                onClick={() => setCartOpen(false)}
                className="mt-4 text-xs border-b border-black pb-1 uppercase tracking-widest hover:text-[#5A6262]"
              >
                Вернуться к покупкам
              </button>
            </div>
          ) : (
            cartItems.map((item, idx) => (
              <div key={idx} className="flex gap-6">
                <div className="w-24 h-32 bg-[#E8E7E2] rounded-2xl flex-shrink-0 flex items-center justify-center text-[10px] text-[#5A6262] italic p-2 text-center">
                  [Фото товара]
                </div>
                <div className="flex flex-col justify-between flex-1 py-1">
                  <div>
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm">{item.name}</h4>
                      <button
                        onClick={() => handleRemoveFromCart(idx)}
                        className="text-[#5A6262] hover:text-black transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                    <p className="text-[11px] text-[#5A6262] uppercase tracking-widest mt-1">
                      Размер: {item.size}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center border border-[#E8E7E2] rounded-lg">
                      <button
                        onClick={() =>
                          handleUpdateQuantity(idx, item.quantity - 1)
                        }
                        className="px-3 py-1 hover:bg-gray-50 text-xs"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 text-xs font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          handleUpdateQuantity(idx, item.quantity + 1)
                        }
                        className="px-3 py-1 hover:bg-gray-50 text-xs"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-medium">
                      {((item.price / 100) * item.quantity).toLocaleString()} ₽
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-8 border-t border-[#E8E7E2] space-y-6">
            <div className="flex justify-between items-baseline">
              <span className="text-[#5A6262] text-sm font-light">Итого</span>
              <span className="text-xl font-medium tracking-tight">
                {cartTotal.toLocaleString()} ₽
              </span>
            </div>
            <p className="text-[10px] text-[#5A6262] leading-relaxed font-light italic">
              Налоги и стоимость доставки рассчитываются при оформлении заказа.
            </p>
            <button className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-xl transition-all">
              Оформить заказ
            </button>
          </div>
        )}
      </div>

      {/* HEADER */}
      <header className="sticky top-0 w-full bg-[#F9F9D7] border-b border-[#E8E7E2] z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <a href="#" className="flex items-center space-x-3 group cursor-pointer" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
            <img
              src={LOGO_URL}
              alt="Tansylate"
              className="h-8 w-auto"
            />
          </a>

          <nav className="hidden md:flex items-center space-x-10 text-[11px] uppercase tracking-[0.2em] font-medium text-[#5A6262]">
            <a
              href="#catalog"
              className="hover:text-black transition-colors"
            >
              Коллекции
            </a>
            <a
              href="#philosophy"
              className="hover:text-black transition-colors"
            >
              Философия
            </a>
            <a
              href="#founder"
              className="hover:text-black transition-colors"
            >
              Основательница
            </a>
            <a
              href="#contacts"
              className="hover:text-black transition-colors"
            >
              Контакты
            </a>
          </nav>

          <div className="flex items-center space-x-5">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 hover:bg-[#E8E7E2] rounded-full transition-colors"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-xs font-semibold tracking-widest text-[#5A6262]">
              RU
            </span>
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative w-10 h-10 rounded-full border border-[#E8E7E2] flex items-center justify-center hover:shadow-sm transition-shadow cursor-pointer"
            >
              <ShoppingCart size={18} />
              {cartItems.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[8px] flex items-center justify-center rounded-full font-bold">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#F9F9D7] border-b border-[#E8E7E2] px-6 py-4 space-y-4">
          <a
            href="#catalog"
            className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Коллекции
          </a>
          <a
            href="#philosophy"
            className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Философия
          </a>
          <a
            href="#founder"
            className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Основательница
          </a>
          <a
            href="#contacts"
            className="block text-sm uppercase tracking-widest text-[#5A6262] hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(false)}
          >
            Контакты
          </a>
        </div>
      )}

      <main>
        {/* HERO SECTION */}
        <section className="relative px-6 py-10 max-w-7xl mx-auto">
          <div className="relative h-[80vh] rounded-[2.5rem] overflow-hidden shadow-sm bg-stone-200 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/5" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
              <span className="text-white text-[10px] uppercase tracking-[0.6em] mb-6 opacity-90">
                Основано в 2024
              </span>
              <h1 className="font-serif text-white text-5xl md:text-8xl mb-10 leading-tight">
                Искусство быть <br />
                <span className="italic font-light">собой</span>
              </h1>
              <a
                href="#catalog"
                className="px-10 py-4 bg-[#F0EFEA] text-black rounded-full text-xs font-semibold uppercase tracking-widest hover:scale-105 transition-transform shadow-xl"
              >
                Исследовать
              </a>
            </div>
          </div>
        </section>

        {/* PHILOSOPHY SECTION */}
        <section id="philosophy" className="py-32 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-serif text-4xl mb-8 leading-tight text-stone-800">
                  Философия <br />
                  уважения к деталям
                </h2>
                <div className="space-y-6 text-[#5A6262] leading-relaxed font-light">
                  <p>
                    Каждая вещь Tansylate — это результат долгих поисков
                    идеального кроя и глубокого уважения к деталям. Мы верим,
                    что одежда не должна кричать — она должна дополнять тишину
                    вашего образа.
                  </p>
                  <p>
                    Наше производство сосредоточено на качестве, а не на
                    количестве. Мы выбираем материалы, которые живут долго и
                    становятся лучше со временем.
                  </p>
                </div>
              </div>
              <div className="aspect-[3/4] bg-[#E8E7E2] rounded-[2rem] flex items-center justify-center overflow-hidden">
                <span className="text-stone-300 italic text-sm">
                  [Эстетичное макро-фото ткани]
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* CATALOG SECTION */}
        <section id="catalog" className="max-w-7xl mx-auto px-6 py-24">
          <h2 className="font-serif text-4xl mb-16 text-center">
            Новые поступления
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-[#F0EFEA] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => {
                  setSelectedProduct(product);
                  document
                    .getElementById("product-detail")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                <div className="aspect-[3/4] bg-stone-50 flex items-center justify-center">
                  <span className="text-stone-300 italic text-sm">
                    [Фото товара]
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="font-serif text-xl mb-2">{product.name}</h3>
                  <p className="text-lg font-light">
                    {product.price.toLocaleString()} ₽
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCT DETAIL SECTION */}
        {selectedProduct && (
          <section
            id="product-detail"
            className="max-w-7xl mx-auto px-6 py-24 bg-[#F0EFEA] rounded-[3rem] shadow-sm"
          >
            <div className="flex flex-col lg:flex-row gap-16">
              <div className="lg:w-3/5 grid grid-cols-2 gap-3">
                <div className="col-span-2 aspect-[4/5] bg-stone-50 rounded-3xl overflow-hidden flex items-center justify-center">
                  <span className="text-stone-300 italic">
                    [Студийное фото: Зип-худи в полный рост]
                  </span>
                </div>
                <div className="aspect-square bg-stone-50 rounded-3xl overflow-hidden flex items-center justify-center text-stone-300 text-xs italic">
                  [Макро: Фурнитура]
                </div>
                <div className="aspect-square bg-stone-50 rounded-3xl overflow-hidden flex items-center justify-center text-stone-300 text-xs italic">
                  [Фото: Вид сзади]
                </div>
              </div>

              <div className="lg:w-2/5">
                <div className="sticky top-32">
                  <div className="flex justify-between items-baseline mb-2">
                    <h2 className="font-serif text-3xl">
                      {selectedProduct.name}
                    </h2>
                    <span className="text-xl font-light">
                      {selectedProduct.price.toLocaleString()} ₽
                    </span>
                  </div>

                  <div className="flex items-center space-x-2 mb-8 text-sm">
                    <span className="flex text-black italic">★★★★★</span>
                    <span className="text-[#5A6262] font-light underline">
                      12 отзывов
                    </span>
                  </div>

                  <p className="text-[#5A6262] mb-10 leading-relaxed font-light text-sm">
                    {selectedProduct.description ||
                      "Идеальный баланс плотности и мягкости. Оверсайз силуэт, который сохраняет форму благодаря высокому качеству хлопкового футера (480 г/м²)."}
                  </p>

                  <div className="space-y-6 mb-10">
                    <div>
                      <label className="text-[10px] uppercase tracking-widest text-[#5A6262] block mb-3">
                        Размер
                      </label>
                      <div className="flex gap-3">
                        {["S", "M", "L"].map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-6 py-3 rounded-xl text-xs transition-all ${
                              selectedSize === size
                                ? "bg-black text-white shadow-lg shadow-black/10"
                                : "border border-[#E8E7E2] hover:border-black"
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={handleAddToCart}
                      className="w-full py-5 bg-black text-white rounded-2xl font-medium tracking-widest uppercase text-[10px] hover:shadow-2xl transition-all"
                    >
                      Добавить в корзину
                    </button>
                  </div>

                  <div className="border-t border-[#E8E7E2] pt-6 space-y-4">
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none text-sm font-medium">
                        Состав и уход
                        <span className="transition-transform group-open:rotate-180 text-[#5A6262]">
                          ▼
                        </span>
                      </summary>
                      <p className="pt-4 text-xs text-[#5A6262] leading-relaxed font-light">
                        {selectedProduct.composition ||
                          "100% Хлопок пенье. Деликатная стирка при 30 градусах. Сушка в расправленном виде. Сделано с любовью в России."}
                      </p>
                    </details>
                    <details className="group">
                      <summary className="flex justify-between items-center cursor-pointer list-none text-sm font-medium">
                        Доставка и возврат
                        <span className="transition-transform group-open:rotate-180 text-[#5A6262]">
                          ▼
                        </span>
                      </summary>
                      <p className="pt-4 text-xs text-[#5A6262] leading-relaxed font-light">
                        Бесплатная примерка перед покупкой. Возврат в течение
                        14 дней.
                      </p>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* FOUNDER SECTION */}
        <section id="founder" className="py-32 px-6 max-w-7xl mx-auto">
          <div className="bg-[#F2EBE1] rounded-[4rem] overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 aspect-[4/5] bg-stone-300 flex items-center justify-center overflow-hidden">
                <p className="text-white italic font-serif text-xl text-center px-4">
                  [Портрет: Тансылу в студии]
                </p>
              </div>
              <div className="md:w-1/2 p-12 md:p-24 text-stone-800">
                <span className="font-serif italic text-2xl text-[#5A6262] mb-6 block leading-tight">
                  "Мы создаем не просто одежду, а ощущение дома, где бы вы ни
                  находились."
                </span>
                <h3 className="font-serif text-3xl mb-8">История за брендом</h3>
                <p className="text-stone-600 font-light leading-relaxed text-sm mb-10">
                  Путь Tansylate начался с поиска одной единственной вещи,
                  которая сочетала бы в себе строгость линий и абсолютную
                  свободу движений. Не найдя её, я решила создать её сама.
                </p>
                <p className="text-stone-600 font-light leading-relaxed text-sm">
                  Сегодня каждая коллекция — это диалог между мной и вами. Я
                  лично тестирую каждый образец, чтобы быть уверенной: это
                  именно то, что заслуживает вашего внимания.
                </p>
                <div className="mt-12 flex items-center space-x-4">
                  <div className="w-10 h-px bg-stone-800" />
                  <span className="font-serif text-lg italic">
                    Тансылу, основательница Tansylate
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ADVANTAGES SECTION */}
        <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-16 border-t border-[#E8E7E2]">
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[#F0EFEA] rounded-full shadow-sm border border-gray-50 text-stone-600">
              📱
            </div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">
              Доставка с примеркой
            </h4>
            <p className="text-xs text-[#5A6262] font-light leading-relaxed px-10">
              Оплачивайте только то, что идеально подошло вам после примерки.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[#F0EFEA] rounded-full shadow-sm border border-gray-50 text-stone-600">
              ⏰
            </div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">
              Этичное производство
            </h4>
            <p className="text-xs text-[#5A6262] font-light leading-relaxed px-10">
              Используем органический хлопок и работаем с локальными мастерами.
            </p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="w-12 h-12 mb-6 flex items-center justify-center bg-[#F0EFEA] rounded-full shadow-sm border border-gray-50 text-stone-600">
              💬
            </div>
            <h4 className="font-semibold text-sm mb-3 tracking-tight">
              Личный подход
            </h4>
            <p className="text-xs text-[#5A6262] font-light leading-relaxed px-10">
              Отвечаем на любые вопросы в Telegram и WhatsApp в течение 10
              минут.
            </p>
          </div>
        </section>

        {/* CONTACTS SECTION */}
        <section id="contacts" className="py-32 px-6 bg-[#F0EFEA] border-t border-gray-50">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-24">
            <div>
              <h2 className="font-serif text-4xl mb-10 leading-tight text-stone-800">
                Давайте оставаться <br />
                на связи
              </h2>
              <div className="space-y-10">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 mb-4">
                    Сотрудничество и вопросы
                  </p>
                  <a
                    href="mailto:hello@tansylate.ru"
                    className="text-2xl font-light hover:underline underline-offset-8 decoration-1"
                  >
                    hello@tansylate.ru
                  </a>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-stone-300 mb-4">
                    Мессенджеры
                  </p>
                  <div className="flex space-x-6">
                    <a
                      href="#"
                      className="text-sm border-b border-stone-800 pb-1 hover:text-[#5A6262] transition-colors underline-offset-8"
                    >
                      Telegram
                    </a>
                    <a
                      href="#"
                      className="text-sm border-b border-stone-800 pb-1 hover:text-[#5A6262] transition-colors underline-offset-8"
                    >
                      WhatsApp
                    </a>
                    <a
                      href="#"
                      className="text-sm border-b border-stone-800 pb-1 hover:text-[#5A6262] transition-colors underline-offset-8"
                    >
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#FAF7F2] p-10 rounded-[2.5rem]">
              <p className="text-sm mb-8 font-medium">
                Оставьте сообщение, и мы перезвоним
              </p>
              <form onSubmit={handleContactSubmit} className="space-y-5">
                <input
                  type="text"
                  name="name"
                  placeholder="Ваше имя"
                  required
                  className="w-full p-5 bg-[#F0EFEA] rounded-2xl border-none text-sm focus:ring-1 focus:ring-stone-200 outline-none transition-shadow"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email или Телефон"
                  required
                  className="w-full p-5 bg-[#F0EFEA] rounded-2xl border-none text-sm focus:ring-1 focus:ring-stone-200 outline-none transition-shadow"
                />
                <textarea
                  name="message"
                  placeholder="Ваш вопрос"
                  rows={4}
                  required
                  className="w-full p-5 bg-[#F0EFEA] rounded-2xl border-none text-sm focus:ring-1 focus:ring-stone-200 outline-none transition-shadow"
                />
                <button
                  type="submit"
                  className="w-full py-5 bg-black text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest hover:shadow-xl transition-all"
                >
                  Отправить
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-20 px-6 border-t border-[#E8E7E2] bg-[#F9F9D7] w-full">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <a href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
              <img
                src={LOGO_URL}
                alt="Tansylate"
                className="h-6 w-auto"
              />
            </a>
            <p className="text-[9px] text-[#5A6262] uppercase tracking-widest">
              © 2024 Все права защищены
            </p>
          </div>

          <div className="flex flex-col md:flex-row md:space-x-12 space-y-4 md:space-y-0 text-[10px] uppercase tracking-widest text-[#5A6262]">
            <div className="flex space-x-6 md:space-x-12">
              <a href="#" className="hover:text-black transition-colors">
                Доставка
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Обмен
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Публичная оферта
              </a>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-black transition-colors">
                Telegram
              </a>
              <a href="#" className="hover:text-black transition-colors">
                WhatsApp
              </a>
              <a href="#" className="hover:text-black transition-colors">
                Instagram
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
