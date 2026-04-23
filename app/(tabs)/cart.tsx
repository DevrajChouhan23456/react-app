import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useCartStore, DELIVERY_FEE_CONST, TAX_RATE_CONST } from '@/store/cartStore';
import CartItem from '@/components/CartItem';
import { COUPONS } from '@/constants/data';

export default function CartScreen() {
  const router = useRouter();
  const { items, coupon, discount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState('');

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * TAX_RATE_CONST);
  const total = getTotal();

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code] !== undefined) {
      applyCoupon(code, COUPONS[code]);
      setCouponInput('');
      Alert.alert('Coupon Applied!', `Saved ₹${COUPONS[code]} on your order.`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code.');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Add some delicious Dal Bafla to get started!</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>🛒 Your Cart</Text>
        <Text style={styles.subtitle}>{items.length} item{items.length > 1 ? 's' : ''}</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        <View style={styles.section}>
          {items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </View>

        {/* Coupon */}
        <View style={styles.couponSection}>
          <Text style={styles.couponLabel}>🏷️ Apply Coupon</Text>
          {coupon ? (
            <View style={styles.appliedRow}>
              <View style={styles.appliedChip}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                <Text style={styles.appliedCode}>{coupon} — ₹{discount} saved</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon}>
                <Text style={styles.removeText}>Remove</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.couponRow}>
              <TextInput
                style={styles.couponInput}
                placeholder="Enter code (e.g. FIRST50)"
                placeholderTextColor={COLORS.textFaint}
                value={couponInput}
                onChangeText={setCouponInput}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon}>
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <Text style={styles.billTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Subtotal</Text>
            <Text style={styles.billVal}>₹{subtotal}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>GST (5%)</Text>
            <Text style={styles.billVal}>₹{tax}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billKey}>Delivery Fee</Text>
            <Text style={styles.billVal}>₹{DELIVERY_FEE_CONST}</Text>
          </View>
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billKey, { color: COLORS.success }]}>Coupon Discount</Text>
              <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalKey}>Total</Text>
            <Text style={styles.totalVal}>₹{Math.round(total)}</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Checkout Button */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>₹{Math.round(total)}</Text>
          <Text style={styles.checkoutLabel}>Total Amount</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => router.push('/checkout')}
        >
          <Text style={styles.checkoutBtnText}>Proceed to Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  section: { padding: SPACING.base },
  couponSection: { marginHorizontal: SPACING.base, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  couponLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text, marginBottom: SPACING.sm },
  couponRow: { flexDirection: 'row', gap: SPACING.sm },
  couponInput: { flex: 1, backgroundColor: COLORS.surfaceOffset, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, justifyContent: 'center' },
  applyBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  appliedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appliedChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appliedCode: { fontSize: 13, fontWeight: '600', color: COLORS.success },
  removeText: { fontSize: 13, color: COLORS.error, fontWeight: '700' },
  billCard: { marginHorizontal: SPACING.base, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  billTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  billKey: { fontSize: 13, color: COLORS.textMuted },
  billVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalKey: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  checkoutBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
  checkoutTotal: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  checkoutLabel: { fontSize: 12, color: COLORS.textMuted },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  checkoutBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIcon: { fontSize: 72, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.full },
  browseBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
