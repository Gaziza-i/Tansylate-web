/**
 * API service for communicating with Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: string;
  category: string;
  sizes: string;
  composition: string;
  care_instructions: string;
  image: string | null;
  stock: number;
  created_at: string;
}

export interface Customer {
  name: string;
  phone: string;
  email: string;
  address: string;
}

export interface OrderItem {
  product: number;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  customer: Customer;
  items: OrderItem[];
  total_price: number;
}

class DjangoAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Products
  async getProducts(): Promise<{ results: Product[] }> {
    return this.request('/products/');
  }

  async getProduct(id: number): Promise<Product> {
    return this.request(`/products/${id}/`);
  }

  // Orders
  async createOrder(order: Order): Promise<any> {
    // First create customer
    const customerData = {
      name: order.customer.name,
      phone: order.customer.phone,
      email: order.customer.email,
      address: order.customer.address,
    };

    const customerResponse = (await this.request('/customers/', {
      method: 'POST',
      body: JSON.stringify(customerData),
    })) as any;

    // Then create order
    const orderData = {
      customer: customerResponse.id,
      total_price: order.total_price,
      status: 'new',
    };

    const orderResponse = (await this.request('/orders/', {
      method: 'POST',
      body: JSON.stringify(orderData),
    })) as any;

    // Add order items
    for (const item of order.items) {
      await this.request('/order-items/', {
        method: 'POST',
        body: JSON.stringify({
          order: orderResponse.id,
          product: item.product,
          quantity: item.quantity,
          size: item.size,
          price: item.price,
        }),
      });
    }

    return orderResponse;
  }

  // Generate email with Gemini
  async generateEmail(orderId: number): Promise<{ email: string }> {
    return this.request(`/orders/${orderId}/generate_email/`, {
      method: 'POST',
    });
  }
}

export const djangoAPI = new DjangoAPI();
