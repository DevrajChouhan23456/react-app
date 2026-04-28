import {
  doc,
  getDoc,
  collection,
  addDoc,
  updateDoc,
  getDocs,
  serverTimestamp,
  increment,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Coupon {
  id: string;
  code: string;            // e.g. "WELCOME50"
  type: 'flat' | 'percent'; // flat = ₹off, percent = %off
  value: number;           // 50 = ₹50 off OR 20 = 20% off
  minOrder: number;        // minimum order total to use coupon
  maxDiscount?: number;    // cap on percent discount
  usageLimit: number;      // total allowed uses (-1 = unlimited)
  usedCount: number;
  validUntil: string;      // ISO date string
  active: boolean;
}

const COUPONS_COL = 'coupons';

/**
 * Validate and apply a coupon code.
 * Returns discount amount in ₹, or throws an error string.
 */
export async function applyCoupon(code: string, orderTotal: number): Promise<{ coupon: Coupon; discount: number }> {
  const snap = await getDocs(collection(db, COUPONS_COL));
  const match = snap.docs.find(
    (d) => (d.data().code as string).toUpperCase() === code.toUpperCase()
  );

  if (!match) throw new Error('Invalid coupon code');

  const coupon = { ...match.data(), id: match.id } as Coupon;

  if (!coupon.active) throw new Error('This coupon is no longer active');
  if (new Date(coupon.validUntil) < new Date()) throw new Error('This coupon has expired');
  if (coupon.usageLimit !== -1 && coupon.usedCount >= coupon.usageLimit)
    throw new Error('This coupon has reached its usage limit');
  if (orderTotal < coupon.minOrder)
    throw new Error(`Minimum order of ₹${coupon.minOrder} required for this coupon`);

  let discount =
    coupon.type === 'flat'
      ? coupon.value
      : Math.round((orderTotal * coupon.value) / 100);

  if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
  discount = Math.min(discount, orderTotal); // can't discount more than total

  return { coupon, discount };
}

/** Consume a coupon (increment usedCount) after a successful order */
export async function consumeCoupon(couponId: string): Promise<void> {
  await updateDoc(doc(db, COUPONS_COL, couponId), {
    usedCount: increment(1),
  });
}

/** Admin: create a new coupon */
export async function createCoupon(data: Omit<Coupon, 'id' | 'usedCount'>): Promise<string> {
  const ref = await addDoc(collection(db, COUPONS_COL), {
    ...data,
    code: data.code.toUpperCase(),
    usedCount: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

/** Fetch all coupons (for admin panel) */
export async function fetchAllCoupons(): Promise<Coupon[]> {
  const snap = await getDocs(collection(db, COUPONS_COL));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Coupon, 'id'>), id: d.id }));
}
