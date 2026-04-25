import { MENU_ITEMS, MENU_CATEGORIES } from '@/constants/data';
import api from '@/services/api';

type BackendMenuItem = {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string | null;
  category?: string | null;
  available?: boolean;
};

function mapBackendItem(item: BackendMenuItem) {
  // Merge backend item with local defaults so UI always has full data
  const local = MENU_ITEMS.find((m) => m.id === item.id);
  return {
    ...local,
    ...item,
    category: item.category || local?.category || 'Dal Bafla',
    image: item.image || local?.image,
    rating: local?.rating ?? 4.5,
    prepTime: local?.prepTime ?? '20 min',
    isVeg: local?.isVeg ?? true,
    isBestseller: local?.isBestseller ?? false,
    addons: local?.addons ?? [],
    calories: local?.calories ?? 0,
    originalPrice: local?.originalPrice ?? item.price,
  };
}

export const menuService = {
  getCategories: async () => {
    return MENU_CATEGORIES;
  },

  getItems: async (category?: string) => {
    try {
      const items = (await api.get<BackendMenuItem[]>('/menu')).map(mapBackendItem);
      if (!category || category === 'All') return items;
      return items.filter((item) => item.category === category);
    } catch {
      // Backend not running — fall back to local mock
      if (!category || category === 'All') return MENU_ITEMS;
      return MENU_ITEMS.filter((item) => item.category === category);
    }
  },

  getItemById: async (id: string) => {
    try {
      const item = await api.get<BackendMenuItem>(`/menu/${id}`);
      return mapBackendItem(item);
    } catch {
      return MENU_ITEMS.find((item) => item.id === id) || null;
    }
  },

  getBestsellers: async () => {
    try {
      const items = (await api.get<BackendMenuItem[]>('/menu')).map(mapBackendItem);
      return items.filter((item) => item.isBestseller);
    } catch {
      return MENU_ITEMS.filter((item) => item.isBestseller);
    }
  },
};
