import { create } from 'zustand';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addons: { name: string; price: number }[];
}

export interface Order {
  id: string;
  items: OrderItem[];
  status: 'placed' | 'accepted' | 'preparing' | 'out_for_delivery' | 'delivered' | 'cancelled';
  total: number;
  address: string;
  paymentMethod: 'cod' | 'online';
  createdAt: string;
  estimatedTime: string;
}

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  placeOrder: (order: Omit<Order, 'id' | 'createdAt'>) => Order;
  updateOrderStatus: (id: string, status: Order['status']) => void;
  setActiveOrder: (order: Order | null) => void;
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,

  placeOrder: (orderData) => {
    const order: Order = {
      ...orderData,
      id: 'ORD-' + Date.now(),
      createdAt: new Date().toISOString(),
    };
    set((state) => ({
      orders: [order, ...state.orders],
      activeOrder: order,
    }));
    return order;
  },

  updateOrderStatus: (id, status) =>
    set((state) => ({
      orders: state.orders.map((o) => (o.id === id ? { ...o, status } : o)),
      activeOrder:
        state.activeOrder?.id === id
          ? { ...state.activeOrder, status }
          : state.activeOrder,
    })),

  setActiveOrder: (order) => set({ activeOrder: order }),
}));
