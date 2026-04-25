import React, { useRef } from 'react';
import {
  View, Text, Image, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW, TYPOGRAPHY } from '@/constants/theme';

interface FoodCardProps {
  item: {
    id: string;
    name: string;
    description: string;
    price: number;
    originalPrice?: number;
    image: string;
    rating: number;
    prepTime: string;
    isVeg: boolean;
    isBestseller: boolean;
  };
  onPress: () => void;
  onAdd: () => void;
}

export default function FoodCard({ item, onPress, onAdd }: FoodCardProps) {
  const discount = item.originalPrice
    ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    : 0;

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const addBounce = useRef(new Animated.Value(1)).current;

  const onPressIn = () => Animated.spring(scaleAnim, { toValue: 0.97, useNativeDriver: true, tension: 400 }).start();
  const onPressOut = () => Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, tension: 400 }).start();

  const handleAdd = () => {
    Animated.sequence([
      Animated.spring(addBounce, { toValue: 1.3, useNativeDriver: true, tension: 400 }),
      Animated.spring(addBounce, { toValue: 1, useNativeDriver: true, tension: 300 }),
    ]).start();
    onAdd();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: item.image }} style={styles.image} />
          {/* Gradient overlay feel via semi-transparent bottom bar */}
          <View style={styles.imageOverlay} />

          {item.isBestseller && (
            <View style={styles.bestsellerBadge}>
              <Ionicons name="flame" size={10} color="#FF6B00" />
              <Text style={styles.bestsellerText}>Bestseller</Text>
            </View>
          )}
          {discount > 0 && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{discount}% OFF</Text>
            </View>
          )}
        </View>

        <View style={styles.body}>
          <View style={styles.topRow}>
            <View style={[styles.vegIndicator, { borderColor: item.isVeg ? COLORS.success : COLORS.error }]}>
              <View style={[styles.vegDot, { backgroundColor: item.isVeg ? COLORS.success : COLORS.error }]} />
            </View>
            <View style={styles.ratingChip}>
              <Ionicons name="star" size={10} color={COLORS.accent} />
              <Text style={styles.ratingText}>{item.rating}</Text>
            </View>
            <View style={styles.prepChip}>
              <Ionicons name="time-outline" size={10} color={COLORS.textMuted} />
              <Text style={styles.prepText}>{item.prepTime}</Text>
            </View>
          </View>

          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.desc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.footer}>
            <View>
              <Text style={styles.price}>₹{item.price}</Text>
              {item.originalPrice && (
                <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
              )}
            </View>

            <TouchableOpacity onPress={handleAdd} activeOpacity={0.85}>
              <Animated.View style={[styles.addBtn, { transform: [{ scale: addBounce }] }]}>
                <Ionicons name="add" size={22} color={COLORS.white} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderWarm,
    ...SHADOW.md,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 170, backgroundColor: COLORS.surfaceOffset },
  imageOverlay: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: 'rgba(0,0,0,0.0)' },

  bestsellerBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.accent,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOW.sm,
  },
  bestsellerText: { fontSize: 11, fontWeight: '800', color: COLORS.black },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    ...SHADOW.sm,
  },
  discountText: { fontSize: 11, fontWeight: '900', color: COLORS.white, letterSpacing: 0.3 },

  body: { padding: SPACING.base },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  vegIndicator: { width: 16, height: 16, borderWidth: 1.5, borderRadius: 3, alignItems: 'center', justifyContent: 'center' },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  ratingChip: { flexDirection: 'row', alignItems: 'center', gap: 2, backgroundColor: 'rgba(255,184,0,0.12)', paddingHorizontal: 6, paddingVertical: 3, borderRadius: RADIUS.full },
  ratingText: { fontSize: 11, fontWeight: '700', color: '#B8860B' },
  prepChip: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: COLORS.surfaceOffset, paddingHorizontal: 6, paddingVertical: 3, borderRadius: RADIUS.full },
  prepText: { fontSize: 11, fontWeight: '600', color: COLORS.textMuted },

  name: { ...TYPOGRAPHY.h4, color: COLORS.text, marginBottom: 4 },
  desc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 18, marginBottom: SPACING.md },

  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { ...TYPOGRAPHY.price, color: COLORS.primary },
  originalPrice: { fontSize: 12, color: COLORS.textFaint, textDecorationLine: 'line-through', marginTop: 1 },

  addBtn: {
    backgroundColor: COLORS.primary,
    width: 40,
    height: 40,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
});
