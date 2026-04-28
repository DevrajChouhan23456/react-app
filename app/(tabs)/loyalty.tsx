import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { useLoyaltyStore, RUPEES_PER_POINT } from '@/store/loyaltyStore';

export default function LoyaltyScreen() {
  const user = useAuthStore((s) => s.user);
  const { points, transactions, loading, fetchPoints, pointsToRupees } = useLoyaltyStore();

  useEffect(() => {
    if (user?.uid) fetchPoints(user.uid);
  }, [user?.uid]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Hero card */}
      <View style={styles.heroCard}>
        <Ionicons name="star" size={32} color="#F59E0B" />
        <Text style={styles.heroPoints}>{points}</Text>
        <Text style={styles.heroLabel}>Dal Bhaffle Points</Text>
        <Text style={styles.heroSub}>= ₹{pointsToRupees(points)} redeemable discount</Text>
        <View style={styles.heroRule} />
        <Text style={styles.heroHint}>Earn 1 pt per ₹10 spent · 10 pts = ₹1 off</Text>
      </View>

      {/* Transaction history */}
      <Text style={styles.sectionTitle}>Transaction History</Text>

      {loading ? (
        <ActivityIndicator color="#0f766e" style={{ marginTop: 32 }} />
      ) : transactions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="receipt-outline" size={48} color="#d1d5db" />
          <Text style={styles.emptyText}>No transactions yet</Text>
          <Text style={styles.emptyHint}>Place an order to start earning points!</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(t) => t.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
          renderItem={({ item }) => (
            <View style={styles.txnRow}>
              <View style={[styles.txnIcon, item.type === 'earn' ? styles.txnIconEarn : styles.txnIconRedeem]}>
                <Ionicons
                  name={item.type === 'earn' ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={item.type === 'earn' ? '#16a34a' : '#dc2626'}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.txnDesc}>{item.description}</Text>
                <Text style={styles.txnDate}>
                  {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <Text style={[styles.txnPts, item.type === 'earn' ? styles.ptEarn : styles.ptRedeem]}>
                {item.type === 'earn' ? '+' : ''}{item.points} pts
              </Text>
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF7ED' },
  heroCard: { margin: 16, backgroundColor: '#0f766e', borderRadius: 20, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  heroPoints: { fontSize: 56, fontWeight: '900', color: '#fff', marginTop: 4 },
  heroLabel: { fontSize: 16, fontWeight: '700', color: '#ccfbf1' },
  heroSub: { fontSize: 13, color: '#99f6e4', marginTop: 2 },
  heroRule: { width: '80%', height: 1, backgroundColor: 'rgba(255,255,255,0.2)', marginVertical: 12 },
  heroHint: { fontSize: 12, color: '#99f6e4' },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#6b7280', marginLeft: 16, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  empty: { alignItems: 'center', marginTop: 48, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '700', color: '#9ca3af' },
  emptyHint: { fontSize: 13, color: '#d1d5db' },
  txnRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, gap: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  txnIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  txnIconEarn: { backgroundColor: '#dcfce7' },
  txnIconRedeem: { backgroundColor: '#fee2e2' },
  txnDesc: { fontSize: 13, fontWeight: '600', color: '#111827' },
  txnDate: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
  txnPts: { fontSize: 14, fontWeight: '800' },
  ptEarn: { color: '#16a34a' },
  ptRedeem: { color: '#dc2626' },
});
