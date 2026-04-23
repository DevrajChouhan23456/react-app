import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { CartItem as CartItemType, useCartStore } from '@/store/cartStore';

interface Props {
  item: CartItemType;
}

export default function CartItem({ item }: Props) {
  const { updateQuantity, removeItem } = useCartStore();

  const addonTotal = item.selectedAddons.reduce((sum, a) => sum + a.price, 0);
  const itemTotal = (item.price + addonTotal) * item.quantity;

  return (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.image} />
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
        {item.selectedAddons.length > 0 && (
          <Text style={styles.addons}>
            + {item.selectedAddons.map((a) => a.name).join(', ')}
          </Text>
        )}
        <View style={styles.footer}>
          <Text style={styles.price}>₹{itemTotal}</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
            >
              <Ionicons
                name={item.quantity === 1 ? 'trash-outline' : 'remove'}
                size={14}
                color={item.quantity === 1 ? COLORS.error : COLORS.primary}
              />
            </TouchableOpacity>
            <Text style={styles.qty}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
            >
              <Ionicons name="add" size={14} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    alignItems: 'center',
    ...SHADOW.sm,
  },
  image: { width: 70, height: 70, borderRadius: RADIUS.md, backgroundColor: COLORS.surfaceOffset },
  body: { flex: 1, marginLeft: SPACING.md },
  name: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: 2 },
  addons: { fontSize: 11, color: COLORS.textMuted, marginBottom: SPACING.sm },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  price: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  qtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: RADIUS.md,
    overflow: 'hidden',
  },
  qtyBtn: { padding: SPACING.xs + 2, backgroundColor: COLORS.secondary },
  qty: { paddingHorizontal: SPACING.sm, fontSize: 14, fontWeight: '700', color: COLORS.text },
});
