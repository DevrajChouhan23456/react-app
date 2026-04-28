import { create } from 'zustand';
import {
  MenuItem,
  NewMenuItem,
  fetchMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleItemAvailability,
  FoodCategory,
} from '@/services/menuService';

type NewMenuItem = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;

interface MenuState {
  items: MenuItem[];
  loading: boolean;
  error: string | null;

  fetchItems: () => Promise<void>;
  addItem: (item: NewMenuItem) => Promise<void>;
  updateItem: (id: string, changes: Partial<MenuItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleAvailability: (id: string, available: boolean) => Promise<void>;
  getByCategory: (category: FoodCategory) => MenuItem[];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  fetchItems: async () => {
    set({ loading: true, error: null });
    try {
      const items = await fetchMenuItems();
      set({ items, loading: false });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  addItem: async (item) => {
    set({ loading: true });
    try {
      const id = await addMenuItem(item);
      const newItem: MenuItem = { ...item, id, createdAt: new Date().toISOString() };
      set((s) => ({ items: [...s.items, newItem], loading: false }));
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateItem: async (id, changes) => {
    await updateMenuItem(id, changes);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, ...changes } : i)),
    }));
  },

  deleteItem: async (id) => {
    await deleteMenuItem(id);
    set((s) => ({ items: s.items.filter((i) => i.id !== id) }));
  },

  toggleAvailability: async (id, available) => {
    await toggleItemAvailability(id, available);
    set((s) => ({
      items: s.items.map((i) => (i.id === id ? { ...i, available } : i)),
    }));
  },

  getByCategory: (category) =>
    get().items.filter((i) => i.category === category),
}));
