import React, { useEffect, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, RefreshControl, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useOrderStore, Order, OrderStatus } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';
import Shimmer from '@/components/ui/Shimmer';
import EmptyState from '@/components/ui/EmptyState';

// ── Status config ──────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string; step: number }> = {
  placed:           { label: 'Order Placed',     color: '#F59E0B', icon: 'time-outline',             step: 0 },
  accepted:         { label: 'Accepted',          color: '#3B82F6', icon: 'checkmark-circle-outline', step: 1 },
  preparing:        { label: 'Preparing',         color: '#8B5CF6', icon: 'restaurant-outline',       step: 2 },
  out_for_delivery: { label: 'Out for Delivery',  color: '#10B981', icon: 'bicycle-outline',          step: 3 },
  delivered:        { label: 'Delivered',         color: '#22C55E', icon: 'checkmark-done-circle',    step: 4 },
  cancelled:        { label: 'Cancelled',         color: '#EF4444', icon: 'close-circle-outline',     step: -1 },
};

const PROGRESS_STEPS: OrderStatus[] = ['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'];
const ACTIVE_STATUSES: OrderStatus[] = ['placed', 'accepted', 'preparing', 'out_for_delivery'];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Skeleton card ─────────────────────────────────────────────────────────────
function OrderSkeleton() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <View style={{ gap: 8, flex: 1 }}>
          <Shimmer width={140} height={16} radius={8} />
          <Shimmer width={100} height={12} radius={6} />
        </View>
        <Shimmer width={90} height={28} radius={14} />
      </View>
      <Shimmer width="100%" height={1} radius={0} style={{ marginVertical: 12 }} />
      <Shimmer width="80%" height={13} radius={6} style={{ marginBottom: 8 }} />
      <Shimmer width="50%" height={13} radius={6} style={{ marginBottom: 16 }} />
      <Shimmer width="100%" height={40} radius={12} />
    </View>
  );
}

// ── Progress bar ──────────────────────────────────────────────────────────────
function ProgressBar({ status }: { status: OrderStatus }) {
  const currentStep = STATUS_CONFIG[status].step;
  return (
    <View style={styles.progressWrap}>
      {PROGRESS_STEPS.map((s, i) => {
        const filled = currentStep >= i;
        return (
          <View key={s} style={styles.progressSegment}>
            <View
              style={[
                styles.progressDot,
                filled ? { backgroundColor: COLORS.primary } : { backgroundColor: '#EDE0D0' },
              ]}
            />
            {i < PROGRESS_STEPS.length - 1 && (
              <View
                style={[
                  styles.progressLine,
                  filled && currentStep > i
                    ? { backgroundColor: COLORS.primary }
                    : { backgroundColor: '#EDE0D0' },
                ]}
              />
            )}
          </View>
        );
      })}
    </View>
  );
}

