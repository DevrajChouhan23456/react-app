import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Image, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { MENU_ITEMS } from '@/constants/data';
import { useCartStore } from '@/store/cartStore';
import { Addon } from '@/store/cartStore';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);

  const item = MENU_ITEMS.find((i) => i.id === id);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);

  if (!item) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.notFound}>Item not found</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.find((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  const addonTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
  const totalPrice = (item.price + addonTotal) * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        quantity: 1,
        selectedAddons,
      });
    }
    Alert.alert('Added to Cart!', `${quantity}x ${item.name} added.`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'Go to Cart', onPress: () => router.push('/(tabs)/cart') },
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header Image */}
      <View style={styles.imageWrap}>
        <Image source={{ uri: item.image }} style={styles.image} />
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.text} />
        </TouchableOpacity>
        {item.isBestseller && (
          <View style={styles.bestsellerBadge}>
            <Text style={styles.bestsellerText}>🔥 Bestseller</Text>
          </View>
        )}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.body}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={[styles.vegBox, { borderColor: item.isVeg ? COLORS.success : COLORS.error }]}>
              <View style={[styles.vegDot, { backgroundColor: item.isVeg ? COLORS.success : COLORS.error }]} />
            </View>
            <Text style={styles.name}>{item.name}</Text>
          </View>

          <Text style={styles.desc}>{item.description}</Text>

          {/* Meta */}
          <View style={styles.metaRow}>
            <View style={styles.metaChip}>
              <Ionicons name="star" size={14} color={COLORS.accent} />
              <Text style={styles.metaText}>{item.rating}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="time-outline" size={14} color={COLORS.textMuted} />
              <Text style={styles.metaText}>{item.prepTime}</Text>
            </View>
            <View style={styles.metaChip}>
              <Ionicons name="flame-outline" size={14} color={COLORS.warning} />
              <Text style={styles.metaText}>{item.calories} cal</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>₹{item.price}</Text>
            {item.originalPrice && (
              <Text style={styles.originalPrice}>₹{item.originalPrice}</Text>
            )}
          </View>

          {/* Add-ons */}
          {item.addons.length > 0 && (
            <View style={styles.addonsSection}>
              <Text style={styles.addonsTitle}>Customize your order</Text>
              {item.addons.map((addon) => {
                const isSelected = selectedAddons.some((a) => a.id === addon.id);
                return (
                  <TouchableOpacity
                    key={addon.id}
                    style={[styles.addonRow, isSelected && styles.addonRowSelected]}
                    onPress={() => toggleAddon(addon)}
                  >
                    <View style={[styles.addonCheckbox, isSelected && styles.addonCheckboxSelected]}>
                      {isSelected && <Ionicons name="checkmark" size={12} color={COLORS.white} />}
                    </View>
                    <Text style={styles.addonName}>{addon.name}</Text>
                    <Text style={styles.addonPrice}>+₹{addon.price}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Quantity Selector */}
          <View style={styles.qtySection}>
            <Text style={styles.addonsTitle}>Quantity</Text>
            <View style={styles.qtyRow}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Ionicons name="remove" size={18} color={COLORS.primary} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Ionicons name="add" size={18} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Add to Cart Bar */}
      <View style={styles.addBar}>
        <View>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>₹{totalPrice}</Text>
        </View>
        <TouchableOpacity style={styles.addCartBtn} onPress={handleAddToCart}>
          <Ionicons name="cart-outline" size={18} color={COLORS.white} />
          <Text style={styles.addCartText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  notFound: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  back: { fontSize: 14, color: COLORS.primary, marginTop: SPACING.md },
  imageWrap: { position: 'relative' },
  image: { width: '100%', height: 260, backgroundColor: COLORS.surfaceOffset },
  backBtn: { position: 'absolute', top: 48, left: SPACING.base, width: 40, height: 40, backgroundColor: COLORS.white, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', ...SHADOW.md },
  bestsellerBadge: { position: 'absolute', bottom: SPACING.md, left: SPACING.base, backgroundColor: COLORS.accent, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full },
  bestsellerText: { fontSize: 13, fontWeight: '700', color: COLORS.black },
  scroll: { flex: 1 },
  body: { padding: SPACING.base },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
  vegBox: { width: 18, height: 18, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  vegDot: { width: 10, height: 10, borderRadius: 5 },
  name: { fontSize: 22, fontWeight: '800', color: COLORS.text, flex: 1 },
  desc: { fontSize: 14, color: COLORS.textMuted, lineHeight: 22, marginBottom: SPACING.base },
  metaRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.base },
  metaChip: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: COLORS.surfaceOffset, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  metaText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.base },
  price: { fontSize: 24, fontWeight: '800', color: COLORS.primary },
  originalPrice: { fontSize: 16, color: COLORS.textFaint, textDecorationLine: 'line-through' },
  addonsSection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  addonsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.md },
  addonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  addonRowSelected: { backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.sm },
  addonCheckbox: { width: 22, height: 22, borderRadius: RADIUS.sm, borderWidth: 2, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  addonCheckboxSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  addonName: { flex: 1, fontSize: 14, color: COLORS.text },
  addonPrice: { fontSize: 14, fontWeight: '700', color: COLORS.primary },
  qtySection: { backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.xl },
  qtyBtn: { width: 44, height: 44, borderRadius: RADIUS.md, borderWidth: 2, borderColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  qtyText: { fontSize: 22, fontWeight: '800', color: COLORS.text, minWidth: 32, textAlign: 'center' },
  addBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
  totalLabel: { fontSize: 12, color: COLORS.textMuted },
  totalPrice: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  addCartBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  addCartText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
