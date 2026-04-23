import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import PaymentMethodSelector, { PaymentMethod } from '@/components/PaymentMethodSelector';
import RazorpayWebView from '@/components/RazorpayWebView';
import { useRazorpay } from '@/hooks/useRazorpay';

const DELIVERY_FEE = 30;
const TAX_RATE = 0.05;

export default function CheckoutScreen() {
  const router = useRouter();
  const { items, getSubtotal, getTotal, discount, coupon, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const { placeOrder } = useOrderStore();
  const razorpay = useRazorpay();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cod');
  const [loading, setLoading] = useState(false);

  const defaultAddress = user?.addresses?.find((a: any) => a.isDefault) || user?.addresses?.[0];
  const subtotal = getSubtotal();
  const tax = Math.round(subtotal * TAX_RATE);
  const total = Math.round(getTotal());

  const isProcessing = loading ||
    razorpay.status === 'creating_order' ||
    razorpay.status === 'verifying';

  const getButtonLabel = () => {
    if (razorpay.status === 'creating_order') return 'Creating order...';
    if (razorpay.status === 'verifying') return 'Verifying payment...';
    if (loading) return 'Placing order...';
    return paymentMethod === 'cod' ? 'Place Order (COD)' : `Pay ₹${total} Online`;
  };

  const finalizeOrder = (paymentId?: string) => {
    placeOrder({
      items: items.map((i: any) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
        addons: i.selectedAddons,
      })),
      status: 'placed',
      total,
      address: defaultAddress
        ? `${defaultAddress.line1}, ${defaultAddress.area}, ${defaultAddress.city}`
        : 'Bhopal, MP',
      paymentMethod,
      estimatedTime: '30-40 min',
    });
    clearCart();
    setLoading(false);
    router.replace('/order-tracking');
  };

  const handlePlaceOrder = async () => {
    if (paymentMethod === 'cod') {
      setLoading(true);
      await new Promise((r) => setTimeout(r, 1200));
      finalizeOrder();
    } else {
      await razorpay.initiatePayment({
        appOrderId: 'ORD-' + Date.now(),
        amount: total,
        customerName: user?.name || 'Customer',
        customerPhone: user?.phone || '9999999999',
        customerEmail: user?.email || '',
        description: `Dal Bafla — ${items.length} item${items.length > 1 ? 's' : ''}`,
      });
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
                    {defaultAddress.city} — {defaultAddress.pincode}
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

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.card}>
            {items.map((item: any) => (
              <View key={item.id} style={styles.orderItem}>
                <Text style={styles.orderItemQty}>{item.quantity}×</Text>
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
            {[
              { key: 'Subtotal', val: `₹${subtotal}` },
              { key: 'GST (5%)', val: `₹${tax}` },
              { key: 'Delivery Fee', val: `₹${DELIVERY_FEE}` },
              ...(discount > 0 ? [{ key: `Coupon (${coupon})`, val: `-₹${discount}`, green: true }] : []),
            ].map((row: any) => (
              <View key={row.key} style={styles.billRow}>
                <Text style={[styles.billKey, row.green && { color: COLORS.success }]}>{row.key}</Text>
                <Text style={[styles.billVal, row.green && { color: COLORS.success }]}>{row.val}</Text>
              </View>
            ))}
            <View style={styles.divider} />
            <View style={styles.billRow}>
              <Text style={styles.totalKey}>Total Payable</Text>
              <Text style={styles.totalVal}>₹{total}</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerTotal}>₹{total}</Text>
          <Text style={styles.footerLabel}>Total Payable</Text>
        </View>
        <TouchableOpacity
          style={[styles.placeBtn, isProcessing && styles.btnDisabled]}
          onPress={handlePlaceOrder}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Ionicons
                name={paymentMethod === 'cod' ? 'checkmark-circle' : 'card'}
                size={18}
                color={COLORS.white}
              />
              <Text style={styles.placeBtnText}>{getButtonLabel()}</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Razorpay WebView Modal */}
      {razorpay.webViewVisible && razorpay.razorpayOrderId && (
        <RazorpayWebView
          visible={razorpay.webViewVisible}
          orderId={razorpay.razorpayOrderId}
          amount={razorpay.amountPaise}
          customerName={razorpay.pendingOptions?.customerName || ''}
          customerPhone={razorpay.pendingOptions?.customerPhone || ''}
          customerEmail={razorpay.pendingOptions?.customerEmail || ''}
          description={razorpay.pendingOptions?.description}
          onSuccess={(pid, oid, sig) =>
            razorpay.handlePaymentSuccess(pid, oid, sig, finalizeOrder)
          }
          onFailure={razorpay.handlePaymentFailure}
          onDismiss={razorpay.dismissWebView}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.base },
  sectionTitle: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.6 },
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
  orderItemQty: { fontSize: 14, fontWeight: '700', color: COLORS.primary, width: 28 },
  orderItemName: { flex: 1, fontSize: 14, color: COLORS.text },
  orderItemPrice: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: SPACING.sm },
  billKey: { fontSize: 13, color: COLORS.textMuted },
  billVal: { fontSize: 13, fontWeight: '600', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  totalKey: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  totalVal: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.white, padding: SPACING.base, paddingBottom: SPACING.lg, borderTopWidth: 1, borderTopColor: COLORS.border },
  footerTotal: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  footerLabel: { fontSize: 12, color: COLORS.textMuted },
  placeBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  btnDisabled: { opacity: 0.6 },
  placeBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
