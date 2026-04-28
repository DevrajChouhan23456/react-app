import { create } from 'zustand';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  increment,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

// 1 point per ₹10 spent. 10 points = ₹1 discount.
export const POINTS_PER_RUPEE = 0.1;   // earn 1 pt per ₹10
export const RUPEES_PER_POINT = 0.1;   // 10 pts = ₹1
export const MAX_REDEEM_PERCENT = 0.2; // max 20% of order total

export interface LoyaltyTransaction {
  id: string;
  userId: string;
  type: 'earn' | 'redeem';
  points: number;
  orderId: string;
  description: string;
  createdAt: string;
}

interface LoyaltyState {
  points: number;
  transactions: LoyaltyTransaction[];
  loading: boolean;

  fetchPoints: (userId: string) => Promise<void>;
  earnPoints: (userId: string, orderId: string, orderTotal: number) => Promise<void>;
  redeemPoints: (userId: string, orderId: string, pointsToRedeem: number) => Promise<void>;
  maxRedeemable: (orderTotal: number) => number;
  pointsToRupees: (points: number) => number;
}

const LOYALTY_COL = 'loyalty';
const LOYALTY_TXN_COL = 'loyaltyTransactions';

export const useLoyaltyStore = create<LoyaltyState>((set, get) => ({
  points: 0,
  transactions: [],
  loading: false,

  fetchPoints: async (userId) => {
    set({ loading: true });
    try {
      const ref = doc(db, LOYALTY_COL, userId);
      const snap = await getDoc(ref);
      const pts = snap.exists() ? (snap.data().points ?? 0) : 0;

      const q = query(
        collection(db, LOYALTY_TXN_COL),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const txSnap = await getDocs(q);
      const transactions: LoyaltyTransaction[] = txSnap.docs.map((d) => ({
        ...(d.data() as Omit<LoyaltyTransaction, 'id'>),
        id: d.id,
        createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
      }));

      set({ points: pts, transactions, loading: false });
    } catch (err) {
      console.error('fetchPoints error:', err);
      set({ loading: false });
    }
  },

  earnPoints: async (userId, orderId, orderTotal) => {
    const earned = Math.floor(orderTotal * POINTS_PER_RUPEE);
    if (earned <= 0) return;
    try {
      const ref = doc(db, LOYALTY_COL, userId);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        await updateDoc(ref, { points: increment(earned) });
      } else {
        await setDoc(ref, { userId, points: earned });
      }
      await addDoc(collection(db, LOYALTY_TXN_COL), {
        userId,
        type: 'earn',
        points: earned,
        orderId,
        description: `Earned for order #${orderId.slice(-6).toUpperCase()}`,
        createdAt: serverTimestamp(),
      });
      set((s) => ({ points: s.points + earned }));
    } catch (err) {
      console.error('earnPoints error:', err);
    }
  },

  redeemPoints: async (userId, orderId, pointsToRedeem) => {
    if (pointsToRedeem <= 0) return;
    try {
      await updateDoc(doc(db, LOYALTY_COL, userId), {
        points: increment(-pointsToRedeem),
      });
      await addDoc(collection(db, LOYALTY_TXN_COL), {
        userId,
        type: 'redeem',
        points: -pointsToRedeem,
        orderId,
        description: `Redeemed for order #${orderId.slice(-6).toUpperCase()}`,
        createdAt: serverTimestamp(),
      });
      set((s) => ({ points: Math.max(0, s.points - pointsToRedeem) }));
    } catch (err) {
      console.error('redeemPoints error:', err);
    }
  },

  maxRedeemable: (orderTotal) => {
    const { points } = get();
    const maxFromTotal = Math.floor(orderTotal * MAX_REDEEM_PERCENT / RUPEES_PER_POINT);
    return Math.min(points, maxFromTotal);
  },

  pointsToRupees: (points) => +(points * RUPEES_PER_POINT).toFixed(2),
}));
