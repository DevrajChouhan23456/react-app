import { create } from 'zustand';

export interface Addon {
  id: string;
  name: string;
  price: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  selectedAddons: Addon[];
}

interface CartState {
  items: CartItem[];
  coupon: string | null;
  discount: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  getSubtotal: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const DELIVERY_FEE = 30;
const TAX_RATE = 0.05;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  coupon: null,
  discount: 0,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, quantity: 1 }] };
    }),

  removeItem: (id) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

  updateQuantity: (id, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.id !== id) };
      }
      return {
        items: state.items.map((i) =>
          i.id === id ? { ...i, quantity } : i
        ),
      };
    }),

  clearCart: () => set({ items: [], coupon: null, discount: 0 }),

  applyCoupon: (code, discount) => set({ coupon: code, discount }),

  removeCoupon: () => set({ coupon: null, discount: 0 }),

  getSubtotal: () => {
    const { items } = get();
    return items.reduce((sum, item) => {
      const addonTotal = item.selectedAddons.reduce((a, b) => a + b.price, 0);
      return sum + (item.price + addonTotal) * item.quantity;
    }, 0);
  },

  getTotal: () => {
    const { getSubtotal, discount } = get();
    const subtotal = getSubtotal();
    const tax = subtotal * TAX_RATE;
    return subtotal + tax + DELIVERY_FEE - discount;
  },

  getItemCount: () => {
    const { items } = get();
    return items.reduce((sum, item) => sum + item.quantity, 0);
  },
}));

export const DELIVERY_FEE_CONST = DELIVERY_FEE;
export const TAX_RATE_CONST = TAX_RATE;
