import { MENU_ITEMS, MENU_CATEGORIES } from '@/constants/data';

// Mock service — replace with real API calls when backend is ready
export const menuService = {
  getCategories: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return MENU_CATEGORIES;
  },

  getItems: async (category?: string) => {
    await new Promise((r) => setTimeout(r, 400));
    if (!category || category === 'All') return MENU_ITEMS;
    return MENU_ITEMS.filter((item) => item.category === category);
  },

  getItemById: async (id: string) => {
    await new Promise((r) => setTimeout(r, 200));
    return MENU_ITEMS.find((item) => item.id === id) || null;
  },

  getBestsellers: async () => {
    await new Promise((r) => setTimeout(r, 300));
    return MENU_ITEMS.filter((item) => item.isBestseller);
  },
};
