import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput,
  TouchableOpacity, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { submitReview } from '@/services/reviewService';
import { useLoyaltyStore } from '@/store/loyaltyStore';

const REVIEW_BONUS_POINTS = 5; // bonus pts for leaving a review

export default function ReviewScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { earnPoints } = useLoyaltyStore();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a star rating'); return; }
    if (!user || !orderId) return;
    setLoading(true);
    try {
      await submitReview({
        orderId,
        userId: user.uid,
        userName: user.displayName ?? user.phoneNumber ?? 'Customer',
        rating,
        comment: comment.trim(),
      });
      // Bonus loyalty points for reviewing
      await earnPoints(user.uid, orderId + '_review', REVIEW_BONUS_POINTS / 0.1);
      Alert.alert('🌟 Thank you!', `You earned ${REVIEW_BONUS_POINTS} bonus points for your review!`, [
        { text: 'Done', onPress: () => router.replace('/(tabs)/orders') },
      ]);
    } catch (err) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Rate your order</Text>
          <View style={{ width: 22 }} />
        </View>

        {/* Illustration */}
        <View style={styles.illustration}>
          <Text style={styles.illustrationEmoji}>🍛</Text>
          <Text style={styles.illustrationText}>How was your Dal Bhaffle experience?</Text>
          <Text style={styles.illustrationSub}>Order #{typeof orderId === 'string' ? orderId.slice(-6).toUpperCase() : ''}</Text>
        </View>

        {/* Star Rating */}
        <View style={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <TouchableOpacity key={star} onPress={() => setRating(star)} activeOpacity={0.7}>
              <Ionicons
                name={star <= rating ? 'star' : 'star-outline'}
                size={44}
                color={star <= rating ? '#F59E0B' : '#d1d5db'}
              />
            </TouchableOpacity>
          ))}
        </View>
        {rating > 0 && (
          <Text style={styles.ratingLabel}>
            {['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Great 😄', 'Excellent 🤩'][rating]}
          </Text>
        )}

        {/* Comment */}
        <View style={styles.commentBox}>
          <Text style={styles.commentLabel}>Add a comment (optional)</Text>
          <TextInput
            style={styles.commentInput}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us what you liked or how we can improve..."
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            maxLength={300}
          />
          <Text style={styles.charCount}>{comment.length}/300</Text>
        </View>

        {/* Bonus banner */}
        <View style={styles.bonusBanner}>
          <Ionicons name="star" size={16} color="#F59E0B" />
          <Text style={styles.bonusText}>Earn {REVIEW_BONUS_POINTS} bonus loyalty points for reviewing!</Text>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, (loading || rating === 0) && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading || rating === 0}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitBtnText}>Submit Review</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  scroll: { padding: 20, paddingBottom: 48 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: '#111827' },
  illustration: { alignItems: 'center', marginBottom: 28 },
  illustrationEmoji: { fontSize: 64, marginBottom: 12 },
  illustrationText: { fontSize: 18, fontWeight: '700', color: '#111827', textAlign: 'center' },
  illustrationSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { textAlign: 'center', fontSize: 16, fontWeight: '700', color: '#0f766e', marginBottom: 20 },
  commentBox: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#e5e7eb' },
  commentLabel: { fontSize: 12, fontWeight: '700', color: '#6b7280', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  commentInput: { fontSize: 14, color: '#111827', minHeight: 90, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#9ca3af', textAlign: 'right', marginTop: 4 },
  bonusBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fef9c3', borderRadius: 10, padding: 10, marginBottom: 16 },
  bonusText: { fontSize: 13, color: '#92400e', fontWeight: '600' },
  submitBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 15, alignItems: 'center' },
  submitBtnDisabled: { opacity: 0.4 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
