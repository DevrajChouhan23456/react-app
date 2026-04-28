import {
  doc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/services/firebase';

export interface Review {
  id: string;
  orderId: string;
  userId: string;
  rating: number;      // 1-5
  comment: string;
  createdAt: string;
}

const REVIEWS_COL = 'reviews';

/** Submit a review — one review per order (uses orderId as doc ID) */
export async function submitReview(
  orderId: string,
  userId: string,
  rating: number,
  comment: string
): Promise<void> {
  await setDoc(doc(db, REVIEWS_COL, orderId), {
    orderId,
    userId,
    rating,
    comment: comment.trim(),
    createdAt: serverTimestamp(),
  });
}

/** Fetch all reviews for admin / restaurant dashboard */
export async function fetchAllReviews(): Promise<Review[]> {
  const q = query(collection(db, REVIEWS_COL), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Review, 'id'>),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  }));
}
