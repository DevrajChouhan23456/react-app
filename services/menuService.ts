import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export type FoodCategory = 'Dal' | 'Bhaffle' | 'Drinks' | 'Combos' | 'Extras';

export interface Addon {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: FoodCategory;
  image: string;      // download URL from Firebase Storage (or placeholder)
  available: boolean;
  addons: Addon[];    // e.g. [{name:'Extra Ghee', price:10}, {name:'Spicy', price:0}]
  spiceLevel?: 'mild' | 'medium' | 'hot';
  isVeg: boolean;
  createdAt?: string;
  updatedAt?: string;
}

type NewMenuItem = Omit<MenuItem, 'id' | 'createdAt' | 'updatedAt'>;

const MENU_COL = 'menuItems';

/** Fetch all menu items ordered by category */
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const q = query(collection(db, MENU_COL), orderBy('category'), orderBy('name'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<MenuItem, 'id'>),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? '',
    updatedAt: d.data().updatedAt?.toDate?.()?.toISOString?.() ?? '',
  }));
}

/** Add a new menu item */
export async function addMenuItem(item: NewMenuItem): Promise<string> {
  const ref = await addDoc(collection(db, MENU_COL), {
    ...item,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

/** Update an existing menu item (partial update) */
export async function updateMenuItem(
  id: string,
  changes: Partial<Omit<MenuItem, 'id' | 'createdAt'>>
): Promise<void> {
  await updateDoc(doc(db, MENU_COL, id), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

/** Toggle item availability on / off */
export async function toggleItemAvailability(id: string, available: boolean): Promise<void> {
  await updateDoc(doc(db, MENU_COL, id), {
    available,
    updatedAt: serverTimestamp(),
  });
}

/** Delete a menu item permanently */
export async function deleteMenuItem(id: string): Promise<void> {
  await deleteDoc(doc(db, MENU_COL, id));
}
