import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  userName: string;
  rating: number;       // 1-5
  comment: string;
  createdAt: string;
}

const REVIEWS_COL = 'reviews';

export async function submitReview(
  review: Omit<Review, 'id' | 'createdAt'>
): Promise<string> {
  const ref = await addDoc(collection(db, REVIEWS_COL), {
    ...review,
    createdAt: serverTimestamp(),
  });
  // Mark order as reviewed
  await updateDoc(doc(db, 'orders', review.orderId), { reviewed: true });
  return ref.id;
}

export async function fetchReviews(): Promise<Review[]> {
  const q = query(collection(db, REVIEWS_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Review, 'id'>),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  }));
}

export async function hasReviewed(orderId: string, userId: string): Promise<boolean> {
  const q = query(
    collection(db, REVIEWS_COL),
    where('orderId', '==', orderId),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return !snap.empty;
}
