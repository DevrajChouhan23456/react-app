import { create } from 'zustand';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';

// ── Types ───────────────────────────────────────────────────────────────────────
export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  addons: { name: string; price: number }[];
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  status: OrderStatus;
  total: number;
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  coupon: string | null;
  address: string;
  paymentMethod: 'cod' | 'online';
  paymentId?: string;
  estimatedTime: string;
  createdAt: string;
  updatedAt?: string;
}

type PlaceOrderPayload = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  error: string | null;
  _unsubscribe: (() => void) | null;

  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  fetchOrders: (userId: string) => Promise<void>;
  subscribeToActiveOrder: (orderId: string) => void;
  unsubscribeActiveOrder: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
  reorderItems: (order: Order) => OrderItem[];
  clearError: () => void;
}

const ORDERS_COL = 'orders';

function toIso(ts: any): string {
  return ts?.toDate?.()?.toISOString?.() ?? new Date().toISOString();
}

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,
  _unsubscribe: null,

  placeOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const ref = await firestore().collection(ORDERS_COL).add({
        ...payload,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      const order: Order = { ...payload, id: ref.id, createdAt: new Date().toISOString() };
      set((s) => ({ orders: [order, ...s.orders], activeOrder: order, loading: false }));
      return order;
    } catch (err: any) {
      console.error('placeOrder error:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  fetchOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const snap = await firestore()
        .collection(ORDERS_COL)
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      const orders: Order[] = snap.docs.map((d) => ({
        ...(d.data() as Omit<Order, 'id' | 'createdAt'>),
        id: d.id,
        createdAt: toIso(d.data().createdAt),
      }));
      set({ orders, loading: false });
    } catch (err: any) {
      console.error('fetchOrders error:', err);
      set({ error: err.message, loading: false });
    }
  },

  subscribeToActiveOrder: (orderId) => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe();

    const unsub = firestore()
      .collection(ORDERS_COL)
      .doc(orderId)
      .onSnapshot(
        (snap) => {
          if (!snap.exists) return;
          const data = snap.data()!;
          const updated: Order = {
            ...(data as Omit<Order, 'id' | 'createdAt'>),
            id: snap.id,
            createdAt: toIso(data.createdAt),
          };
          set((s) => ({
            activeOrder: updated,
            orders: s.orders.map((o) => (o.id === updated.id ? updated : o)),
          }));
        },
        (err) => console.error('subscribeToActiveOrder error:', err)
      );

    set({ _unsubscribe: unsub });
  },

  unsubscribeActiveOrder: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) { _unsubscribe(); set({ _unsubscribe: null }); }
  },

  updateOrderStatus: async (orderId, status) => {
    try {
      await firestore().collection(ORDERS_COL).doc(orderId).update({
        status,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        activeOrder: s.activeOrder?.id === orderId ? { ...s.activeOrder, status } : s.activeOrder,
      }));
    } catch (err: any) {
      console.error('updateOrderStatus error:', err);
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order }),
  reorderItems: (order) => order.items,
  clearError: () => set({ error: null }),
}));
