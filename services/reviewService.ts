import firestore from '@react-native-firebase/firestore';

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
  await firestore().collection(REVIEWS_COL).doc(orderId).set({
    orderId,
    userId,
    rating,
    comment: comment.trim(),
    createdAt: firestore.FieldValue.serverTimestamp(),
  });
}

/** Fetch all reviews for admin / restaurant dashboard */
export async function fetchAllReviews(): Promise<Review[]> {
  const snap = await firestore()
    .collection(REVIEWS_COL)
    .orderBy('createdAt', 'desc')
    .get();
  return snap.docs.map((d) => ({
    ...(d.data() as Omit<Review, 'id' | 'createdAt'>),
    id: d.id,
    createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() ?? new Date().toISOString(),
  }));
}
