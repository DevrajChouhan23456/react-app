import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where,
  updateDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export type DiscountType = 'percent' | 'flat';

export interface Coupon {
  id: string;              // coupon code (e.g. WELCOME50)
  description: string;
  discountType: DiscountType;
  discountValue: number;   // 50 → 50% off  OR  ₹50 flat
  minOrderValue: number;
  maxDiscount: number;     // cap for percent discounts
  usageLimit: number;      // total uses allowed
  usedCount: number;
  validUntil: string;      // ISO date string
  active: boolean;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
  description: string;
}

const COUPONS_COL = 'coupons';

/** Validate and return discount amount for an order total */
export async function validateCoupon(
  code: string,
  orderTotal: number
): Promise<AppliedCoupon> {
  const upper = code.trim().toUpperCase();
  const ref = doc(db, COUPONS_COL, upper);
  const snap = await getDoc(ref);

  if (!snap.exists()) throw new Error('Invalid coupon code.');

  const coupon = snap.data() as Omit<Coupon, 'id'>;

  if (!coupon.active) throw new Error('This coupon is no longer active.');
  if (coupon.usedCount >= coupon.usageLimit) throw new Error('This coupon has expired (usage limit reached).');
  if (new Date(coupon.validUntil) < new Date()) throw new Error('This coupon has expired.');
  if (orderTotal < coupon.minOrderValue)
    throw new Error(`Minimum order value of ₹${coupon.minOrderValue} required.`);

  let discountAmount =
    coupon.discountType === 'percent'
      ? Math.min((orderTotal * coupon.discountValue) / 100, coupon.maxDiscount)
      : coupon.discountValue;

  discountAmount = Math.min(discountAmount, orderTotal); // never exceed order total

  return { code: upper, discountAmount: Math.floor(discountAmount), description: coupon.description };
}

/** Increment usedCount after successful order placement */
export async function redeemCoupon(code: string): Promise<void> {
  await updateDoc(doc(db, COUPONS_COL, code.toUpperCase()), {
    usedCount: increment(1),
  });
}
