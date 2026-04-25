import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW, TYPOGRAPHY } from '@/constants/theme';
import { useCartStore, DELIVERY_FEE_CONST, TAX_RATE_CONST } from '@/store/cartStore';
import CartItem from '@/components/CartItem';
import { COUPONS } from '@/constants/data';

export default function CartScreen() {
  const router = useRouter();
  const { items, coupon, discount, applyCoupon, removeCoupon, getSubtotal, getTotal } = useCartStore();
  const [couponInput, setCouponInput] = useState('');
  const emptyBounce = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const fadeIn = useRef(new Animated.Value(0)).current;

  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * TAX_RATE_CONST);
  const total = getTotal();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, useNativeDriver: true, tension: 80, friction: 12 }),
    ]).start();
    if (items.length === 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(emptyBounce, { toValue: -12, duration: 700, useNativeDriver: true }),
          Animated.timing(emptyBounce, { toValue: 0, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [items.length]);

  const handleApplyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (COUPONS[code] !== undefined) {
      applyCoupon(code, COUPONS[code]);
      setCouponInput('');
      Alert.alert('🎉 Coupon Applied!', `You saved ₹${COUPONS[code]} on your order.`);
    } else {
      Alert.alert('Invalid Coupon', 'Please enter a valid coupon code.');
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safe}>
        <Animated.View style={[styles.emptyState, { opacity: fadeIn }]}>
          <Animated.Text style={[styles.emptyIcon, { transform: [{ translateY: emptyBounce }] }]}>🛒</Animated.Text>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyDesc}>Add some delicious Dal Bafla to get started!</Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/menu')} activeOpacity={0.85}>
            <Ionicons name="restaurant" size={18} color={COLORS.white} />
            <Text style={styles.browseBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.View style={[styles.header, { opacity: fadeIn }]}>
        <View>
          <Text style={styles.title}>Your Cart</Text>
          <Text style={styles.subtitle}>{items.length} item{items.length > 1 ? 's' : ''} added</Text>
        </View>
        <View style={styles.itemCountBadge}>
          <Text style={styles.itemCountText}>{items.length}</Text>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        style={[styles.scroll, { opacity: fadeIn, transform: [{ translateY: slideUp }] }]}
      >
        {/* Items */}
        <View style={styles.section}>
          {items.map((item) => <CartItem key={item.id} item={item} />)}
        </View>

        {/* Coupon */}
        <View style={styles.couponSection}>
          <View style={styles.couponHeader}>
            <Ionicons name="pricetag" size={16} color={COLORS.primary} />
            <Text style={styles.couponLabel}>Apply Coupon</Text>
          </View>
          {coupon ? (
            <View style={styles.appliedRow}>
              <View style={styles.appliedChip}>
                <Ionicons name="checkmark-circle" size={18} color={COLORS.success} />
                <Text style={styles.appliedCode}>{coupon} — ₹{discount} saved!</Text>
              </View>
              <TouchableOpacity onPress={removeCoupon} style={styles.removeBtn}>
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
              <TouchableOpacity style={styles.applyBtn} onPress={handleApplyCoupon} activeOpacity={0.85}>
                <Text style={styles.applyBtnText}>APPLY</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Bill Summary */}
        <View style={styles.billCard}>
          <View style={styles.billHeader}>
            <Ionicons name="receipt" size={16} color={COLORS.primary} />
            <Text style={styles.billTitle}>Bill Summary</Text>
          </View>
          {[
            { label: 'Subtotal', val: `₹${subtotal}` },
            { label: 'GST (5%)', val: `₹${tax}` },
            { label: 'Delivery Fee', val: `₹${DELIVERY_FEE_CONST}` },
          ].map((row) => (
            <View key={row.label} style={styles.billRow}>
              <Text style={styles.billKey}>{row.label}</Text>
              <Text style={styles.billVal}>{row.val}</Text>
            </View>
          ))}
          {discount > 0 && (
            <View style={styles.billRow}>
              <Text style={[styles.billKey, { color: COLORS.success }]}>🎉 Coupon Discount</Text>
              <Text style={[styles.billVal, { color: COLORS.success, fontWeight: '800' }]}>-₹{discount}</Text>
            </View>
          )}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalKey}>Total Payable</Text>
            <Text style={styles.totalVal}>₹{Math.round(total)}</Text>
          </View>
        </View>

        <View style={{ height: 110 }} />
      </Animated.ScrollView>

      {/* Checkout Bar */}
      <View style={styles.checkoutBar}>
        <View>
          <Text style={styles.checkoutTotal}>₹{Math.round(total)}</Text>
          <Text style={styles.checkoutLabel}>Total amount</Text>
        </View>
        <TouchableOpacity style={styles.checkoutBtn} onPress={() => router.push('/checkout')} activeOpacity={0.88}>
          <Text style={styles.checkoutBtnText}>Checkout</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  itemCountBadge: { width: 40, height: 40, backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center' },
  itemCountText: { ...TYPOGRAPHY.h4, color: COLORS.primary },
  scroll: { flex: 1 },
  section: { padding: SPACING.base, paddingBottom: 0 },

  couponSection: { marginHorizontal: SPACING.base, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.md, borderWidth: 1.5, borderColor: COLORS.borderWarm, ...SHADOW.sm },
  couponHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  couponLabel: { fontSize: 14, fontWeight: '800', color: COLORS.text },
  couponRow: { flexDirection: 'row', gap: SPACING.sm },
  couponInput: { flex: 1, backgroundColor: COLORS.surfaceOffset, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, fontSize: 14, color: COLORS.text, fontWeight: '600' },
  applyBtn: { backgroundColor: COLORS.primary, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.lg, justifyContent: 'center', ...SHADOW.sm },
  applyBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
  appliedRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  appliedChip: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  appliedCode: { fontSize: 13, fontWeight: '700', color: COLORS.success },
  removeBtn: { backgroundColor: COLORS.errorLight, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.md },
  removeText: { fontSize: 12, color: COLORS.error, fontWeight: '800' },

  billCard: { marginHorizontal: SPACING.base, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, padding: SPACING.base, marginBottom: SPACING.base, borderWidth: 1.5, borderColor: COLORS.borderWarm, ...SHADOW.sm },
  billHeader: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
  billTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.md },
  billKey: { fontSize: 13, color: COLORS.textMuted, fontWeight: '500' },
  billVal: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.borderWarm, marginVertical: SPACING.sm },
  totalKey: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: 15, fontWeight: '900', color: COLORS.primary },

  checkoutBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.lg, borderTopWidth: 0, ...SHADOW.lg },
  checkoutTotal: { ...TYPOGRAPHY.h2, color: COLORS.text },
  checkoutLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  checkoutBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.xl, ...SHADOW.md },
  checkoutBtnText: { color: COLORS.white, fontWeight: '900', fontSize: 16, letterSpacing: -0.2 },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: SPACING.xxl },
  emptyIcon: { fontSize: 80, marginBottom: SPACING.xl },
  emptyTitle: { ...TYPOGRAPHY.h2, color: COLORS.text, marginBottom: SPACING.sm, textAlign: 'center' },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', marginBottom: SPACING.xl, lineHeight: 22 },
  browseBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xxl, paddingVertical: SPACING.md, borderRadius: RADIUS.full, ...SHADOW.md },
  browseBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
