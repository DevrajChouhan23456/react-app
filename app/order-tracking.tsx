import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import OrderStatusStepper from '@/components/OrderStatusStepper';

const STATUS_SEQUENCE = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'] as const;

export default function OrderTrackingScreen() {
  const router = useRouter();
  const { activeOrder, updateOrderStatus } = useOrderStore();
  const [elapsed, setElapsed] = useState(0);

  // Auto-advance order status for demo
  useEffect(() => {
    if (!activeOrder || activeOrder.status === 'delivered') return;
    const timer = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [activeOrder]);

  useEffect(() => {
    if (!activeOrder) return;
    const currentIdx = STATUS_SEQUENCE.indexOf(activeOrder.status as any);
    if (currentIdx < STATUS_SEQUENCE.length - 1 && elapsed > 0 && elapsed % 8 === 0) {
      updateOrderStatus(activeOrder.id, STATUS_SEQUENCE[currentIdx + 1]);
    }
  }, [elapsed]);

  if (!activeOrder) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.noOrder}>📦</Text>
          <Text style={styles.noOrderText}>No active order</Text>
          <TouchableOpacity style={styles.menuBtn} onPress={() => router.push('/(tabs)/menu')}>
            <Text style={styles.menuBtnText}>Browse Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const isDelivered = activeOrder.status === 'delivered';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/index')} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerTitle}>
          <Text style={styles.title}>Order Tracking</Text>
          <Text style={styles.orderId}>{activeOrder.id}</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, isDelivered && styles.statusBannerDelivered]}>
          <Text style={styles.statusEmoji}>
            {isDelivered ? '🎉' : '😋'}
          </Text>
          <View>
            <Text style={styles.statusTitle}>
              {isDelivered ? 'Order Delivered!' : 'On the way...'}
            </Text>
            <Text style={styles.statusEta}>
              {isDelivered ? 'Enjoy your meal! ❤️' : `ETA: ${activeOrder.estimatedTime}`}
            </Text>
          </View>
        </View>

        {/* Stepper */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Status</Text>
          <OrderStatusStepper currentStatus={activeOrder.status} />
        </View>

        {/* Delivery Address */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Delivering to</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.addressText}>{activeOrder.address}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Order</Text>
          {activeOrder.items.map((item, idx) => (
            <View key={idx} style={styles.orderItem}>
              <Text style={styles.orderQty}>{item.quantity}x</Text>
              <Text style={styles.orderName} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.orderPrice}>₹{item.price * item.quantity}</Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.orderItem}>
            <Text style={styles.totalKey}>Total Paid</Text>
            <Text style={[styles.orderPrice, { color: COLORS.primary }]}>₹{activeOrder.total}</Text>
          </View>
        </View>

        {/* Payment */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment</Text>
          <View style={styles.paymentRow}>
            <Ionicons
              name={activeOrder.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.paymentText}>
              {activeOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
            </Text>
          </View>
        </View>

        {isDelivered && (
          <TouchableOpacity
            style={styles.newOrderBtn}
            onPress={() => router.push('/(tabs)/menu')}
          >
            <Text style={styles.newOrderText}>Order Again 😋</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: SPACING.base },
  noOrder: { fontSize: 64 },
  noOrderText: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  menuBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full, marginTop: SPACING.sm },
  menuBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 15 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.base, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  orderId: { fontSize: 11, color: COLORS.textMuted, marginTop: 2 },
  scroll: { flex: 1 },
  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: SPACING.base, margin: SPACING.base, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, padding: SPACING.lg },
  statusBannerDelivered: { backgroundColor: COLORS.success },
  statusEmoji: { fontSize: 40 },
  statusTitle: { fontSize: 18, fontWeight: '800', color: COLORS.white },
  statusEta: { fontSize: 13, color: COLORS.white + 'CC', marginTop: 2 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, padding: SPACING.base, marginHorizontal: SPACING.base, marginBottom: SPACING.base, ...SHADOW.sm },
  cardTitle: { fontSize: 15, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  addressRow: { flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm },
  addressText: { flex: 1, fontSize: 14, color: COLORS.textMuted, lineHeight: 20 },
  orderItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.xs },
  orderQty: { fontSize: 14, fontWeight: '700', color: COLORS.primary, width: 28 },
  orderName: { flex: 1, fontSize: 13, color: COLORS.text },
  orderPrice: { fontSize: 13, fontWeight: '700', color: COLORS.text },
  totalKey: { flex: 1, fontSize: 14, fontWeight: '800', color: COLORS.text },
  divider: { height: 1, backgroundColor: COLORS.border, marginVertical: SPACING.sm },
  paymentRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  paymentText: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  newOrderBtn: { backgroundColor: COLORS.primary, marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.lg, alignItems: 'center', marginBottom: SPACING.base },
  newOrderText: { color: COLORS.white, fontWeight: '800', fontSize: 16 },
});
