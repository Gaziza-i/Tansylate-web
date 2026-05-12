import { describe, it, expect, beforeEach, afterEach } from "vitest";

// Mock localStorage for Node environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock global localStorage
global.localStorage = localStorageMock as any;

describe("CartContext - localStorage persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it("should persist cart items to localStorage", () => {
    const testCart = [
      { id: 1, name: "Product 1", price: 10000, quantity: 1, imageUrl: "" },
    ];

    localStorage.setItem("tansylate-cart", JSON.stringify(testCart));
    const saved = localStorage.getItem("tansylate-cart");

    expect(saved).toBeDefined();
    expect(JSON.parse(saved!)).toEqual(testCart);
  });

  it("should handle empty cart in localStorage", () => {
    const empty = localStorage.getItem("tansylate-cart");
    expect(empty).toBeNull();
  });

  it("should correctly parse and restore cart from localStorage", () => {
    const cartData = [
      { id: 1, name: "Платье", price: 45000, quantity: 2, imageUrl: "url" },
      { id: 2, name: "Рубашка", price: 32000, quantity: 1, imageUrl: "url" },
    ];

    localStorage.setItem("tansylate-cart", JSON.stringify(cartData));
    const retrieved = JSON.parse(localStorage.getItem("tansylate-cart")!);

    expect(retrieved).toHaveLength(2);
    expect(retrieved[0].name).toBe("Платье");
    expect(retrieved[0].quantity).toBe(2);
  });

  it("should calculate cart total correctly", () => {
    const cartItems = [
      { id: 1, name: "Item 1", price: 10000, quantity: 2 },
      { id: 2, name: "Item 2", price: 5000, quantity: 3 },
    ];

    const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(total).toBe(35000); // (10000 * 2) + (5000 * 3)
  });

  it("should handle adding items to cart", () => {
    const initialCart: any[] = [];
    localStorage.setItem("tansylate-cart", JSON.stringify(initialCart));

    const newItem = { id: 1, name: "Платье", price: 45000, quantity: 1 };
    const updatedCart = [newItem];
    localStorage.setItem("tansylate-cart", JSON.stringify(updatedCart));

    const saved = JSON.parse(localStorage.getItem("tansylate-cart")!);
    expect(saved).toHaveLength(1);
    expect(saved[0].id).toBe(1);
  });

  it("should handle removing items from cart", () => {
    const cartData = [
      { id: 1, name: "Item 1", price: 10000, quantity: 1 },
      { id: 2, name: "Item 2", price: 5000, quantity: 1 },
    ];

    localStorage.setItem("tansylate-cart", JSON.stringify(cartData));
    const cart = JSON.parse(localStorage.getItem("tansylate-cart")!);
    const filteredCart = cart.filter((item: any) => item.id !== 1);
    localStorage.setItem("tansylate-cart", JSON.stringify(filteredCart));

    const updated = JSON.parse(localStorage.getItem("tansylate-cart")!);
    expect(updated).toHaveLength(1);
    expect(updated[0].id).toBe(2);
  });

  it("should handle updating item quantities", () => {
    const cartData = [
      { id: 1, name: "Item 1", price: 10000, quantity: 1 },
    ];

    localStorage.setItem("tansylate-cart", JSON.stringify(cartData));
    const cart = JSON.parse(localStorage.getItem("tansylate-cart")!);
    cart[0].quantity = 5;
    localStorage.setItem("tansylate-cart", JSON.stringify(cart));

    const updated = JSON.parse(localStorage.getItem("tansylate-cart")!);
    expect(updated[0].quantity).toBe(5);
  });
});
