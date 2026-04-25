import React from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useOrderStore } from '@/store/orderStore';

const MenuItem = ({ icon, label, value, onPress, danger }: any) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
      <Ionicons name={icon} size={20} color={danger ? COLORS.error : COLORS.primary} />
    </View>
    <View style={styles.menuContent}>
      <Text style={[styles.menuLabel, danger && { color: COLORS.error }]}>{label}</Text>
      {value && <Text style={styles.menuValue}>{value}</Text>}
    </View>
    <Ionicons name="chevron-forward" size={16} color={COLORS.textFaint} />
  </TouchableOpacity>
);

export default function ProfileScreen() {
  const { user, signOut } = useAuthStore();
  const { orders } = useOrderStore();

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { void signOut(); } },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || 'G'}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name || 'Guest'}</Text>
          <Text style={styles.phone}>{user?.phone || ''}</Text>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={14} color={COLORS.primary} />
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>{orders.length}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>₹{orders.reduce((s, o) => s + o.total, 0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNum}>⭐ 4.8</Text>
            <Text style={styles.statLabel}>Avg Rating</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="location-outline" label="Saved Addresses" value={user?.addresses?.[0]?.area || 'Add address'} onPress={() => {}} />
            <MenuItem icon="receipt-outline" label="Order History" value={`${orders.length} orders`} onPress={() => {}} />
            <MenuItem icon="pricetag-outline" label="My Coupons" onPress={() => {}} />
            <MenuItem icon="notifications-outline" label="Notifications" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuCard}>
            <MenuItem icon="chatbubble-outline" label="Contact Us" value="WhatsApp / Call" onPress={() => {}} />
            <MenuItem icon="help-circle-outline" label="FAQs" onPress={() => {}} />
            <MenuItem icon="star-outline" label="Rate the App" onPress={() => {}} />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.menuCard}>
            <MenuItem icon="log-out-outline" label="Logout" danger onPress={handleLogout} />
          </View>
        </View>

        <Text style={styles.version}>Dal Bafla App v1.0.0 • Gau Stories, Bhopal</Text>
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  profileHeader: { alignItems: 'center', padding: SPACING.xl, backgroundColor: COLORS.white, marginBottom: SPACING.base },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  avatarText: { fontSize: 32, fontWeight: '800', color: COLORS.white },
  name: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  phone: { fontSize: 14, color: COLORS.textMuted, marginTop: 4 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: SPACING.sm, paddingHorizontal: SPACING.md, paddingVertical: 6, backgroundColor: COLORS.secondary, borderRadius: RADIUS.full },
  editText: { fontSize: 13, fontWeight: '600', color: COLORS.primary },
  statsRow: { flexDirection: 'row', backgroundColor: COLORS.white, marginBottom: SPACING.base, ...SHADOW.sm },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: SPACING.base },
  statNum: { fontSize: 18, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.base },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted, marginBottom: SPACING.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  menuCard: { backgroundColor: COLORS.white, borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOW.sm },
  menuItem: { flexDirection: 'row', alignItems: 'center', padding: SPACING.base, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  menuIcon: { width: 36, height: 36, borderRadius: RADIUS.md, backgroundColor: COLORS.secondary, alignItems: 'center', justifyContent: 'center', marginRight: SPACING.md },
  menuIconDanger: { backgroundColor: '#FFEBEE' },
  menuContent: { flex: 1 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  menuValue: { fontSize: 12, color: COLORS.textMuted, marginTop: 2 },
  version: { textAlign: 'center', fontSize: 12, color: COLORS.textFaint, marginTop: SPACING.sm },
});
