import React, { useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useOrderStore, Order, OrderStatus } from '@/store/orderStore';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cartStore';

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: string }> = {
  placed:           { label: 'Order Placed',       color: '#F59E0B', icon: 'time-outline' },
  accepted:         { label: 'Accepted',            color: '#3B82F6', icon: 'checkmark-circle-outline' },
  preparing:        { label: 'Preparing',           color: '#8B5CF6', icon: 'restaurant-outline' },
  out_for_delivery: { label: 'Out for Delivery',    color: '#10B981', icon: 'bicycle-outline' },
  delivered:        { label: 'Delivered',           color: '#22C55E', icon: 'checkmark-done-circle' },
  cancelled:        { label: 'Cancelled',           color: '#EF4444', icon: 'close-circle-outline' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function OrderCard({ order, onTrack, onReorder }: { order: Order; onTrack: () => void; onReorder: () => void }) {
  const cfg = STATUS_CONFIG[order.status];
  const isActive = ['placed', 'accepted', 'preparing', 'out_for_delivery'].includes(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: cfg.color + '18' }]}>
          <Ionicons name={cfg.icon as any} size={13} color={cfg.color} />
          <Text style={[styles.statusText, { color: cfg.color }]}>{cfg.label}</Text>
        </View>
      </View>

      <View style={styles.itemsRow}>
        <Text style={styles.itemsText} numberOfLines={2}>
          {order.items.map((i) => `${i.quantity}× ${i.name}`).join('  •  ')}
        </Text>
      </View>

      <View style={styles.billRow}>
        <View style={styles.billLeft}>
          <Ionicons
            name={order.paymentMethod === 'cod' ? 'cash-outline' : 'card-outline'}
            size={14}
            color={COLORS.textMuted}
          />
          <Text style={styles.payLabel}>
            {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
          </Text>
        </View>
        <Text style={styles.totalText}>₹{order.total}</Text>
      </View>

      {isActive && (
        <View style={styles.progressWrap}>
          {(['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'] as OrderStatus[]).map((s, i) => (
            <View
              key={s}
              style={[
                styles.progressStep,
                (['placed', 'accepted', 'preparing', 'out_for_delivery', 'delivered'].indexOf(order.status) >= i)
                  ? styles.progressActive
                  : styles.progressInactive,
              ]}
            />
          ))}
        </View>
      )}

      <View style={styles.actions}>
        {isActive && (
          <TouchableOpacity style={styles.trackBtn} onPress={onTrack}>
            <Ionicons name="navigate" size={14} color={COLORS.white} />
            <Text style={styles.trackBtnText}>Live Track</Text>
          </TouchableOpacity>
        )}
        {order.status === 'delivered' && (
          <TouchableOpacity style={styles.reorderBtn} onPress={onReorder}>
            <Ionicons name="refresh" size={14} color={COLORS.primary} />
            <Text style={styles.reorderBtnText}>Reorder</Text>
          </TouchableOpacity>
        )}
        {order.status === 'cancelled' && (
          <Text style={styles.cancelledNote}>This order was cancelled.</Text>
        )}
      </View>
    </View>
  );
}

function EmptyOrders({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={styles.emptyWrap}>
      <Text style={styles.emptyEmoji}>🛵</Text>
      <Text style={styles.emptyTitle}>No orders yet</Text>
      <Text style={styles.emptySub}>Your Dal Bafla orders will appear here once you place one.</Text>
      <TouchableOpacity style={styles.browseBtn} onPress={onBrowse}>
        <Text style={styles.browseBtnText}>Browse Menu</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    const items = reorderItems(order);
    items.forEach((item) =>
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image || '',
        quantity: item.quantity,
        selectedAddons: item.addons.map((a, i) => ({ id: String(i), name: a.name, price: a.price })),
      })
    );
    router.push('/(tabs)/cart');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Orders</Text>
        {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
      </View>

      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={orders.length === 0 ? styles.emptyContainer : { padding: SPACING.base, gap: SPACING.md }}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={load} tintColor={COLORS.primary} />
        }
        renderItem={({ item }) => (
          <OrderCard
            order={item}
            onTrack={() => handleTrack(item)}
            onReorder={() => handleReorder(item)}
          />
        )}
        ListEmptyComponent={
          !loading ? <EmptyOrders onBrowse={() => router.push('/(tabs)/menu')} /> : null
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.md, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '900', color: COLORS.text, letterSpacing: -0.4 },
  card: { backgroundColor: COLORS.white, borderRadius: RADIUS.xl, padding: SPACING.base, ...SHADOW.sm, borderWidth: 1, borderColor: COLORS.border },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  orderId: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  orderDate: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.full },
  statusText: { fontSize: 11, fontWeight: '700' },
  itemsRow: { paddingVertical: SPACING.sm, borderTopWidth: 1, borderBottomWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.sm },
  itemsText: { fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  billRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  billLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  payLabel: { fontSize: 12, color: COLORS.textMuted },
  totalText: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  progressWrap: { flexDirection: 'row', gap: 4, marginBottom: SPACING.md },
  progressStep: { flex: 1, height: 4, borderRadius: 2 },
  progressActive: { backgroundColor: COLORS.primary },
  progressInactive: { backgroundColor: COLORS.border },
  actions: { flexDirection: 'row', gap: SPACING.sm },
  trackBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primary, paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg },
  trackBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 13 },
  reorderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: COLORS.primaryGlow || '#E6F4F1', paddingVertical: SPACING.sm + 2, borderRadius: RADIUS.lg, borderWidth: 1.5, borderColor: COLORS.primary },
  reorderBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 13 },
  cancelledNote: { fontSize: 12, color: COLORS.error || '#EF4444', fontStyle: 'italic' },
  emptyContainer: { flex: 1, justifyContent: 'center' },
  emptyWrap: { alignItems: 'center', paddingHorizontal: SPACING.xl, paddingVertical: SPACING.xl * 2 },
  emptyEmoji: { fontSize: 64, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  emptySub: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20, marginBottom: SPACING.xl },
  browseBtn: { backgroundColor: COLORS.primary, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.lg },
  browseBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
});
