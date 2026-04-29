import React, { useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW, TYPOGRAPHY } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';
import { useLoyaltyStore } from '@/store/loyaltyStore';

const { width } = Dimensions.get('window');

// ── Menu row ──────────────────────────────────────────────────────────────────
interface MenuRowProps {
  icon: string;
  label: string;
  value?: string;
  onPress: () => void;
  danger?: boolean;
  badge?: string;
}

function MenuRow({ icon, label, value, onPress, danger, badge }: MenuRowProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const onIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 30 }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 30 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        style={styles.menuRow}
        onPress={onPress}
        activeOpacity={1}
        onPressIn={onIn}
        onPressOut={onOut}
      >
        <View style={[styles.menuIconWrap, danger && styles.menuIconDanger]}>
          <Ionicons name={icon as any} size={19} color={danger ? COLORS.error : COLORS.primary} />
        </View>
        <View style={styles.menuMid}>
          <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
          {value ? <Text style={styles.menuValue}>{value}</Text> : null}
        </View>
        {badge ? (
          <View style={styles.menuBadge}>
            <Text style={styles.menuBadgeText}>{badge}</Text>
          </View>
        ) : (
          !danger && <Ionicons name="chevron-forward" size={16} color={COLORS.textFaint} />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Stat pill ─────────────────────────────────────────────────────────────────
function StatPill({ val, label, icon }: { val: string; label: string; icon: string }) {
  return (
    <View style={styles.statPill}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statVal}>{val}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user, signOut } = useAuthStore();
  const { orders } = useOrderStore();
  const { points } = useLoyaltyStore();

  const totalSpent = orders.reduce((s, o) => s + o.total, 0);
  const firstName = user?.name?.split(' ')[0] || 'Guest';
  const initial = firstName[0]?.toUpperCase() ?? 'G';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { void signOut(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: SPACING.xxl * 2 }}>

        {/* ── Hero Header ───────────────────────────────────────────────── */}
        <LinearGradient
          colors={['#FF8C33', '#FF6B00', '#E55A00']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          {/* Glow orb */}
          <View style={styles.heroOrb} />
          <View style={styles.heroOrb2} />

          <View style={styles.heroContent}>
            {/* Avatar */}
            <View style={styles.avatarRing}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            </View>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.heroName}>{user?.name || 'Guest User'}</Text>
              <Text style={styles.heroPhone}>{user?.phone || 'Add phone number'}</Text>
              <TouchableOpacity style={styles.editPill} activeOpacity={0.85}>
                <Ionicons name="pencil" size={12} color={COLORS.primary} />
                <Text style={styles.editPillText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Stats row inside hero */}
          <View style={styles.heroStats}>
            <StatPill val={String(orders.length)} label="Orders" icon="📦" />
            <View style={styles.statDivider} />
            <StatPill val={`₹${totalSpent.toLocaleString('en-IN')}`} label="Total Spent" icon="💸" />
            <View style={styles.statDivider} />
            <StatPill val={String(points)} label="Reward Pts" icon="⭐" />
          </View>
        </LinearGradient>

        {/* ── Loyalty Card ──────────────────────────────────────────────── */}
        {points > 0 && (
          <TouchableOpacity
            style={styles.loyaltyCard}
            onPress={() => router.push('/(tabs)/loyalty')}
            activeOpacity={0.88}
          >
            <LinearGradient
              colors={['#5A3FC0', '#9B6BF0']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.loyaltyGradient}
            >
              <View style={styles.loyaltyLeft}>
                <Text style={styles.loyaltyEmoji}>⭐</Text>
                <View>
                  <Text style={styles.loyaltyPts}>{points} Points</Text>
                  <Text style={styles.loyaltySub}>≈ ₹{(points * 0.1).toFixed(0)} redeemable</Text>
                </View>
              </View>
              <View style={styles.loyaltyRight}>
                <Text style={styles.loyaltyRedeem}>Redeem</Text>
                <Ionicons name="arrow-forward" size={16} color="rgba(255,255,255,0.9)" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Account section ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.card}>
            <MenuRow
              icon="location-outline"
              label="Saved Addresses"
              value={user?.addresses?.[0]?.area || 'No address saved'}
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="receipt-outline"
              label="Order History"
              value={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
              onPress={() => router.push('/(tabs)/orders')}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="pricetag-outline"
              label="My Coupons"
              badge="2 active"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="notifications-outline"
              label="Notifications"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ── Support section ───────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.card}>
            <MenuRow
              icon="chatbubble-ellipses-outline"
              label="Chat with Us"
              value="WhatsApp / Call"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="help-circle-outline"
              label="FAQs"
              onPress={() => {}}
            />
            <View style={styles.rowDivider} />
            <MenuRow
              icon="star-outline"
              label="Rate the App"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* ── Danger zone ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.card}>
            <MenuRow
              icon="log-out-outline"
              label="Logout"
              danger
              onPress={handleLogout}
            />
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.appName}>🫕 Dal Bhaffle</Text>
          <Text style={styles.version}>v1.0.0 · Made with love in Bhopal</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5EFE8' },

  // Hero
  hero: {
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.xl + SPACING.md,
    paddingHorizontal: SPACING.base,
    overflow: 'hidden',
  },
  heroOrb: {
    position: 'absolute', width: 220, height: 220,
    borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80, right: -60,
  },
  heroOrb2: {
    position: 'absolute', width: 140, height: 140,
    borderRadius: 70, backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40, left: -40,
  },
  heroContent: { alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.xl },
  avatarRing: {
    width: 88, height: 88, borderRadius: 44,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center', justifyContent: 'center',
    ...SHADOW.glow,
  },
  avatar: {
    width: 78, height: 78, borderRadius: 39,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 34, fontWeight: '800', color: '#fff' },
  heroName: { fontSize: 22, fontWeight: '900', color: '#fff', letterSpacing: -0.5 },
  heroPhone: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 3, fontWeight: '500' },
  editPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    marginTop: SPACING.sm,
    backgroundColor: '#fff',
    paddingHorizontal: SPACING.md, paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  editPillText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },

  heroStats: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.base,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statPill: { flex: 1, alignItems: 'center', gap: 3 },
  statIcon: { fontSize: 18 },
  statVal: { fontSize: 16, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  statLabel: { fontSize: 10, color: 'rgba(255,255,255,0.75)', fontWeight: '600', textAlign: 'center' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 4 },

  // Loyalty card
  loyaltyCard: {
    marginHorizontal: SPACING.base,
    marginTop: SPACING.base,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.md,
  },
  loyaltyGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.base,
  },
  loyaltyLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  loyaltyEmoji: { fontSize: 32 },
  loyaltyPts: { fontSize: 18, fontWeight: '900', color: '#fff', letterSpacing: -0.3 },
  loyaltySub: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginTop: 2 },
  loyaltyRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loyaltyRedeem: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Sections
  section: { paddingHorizontal: SPACING.base, marginTop: SPACING.base },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: COLORS.textMuted,
    letterSpacing: 1, marginBottom: SPACING.sm,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    ...SHADOW.sm,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  rowDivider: { height: 1, backgroundColor: '#F5EEE6', marginLeft: 60 },

  // Menu row
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.base - 2,
  },
  menuIconWrap: {
    width: 36, height: 36, borderRadius: RADIUS.md,
    backgroundColor: 'rgba(255,107,0,0.10)',
    alignItems: 'center', justifyContent: 'center',
    marginRight: SPACING.md,
  },
  menuIconDanger: { backgroundColor: 'rgba(239,68,68,0.10)' },
  menuMid: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  menuValue: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  menuBadge: {
    backgroundColor: COLORS.primaryGlow,
    paddingHorizontal: SPACING.sm, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  menuBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },

  // Footer
  footer: { alignItems: 'center', marginTop: SPACING.xl, paddingBottom: SPACING.base },
  appName: { fontSize: 16, fontWeight: '800', color: COLORS.text },
  version: { fontSize: 12, color: COLORS.textFaint, marginTop: 4 },
});