// ── Order card ────────────────────────────────────────────────────────────────
function OrderCard({ order, onTrack, onReorder, onReview }: {
  order: Order;
  onTrack: () => void;
  onReorder: () => void;
  onReview: () => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const isActive = ACTIVE_STATUSES.includes(order.status);
  const entranceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(entranceAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  const animStyle = {
    opacity: entranceAnim,
    transform: [{ translateY: entranceAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
  };

  return (
    <Animated.View style={[styles.card, animStyle]}>
      {/* Active pulse strip */}
      {isActive && <View style={styles.activeStrip} />}

      {/* Header */}
      <View style={styles.cardTop}>
        <View>
          <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
          <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      {/* Items */}
      <View style={styles.itemsWrap}>
        <Text style={styles.itemsText} numberOfLines={2}>
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join('  ·  ')}
        </Text>
      </View>

      {/* Bill row */}
      <View style={styles.billRow}>
        <View style={styles.payWrap}>
          <Ionicons
            name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
            size={14}
            color={COLORS.textMuted}
          />
          <Text style={styles.payText}>
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </Text>
        </View>
        <Text style={styles.totalText}>₹{order.total}</Text>
      </View>

      {/* Progress for active orders */}
      {isActive && <ProgressBar status={order.status} />}

      {/* Action buttons */}
      <View style={styles.actions}>
        {isActive && (
          <TouchableOpacity style={styles.primaryBtn} onPress={onTrack} activeOpacity={0.88}>
            <LinearGradient
              colors={['#FF8C33', '#FF6B00']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.primaryBtnGrad}
            >
              <Ionicons name="navigate" size={14} color="#fff" />
              <Text style={styles.primaryBtnText}>Live Track</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
        {order.status === 'delivered' && (
          <>
            <TouchableOpacity style={styles.outlineBtn} onPress={onReorder} activeOpacity={0.88}>
              <Ionicons name="refresh" size={14} color={COLORS.primary} />
              <Text style={styles.outlineBtnText}>Reorder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.outlineBtn} onPress={onReview} activeOpacity={0.88}>
              <Ionicons name="star-outline" size={14} color={COLORS.primary} />
              <Text style={styles.outlineBtnText}>Review</Text>
            </TouchableOpacity>
          </>
        )}
        {order.status === 'cancelled' && (
          <View style={styles.cancelledBanner}>
            <Ionicons name="close-circle" size={14} color={COLORS.error} />
            <Text style={styles.cancelledText}>Order was cancelled</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────────
export default function OrdersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { orders, loading, fetchOrders, setActiveOrder, reorderItems, subscribeToActiveOrder } = useOrderStore();
  const addItem = useCartStore((s) => s.addItem);

  const load = useCallback(() => {
    if (user?.id) fetchOrders(user.id);
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const handleTrack = (order: Order) => {
    setActiveOrder(order);
    subscribeToActiveOrder(order.id);
    router.push('/order-tracking');
  };

  const handleReorder = (order: Order) => {
    reorderItems(order).forEach((item) =>
      addItem({
        id: item.id, name: item.name, price: item.price,
        image: item.image || '', quantity: item.quantity,
        selectedAddons: item.addons.map((a, i) => ({ id: String(i), name: a.name, price: a.price })),
      })
    );
    router.push('/(tabs)/cart');
  };

  const handleReview = (order: Order) => {
    router.push(`/review/${order.id}`);
  };

  // Skeleton loading
  if (loading && orders.length === 0) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Orders</Text>
        </View>
        <View style={{ padding: SPACING.base, gap: SPACING.md }}>
          {[1, 2, 3].map((k) => <OrderSkeleton key={k} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Sticky header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>My Orders</Text>
          <Text style={styles.headerSub}>{orders.length} order{orders.length !== 1 ? 's' : ''} placed</Text>
        </View>
        {loading && (
          <View style={styles.loadingPill}>
            <Text style={styles.loadingText}>Syncing...</Text>
          </View>
        )}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={
          orders.length === 0
            ? styles.emptyContainer
            : { padding: SPACING.base, gap: SPACING.md, paddingBottom: 100 }
        }
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={load}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onTrack={() => handleTrack(item)}
            onReorder={() => handleReorder(item)}
            onReview={() => handleReview(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <EmptyState
              emoji="🛵"
              title="No orders yet"
              description="Your Dal Bhaffle orders will show up here once you place one."
              actionLabel="Browse Menu"
              onAction={() => router.push('/(tabs)/menu')}
            />
          ) : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5EFE8' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#EDE0D0',
    ...SHADOW.xs,
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  headerSub: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  loadingPill: { backgroundColor: COLORS.primaryGlow, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  loadingText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  emptyContainer: { flex: 1, justifyContent: 'center' },

  // Card
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xxl,
    overflow: 'hidden',
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: '#EDE0D0',
  },
  activeStrip: {
    height: 3, backgroundColor: COLORS.primary,
    marginBottom: 0,
  },
  cardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: SPACING.base, paddingBottom: SPACING.sm,
  },
  orderId: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  orderDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 3 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },

  itemsWrap: {
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#F5EFE8',
  },
  itemsText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 19 },

  billRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
  },
  payWrap: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  payText: { fontSize: 12, color: COLORS.textMuted },
  totalText: { fontSize: 17, fontWeight: '900', color: COLORS.text, letterSpacing: -0.3 },

  // Progress
  progressWrap: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: SPACING.base, paddingBottom: SPACING.md,
  },
  progressSegment: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressLine: { flex: 1, height: 3, borderRadius: 2 },

  // Actions
  actions: {
    flexDirection: 'row', gap: SPACING.sm,
    paddingHorizontal: SPACING.base, paddingBottom: SPACING.base,
  },
  primaryBtn: { flex: 1, borderRadius: RADIUS.lg, overflow: 'hidden' },
  primaryBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: SPACING.sm + 3 },
  primaryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  outlineBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: COLORS.primary,
    paddingVertical: SPACING.sm + 3, borderRadius: RADIUS.lg,
  },
  outlineBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  cancelledBanner: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: '#FFEBEE',
    paddingVertical: SPACING.sm + 3, borderRadius: RADIUS.lg,
  },
  cancelledText: { fontSize: 13, color: COLORS.error, fontWeight: '600' },
});
