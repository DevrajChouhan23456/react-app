import { create } from 'zustand';

interface Address {
  id: string;
  label: string;
  line1: string;
  line2?: string;
  area: string;
  city: string;
  pincode: string;
  isDefault: boolean;
}

interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  addresses: Address[];
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  addAddress: (address: Address) => void;
  setDefaultAddress: (id: string) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: 'u1',
    name: 'Devraj Chouhan',
    phone: '+91 98765 43210',
    email: 'devraj@example.com',
    addresses: [
      {
        id: 'addr1',
        label: 'Home',
        line1: '42, Shanti Nagar',
        area: 'MP Nagar',
        city: 'Bhopal',
        pincode: '462011',
        isDefault: true,
      },
    ],
  },
  isLoggedIn: true,
  isLoading: false,

  login: async (phone: string) => {
    set({ isLoading: true });
    await new Promise((r) => setTimeout(r, 1000));
    set({
      isLoading: false,
      isLoggedIn: true,
      user: {
        id: 'u1',
        name: 'Customer',
        phone,
        addresses: [],
      },
    });
  },

  logout: () => set({ user: null, isLoggedIn: false }),

  updateUser: (data) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...data } : null,
    })),

  addAddress: (address) =>
    set((state) => ({
      user: state.user
        ? { ...state.user, addresses: [...state.user.addresses, address] }
        : null,
    })),

  setDefaultAddress: (id) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            addresses: state.user.addresses.map((a) => ({
              ...a,
              isDefault: a.id === id,
            })),
          }
        : null,
    })),
}));
