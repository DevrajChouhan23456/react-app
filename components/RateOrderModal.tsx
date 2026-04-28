import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { submitReview } from '@/services/reviewService';

interface Props {
  visible: boolean;
  orderId: string;
  userId: string;
  onClose: () => void;
  onSubmitted: () => void;
}

export default function RateOrderModal({ visible, orderId, userId, onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { Alert.alert('Please select a star rating'); return; }
    setLoading(true);
    try {
      await submitReview(orderId, userId, rating, comment);
      onSubmitted();
      onClose();
      setRating(0);
      setComment('');
    } catch (err) {
      Alert.alert('Error', 'Failed to submit review. Please try again.');
    }
    setLoading(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <Text style={styles.title}>Rate Your Order 🍛</Text>
          <Text style={styles.sub}>Order #{orderId.slice(-6).toUpperCase()}</Text>

          {/* Stars */}
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <TouchableOpacity key={s} onPress={() => setRating(s)}>
                <Ionicons
                  name={s <= rating ? 'star' : 'star-outline'}
                  size={36}
                  color={s <= rating ? '#F59E0B' : '#d1d5db'}
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.ratingLabel}>
            {rating === 0 ? 'Tap to rate' : ['', 'Poor 😞', 'Fair 😐', 'Good 😊', 'Great 😄', 'Excellent 🤩'][rating]}
          </Text>

          {/* Comment */}
          <TextInput
            style={styles.input}
            value={comment}
            onChangeText={setComment}
            placeholder="Tell us what you loved (optional)"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={3}
            maxLength={300}
          />

          {/* Buttons */}
          <TouchableOpacity
            style={[styles.submitBtn, loading && styles.btnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Submit Review</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={styles.skipBtn} onPress={onClose}>
            <Text style={styles.skipText}>Maybe Later</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827', textAlign: 'center' },
  sub: { fontSize: 13, color: '#6b7280', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 8 },
  ratingLabel: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 16, height: 20 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb', padding: 12, fontSize: 14, color: '#111827', minHeight: 80, textAlignVertical: 'top', marginBottom: 16 },
  submitBtn: { backgroundColor: '#0f766e', borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginBottom: 8 },
  btnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  skipBtn: { alignItems: 'center', paddingVertical: 8 },
  skipText: { color: '#9ca3af', fontSize: 14 },
});
