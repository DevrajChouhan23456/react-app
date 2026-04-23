import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useCartStore, DELIVERY_FEE_CONST, TAX_RATE_CONST } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';
import { useRazorpay } from '@/hooks/useRazorpay';

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, discount, coupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { placeOrder } = useOrderStore();
  const { initiatePayment, status: payStatus } = useRazorpay();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);

  const defaultAddress = user?.addresses.find((a) => a.isDefault) || user?.addresses[0];
  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * TAX_RATE_CONST);
  const total = Math.round(getTotal());

  const isProcessing = loading || ['creating_order', 'processing', 'verifying'].includes(payStatus);

  const getPayButtonLabel = () => {
    if (payStatus === 'creating_order') return 'Creating order...';
    if (payStatus === 'processing') return 'Opening payment...';
    if (payStatus === 'verifying') return 'Verifying payment...';
    if (loading) return 'Placing order...';
    return paymentMethod === 'cod' ? 'Place Order' : `Pay ₹${total}`;
  };

  const handlePlaceOrder = async () => {
    if (!defaultAddress) return;
    setLoading(true);

    const finalizeOrder = (paymentId?: string) => {
      placeOrder({
        items: items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
          addons: i.selectedAddons,
        })),
        status: 'placed',
        total,
        address: `${defaultAddress.line1}, ${defaultAddress.area}, ${defaultAddress.city}`,
        paymentMethod,
        estimatedTime: '30-40 min',
      });
      clearCart();
      setLoading(false);
      router.replace('/order-tracking');
    };

    if (paymentMethod === 'cod') {
      await new Promise((r) => setTimeout(r, 1200));
      finalizeOrder();
    } else {
      setLoading(false);
      await initiatePayment(
        {
          orderId: 'ORD-' + Date.now(),
          amount: total * 100, // paise
          customerName: user?.name || 'Customer',
          customerPhone: user?.phone || '',
          customerEmail: user?.email,
          description: `Dal Bafla Order — ${items.length} item${items.length > 1 ? 's' : ''}`,
        },
        (paymentId) => finalizeOrder(paymentId),
        (err) => console.log('Payment failed:', err)
      );
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.card}>
            {defaultAddress ? (
              <View style={styles.addressRow}>
                <View style={styles.addressIcon}>
                  <Ionicons name="location" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.addressBody}>
                  <Text style={styles.addressLabel}>{defaultAddress.label}</Text>
                  <Text style={styles.addressText}>
                    {defaultAddress.line1}, {defaultAddress.area},{' '}
                    {defaultAddress.city} - {defaultAddress.pincode}
                  </Text>
                </View>
                <TouchableOpacity>
                  <Text style={styles.changeText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.addAddressBtn}>
                <Ionicons name="add-circle-outline" size={20} color={COLORS.primary} />
                <Text style={styles.addAddressText}>Add Delivery Address</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            {items.map((item) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemQty}>{item.quantity}x</Text>
                <Text style={styles.orderItemName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.orderItemPrice}>₹{item.price * item.quantity}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <PaymentMethodSelector
            selected={paymentMethod}
            onChange={setPaymentMethod}
            total={total}
          />
        </View>

        {/* Bill Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bill Details</Text>
          <View style={styles.card}>
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
                <Text style={[styles.billKey, { color: COLORS.success }]}>Coupon ({coupon})</Text>
                <Text style={[styles.billVal, { color: COLORS.success }]}>-₹{discount}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.totalKey}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{total}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order / Pay Button */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>₹{total}</Text>
          <Text style={styles.footerLabel}>Total Payable</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeOrderBtn, isProcessing && styles.btnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name={paymentMethod === 'cod' ? 'checkmark-circle' : 'card'}
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.placeOrderText}>{getPayButtonLabel()}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.base },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, ...SHADOW.sm },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.md },
  addressIcon: { width: 40, height: 40, backgroundColor: COLORS.secondary, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  addressBody: { flex: 1 },
  addressLabel: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  addressText: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, lineHeight: 18 },
  changeText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  addAddressBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, paddingVertical: SPACING.sm },
  addAddressText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  orderItemQty: { fontSize: 14, fontWeight: '700', color: COLORS.primary, width: 30 },
  orderItemName: { flex: 1, fontSize: 14, color: COLORS.text },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  billKey: { fontSize: 13, color: COLORS.textMuted },
  billVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalKey: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border, ...SHADOW.md },
  footerTotal: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  footerLabel: { fontSize: 12, color: COLORS.textMuted },
  placeOrderBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  btnDisabled: { opacity: 0.65 },
  placeOrderText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
});
