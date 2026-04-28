import { create } from 'zustand';
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// ── Types ──────────────────────────────────────────────────────────────────────
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
  id: string;            // Firestore doc ID
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
  createdAt: string;     // ISO string (converted from Firestore Timestamp)
  updatedAt?: string;
}

type PlaceOrderPayload = Omit<Order, 'id' | 'createdAt' | 'updatedAt'>;

interface OrderState {
  orders: Order[];
  activeOrder: Order | null;
  loading: boolean;
  error: string | null;
  // Real-time listener unsubscribe fn
  _unsubscribe: Unsubscribe | null;

  // Actions
  placeOrder: (payload: PlaceOrderPayload) => Promise<Order>;
  fetchOrders: (userId: string) => Promise<void>;
  subscribeToActiveOrder: (orderId: string) => void;
  unsubscribeActiveOrder: () => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  setActiveOrder: (order: Order | null) => void;
  reorderItems: (order: Order) => OrderItem[];
  clearError: () => void;
}

// ── Firestore collection ref ───────────────────────────────────────────────────
const ORDERS_COL = 'orders';

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  activeOrder: null,
  loading: false,
  error: null,
  _unsubscribe: null,

  // ── Place order → write to Firestore ─────────────────────────────────────────
  placeOrder: async (payload) => {
    set({ loading: true, error: null });
    try {
      const docRef = await addDoc(collection(db, ORDERS_COL), {
        ...payload,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const order: Order = {
        ...payload,
        id: docRef.id,
        createdAt: new Date().toISOString(),
      };

      set((s) => ({
        orders: [order, ...s.orders],
        activeOrder: order,
        loading: false,
      }));

      return order;
    } catch (err: any) {
      console.error('placeOrder error:', err);
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  // ── Fetch all orders for a user (one-shot) ────────────────────────────────────
  fetchOrders: async (userId) => {
    set({ loading: true, error: null });
    try {
      const q = query(
        collection(db, ORDERS_COL),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snap = await getDocs(q);
      const orders: Order[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          ...data,
          id: d.id,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() ||
            new Date().toISOString(),
        } as Order;
      });
      set({ orders, loading: false });
    } catch (err: any) {
      console.error('fetchOrders error:', err);
      set({ error: err.message, loading: false });
    }
  },

  // ── Real-time listener on a single order (for tracking screen) ─────────────────
  subscribeToActiveOrder: (orderId) => {
    const { _unsubscribe } = get();
    if (_unsubscribe) _unsubscribe(); // clean up previous

    const unsub = onSnapshot(
      doc(db, ORDERS_COL, orderId),
      (snap) => {
        if (!snap.exists()) return;
        const data = snap.data();
        const updated: Order = {
          ...data,
          id: snap.id,
          createdAt:
            data.createdAt?.toDate?.()?.toISOString?.() ||
            new Date().toISOString(),
        } as Order;

        set((s) => ({
          activeOrder: updated,
          orders: s.orders.map((o) => (o.id === updated.id ? updated : o)),
        }));
      },
      (err) => console.error('subscribeToActiveOrder error:', err)
    );

    set({ _unsubscribe: unsub });
  },

  // ── Unsubscribe ───────────────────────────────────────────────────────────────
  unsubscribeActiveOrder: () => {
    const { _unsubscribe } = get();
    if (_unsubscribe) {
      _unsubscribe();
      set({ _unsubscribe: null });
    }
  },

  // ── Update order status in Firestore ─────────────────────────────────────────
  updateOrderStatus: async (orderId, status) => {
    try {
      await updateDoc(doc(db, ORDERS_COL, orderId), {
        status,
        updatedAt: serverTimestamp(),
      });
      // Optimistic local update
      set((s) => ({
        orders: s.orders.map((o) => (o.id === orderId ? { ...o, status } : o)),
        activeOrder:
          s.activeOrder?.id === orderId
            ? { ...s.activeOrder, status }
            : s.activeOrder,
      }));
    } catch (err: any) {
      console.error('updateOrderStatus error:', err);
    }
  },

  setActiveOrder: (order) => set({ activeOrder: order }),

  // ── Reorder helper — returns items list for adding back to cart ───────────────
  reorderItems: (order) => order.items,

  clearError: () => set({ error: null }),
}));
