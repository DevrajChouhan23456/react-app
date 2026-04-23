import { Order } from '@/store/orderStore';

export interface PlaceOrderPayload {
  items: { id: string; quantity: number; addonIds: string[] }[];
  addressId: string;
  paymentMethod: 'cod' | 'online';
  couponCode?: string;
}

// Mock service — replace with real API calls when backend is ready
export const orderService = {
  placeOrder: async (payload: PlaceOrderPayload): Promise<{ orderId: string; estimatedTime: string }> => {
    await new Promise((r) => setTimeout(r, 1500));
    return {
      orderId: 'ORD-' + Date.now(),
      estimatedTime: '30-40 min',
    };
  },

  getOrderById: async (id: string): Promise<Order | null> => {
    await new Promise((r) => setTimeout(r, 300));
    return null; // Will fetch from backend
  },

  getOrderHistory: async (userId: string): Promise<Order[]> => {
    await new Promise((r) => setTimeout(r, 400));
    return [];
  },

  cancelOrder: async (orderId: string): Promise<boolean> => {
    await new Promise((r) => setTimeout(r, 500));
    return true;
  },
};
