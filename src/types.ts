export interface Product {
  id: string;
  name: string;
  price: number; // in USD base
  unit: string;
  category: string;
  description: string;
  image: string;
  inventory: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface DeliveryDetails {
  name: string;
  phone: string;
  address: string;
  date: string;
  timeSlot: string;
  notes?: string;
}

export interface Order {
  id: string;
  userEmail: string;
  userName: string;
  items: {
    productId: string;
    name: string;
    price: number;
    unit: string;
    quantity: number;
  }[];
  totalAmount: number;
  currency: string;
  currencySymbol: string;
  deliveryDetails: DeliveryDetails;
  status: 'Pending' | 'Processing' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  createdAt: string;
  receiptNumber: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  items: {
    productId: string;
    name: string;
    quantity: number;
  }[];
  isRecurring: boolean;
  recurrenceInterval?: 'Weekly' | 'Biweekly' | 'Monthly';
}

export interface UserProfile {
  email: string;
  name: string;
  phone: string;
  address: string;
}

export interface EmailNotification {
  id: string;
  toEmail: string;
  subject: string;
  body: string;
  sentAt: string;
  type: 'Receipt' | 'StatusUpdate' | 'Welcome' | 'Alert';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
}

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'INR';

export const CURRENCY_MAP: Record<CurrencyCode, { symbol: string; rate: number }> = {
  USD: { symbol: '$', rate: 1.0 },
  EUR: { symbol: '€', rate: 0.92 },
  GBP: { symbol: '£', rate: 0.78 },
  INR: { symbol: '₹', rate: 83.5 },
};
