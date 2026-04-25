import api from '@/services/api';
import { MENU_ITEMS } from '@/constants/data';
import type { Order } from '@/store/orderStore';

export interface PlaceOrderPayload {
  items: { id: string; quantity: number; addonIds: string[] }[];
  addressId: string;
  paymentMethod: 'cod' | 'online';
  couponCode?: string;
}

export const orderService = {
  placeOrder: async (
    payload: PlaceOrderPayload
  ): Promise<{ orderId: string; estimatedTime: string }> => {
    // Map cart items to backend schema
    const backendItems = payload.items.map((item) => {
      const menuItem = MENU_ITEMS.find((m) => m.id === item.id);
      return {
        item_id: item.id,
        name: menuItem?.name ?? 'Item',
        quantity: item.quantity,
        price: menuItem?.price ?? 0,
      };
    });

    try {
      const res = await api.post<{ order_id: string; status: string; total_amount: number }>(
        '/orders',
        {
          user_id: 'demo-user',
          items: backendItems,
          address: payload.addressId,
          payment_method: payload.paymentMethod,
          notes: payload.couponCode ? `Coupon: ${payload.couponCode}` : undefined,
        }
      );
      return { orderId: res.order_id, estimatedTime: '30-40 min' };
    } catch {
      // Backend not running — local mock fallback
      return { orderId: 'ORD-' + Date.now(), estimatedTime: '30-40 min' };
    }
  },

  getOrderById: async (_id: string): Promise<Order | null> => {
    return null;
  },

  getOrderHistory: async (_userId: string): Promise<Order[]> => {
    return [];
  },

  cancelOrder: async (_orderId: string): Promise<boolean> => {
    return true;
  },
};
