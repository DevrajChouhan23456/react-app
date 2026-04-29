import React, { useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useOrderStore } from '@/store/orderStore';
import OrderStatusStepper from '@/components/OrderStatusStepper';

// ── Map Placeholder (Expo Go compatible — no react-native-maps needed) ──────
// Mimics a live map with animated delivery pin pulsing over a grid background.
function MapPlaceholder({ hasDriver }: { hasDriver: boolean }) {
  const pulse = useRef(new Animated.Value(1)).current;
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulsing ring around the pin
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.6, duration: 900, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
      ])
    ).start();
    // Gentle vertical float
    Animated.loop(
      Animated.sequence([
        Animated.timing(drift, { toValue: -6, duration: 1200, useNativeDriver: true }),
        Animated.timing(drift, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <View style={mapStyles.container}>
      {/* Grid lines — mimics map tile grid */}
      {[...Array(5)].map((_, i) => (
        <View key={`h${i}`} style={[mapStyles.gridH, { top: `${20 * (i + 1)}%` }]} />
      ))}
      {[...Array(5)].map((_, i) => (
        <View key={`v${i}`} style={[mapStyles.gridV, { left: `${20 * (i + 1)}%` }]} />
      ))}

      {/* Road lines */}
      <View style={mapStyles.roadH} />
      <View style={mapStyles.roadV} />

      {/* Destination pin (static) */}
      <View style={mapStyles.destWrap}>
        <View style={mapStyles.destPin}>
          <Ionicons name="home" size={12} color="#fff" />
        </View>
        <View style={mapStyles.destStem} />
      </View>

      {/* Delivery partner pin (animated) */}
      {hasDriver ? (
        <View style={mapStyles.driverWrap}>
          <Animated.View style={[
            mapStyles.pulsRing,
            { transform: [{ scale: pulse }] },
          ]} />
          <Animated.View style={[
            mapStyles.driverPin,
            { transform: [{ translateY: drift }] },
          ]}>
            <Text style={{ fontSize: 18 }}>🛵</Text>
          </Animated.View>
        </View>
      ) : (
        <View style={mapStyles.waitingWrap}>
          <Text style={mapStyles.waitingText}>🛵 Driver location updates once order is picked up</Text>
        </View>
      )}

      {/* LIVE badge */}
      <View style={mapStyles.liveBadge}>
        <View style={mapStyles.liveDot} />
        <Text style={mapStyles.liveText}>LIVE</Text>
      </View>

      {/* Bhopal label */}
      <Text style={mapStyles.cityLabel}>Bhopal, MP</Text>
    </View>
  );
}

const mapStyles = StyleSheet.create({
  container: {
    height: 220,
    borderRadius: RADIUS.lg,
    backgroundColor: '#E8F0D8',
    overflow: 'hidden',
    position: 'relative',
  },
  gridH: {
    position: 'absolute', left: 0, right: 0, height: 1,
    backgroundColor: 'rgba(150,170,120,0.35)',
  },
  gridV: {
    position: 'absolute', top: 0, bottom: 0, width: 1,
    backgroundColor: 'rgba(150,170,120,0.35)',
  },
  roadH: {
    position: 'absolute', top: '55%', left: 0, right: 0,
    height: 8, backgroundColor: 'rgba(255,255,255,0.7)',
  },
  roadV: {
    position: 'absolute', left: '45%', top: 0, bottom: 0,
    width: 8, backgroundColor: 'rgba(255,255,255,0.7)',
  },
  destWrap: {
    position: 'absolute', bottom: '30%', right: '25%',
    alignItems: 'center',
  },
  destPin: {
    width: 26, height: 26, borderRadius: 13,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  destStem: {
    width: 2, height: 6, backgroundColor: COLORS.primary,
  },
  driverWrap: {
    position: 'absolute', top: '30%', left: '30%',
    alignItems: 'center', justifyContent: 'center',
  },
  pulsRing: {
    position: 'absolute',
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(200,66,15,0.2)',
    borderWidth: 2, borderColor: 'rgba(200,66,15,0.4)',
  },
  driverPin: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4,
    elevation: 4,
  },
  waitingWrap: {
    position: 'absolute', bottom: 10, left: 10, right: 10,
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.md, paddingVertical: 6,
  },
  waitingText: {
    fontSize: 11, color: COLORS.textMuted, textAlign: 'center',
  },
  liveBadge: {
    position: 'absolute', top: 10, left: 10,
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  liveDot: {
    width: 6, height: 6, borderRadius: 3,
    backgroundColor: '#E84040',
  },
  liveText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  cityLabel: {
    position: 'absolute', bottom: 8, right: 10,
    fontSize: 10, color: 'rgba(60,80,40,0.6)', fontWeight: '600',
  },
});

// ── Main Screen ─────────────────────────────────────────────────────────────
export default function OrderTrackingScreen() {
  const router = useRouter();
  const { activeOrder } = useOrderStore();

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

  const driverLat = (activeOrder as any).driverLat as number | undefined;
  const driverLng = (activeOrder as any).driverLng as number | undefined;
  const hasDriverLocation = typeof driverLat === 'number' && typeof driverLng === 'number';
  const isDelivered = activeOrder.status === 'delivered';

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
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

        {/* Live Map Placeholder */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Live Location</Text>
          <MapPlaceholder hasDriver={hasDriverLocation} />
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
