import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

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

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.92}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.image} />
        {item.isBestseller && (
          <View style={styles.bestsellerBadge}>
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
        <View style={styles.row}>
          <View style={[styles.vegIndicator, { borderColor: item.isVeg ? COLORS.success : COLORS.error }]}>
            <View style={[styles.vegDot, { backgroundColor: item.isVeg ? COLORS.success : COLORS.error }]} />
          </View>
          <View style={styles.ratingChip}>
            <Ionicons name="star" size={10} color={COLORS.accent} />
            <Text style={styles.ratingText}>{item.rating}</Text>
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
          <View style={styles.meta}>
            <Ionicons name="time-outline" size={12} color={COLORS.textMuted} />
            <Text style={styles.prepTime}>{item.prepTime}</Text>
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
            <Ionicons name="add" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.base,
    overflow: 'hidden',
    ...SHADOW.sm,
  },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 160, backgroundColor: COLORS.surfaceOffset },
  bestsellerBadge: {
    position: 'absolute',
    bottom: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  bestsellerText: { fontSize: 11, fontWeight: '700', color: COLORS.black },
  discountBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  discountText: { fontSize: 11, fontWeight: '700', color: COLORS.white },
  body: { padding: SPACING.base },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.xs },
  vegIndicator: {
    width: 16,
    height: 16,
    borderWidth: 1.5,
    borderRadius: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vegDot: { width: 8, height: 8, borderRadius: 4 },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.surfaceOffset,
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: RADIUS.full,
  },
  ratingText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  name: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  desc: { fontSize: 12, color: COLORS.textMuted, lineHeight: 16, marginBottom: SPACING.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  originalPrice: { fontSize: 12, color: COLORS.textFaint, textDecorationLine: 'line-through' },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  prepTime: { fontSize: 12, color: COLORS.textMuted },
  addBtn: {
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
