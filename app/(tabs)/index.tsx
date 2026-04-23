import React, { useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, FlatList, ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { MENU_ITEMS, OFFERS, MENU_CATEGORIES } from '@/constants/data';
import FoodCard from '@/components/FoodCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const bestsellers = MENU_ITEMS.filter((i) => i.isBestseller);

  const handleAdd = useCallback((item: typeof MENU_ITEMS[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, selectedAddons: [] });
  }, [addItem]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={COLORS.primary} />
              <Text style={styles.locationText}>Deliver to</Text>
              <Ionicons name="chevron-down" size={14} color={COLORS.text} />
            </View>
            <Text style={styles.areaText}>MP Nagar, Bhopal</Text>
          </View>
          <TouchableOpacity style={styles.notifBtn}>
            <Ionicons name="notifications-outline" size={22} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {/* Greeting */}
        <View style={styles.greeting}>
          <Text style={styles.greetingText}>
            Namaste, {user?.name?.split(' ')[0] || 'Guest'} 🙏
          </Text>
          <Text style={styles.tagline}>Authentic Dal Bafla from Bhopal</Text>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => router.push('/(tabs)/menu')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <Text style={styles.searchPlaceholder}>Search dal bafla, thali...</Text>
        </TouchableOpacity>

        {/* Offers Banner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Offers & Deals 🎉</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersRow}>
            {OFFERS.map((offer) => (
              <View key={offer.id} style={[styles.offerCard, { backgroundColor: offer.color }]}>
                <Text style={styles.offerTitle}>{offer.title}</Text>
                <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                <View style={styles.codeChip}>
                  <Text style={[styles.offerCode, { color: offer.color }]}>{offer.code}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What\'s on your mind?</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
            {MENU_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryChip}
                onPress={() => router.push('/(tabs)/menu')}
              >
                <Text style={styles.categoryIcon}>{cat.icon}</Text>
                <Text style={styles.categoryName}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Bestsellers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bestsellers 🔥</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/menu')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>
          {bestsellers.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAdd={() => handleAdd(item)}
            />
          ))}
        </View>

        {/* About Banner */}
        <View style={styles.aboutBanner}>
          <Text style={styles.aboutTitle}>🫕 Gau Stories</Text>
          <Text style={styles.aboutDesc}>
            Authentic Dal Bafla made with love in Bhopal.
            Freshly prepared daily with pure desi ghee.
          </Text>
          <View style={styles.aboutStats}>
            <View style={styles.stat}>
              <Text style={styles.statNum}>500+</Text>
              <Text style={styles.statLabel}>Happy customers</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>4.8 ⭐</Text>
              <Text style={styles.statLabel}>Avg rating</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.stat}>
              <Text style={styles.statNum}>30 min</Text>
              <Text style={styles.statLabel}>Delivery time</Text>
            </View>
          </View>
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '500' },
  areaText: { fontSize: 15, fontWeight: '700', color: COLORS.text, marginTop: 2 },
  notifBtn: { width: 40, height: 40, backgroundColor: COLORS.surface, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  greeting: { paddingHorizontal: SPACING.base, marginBottom: SPACING.base },
  greetingText: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  tagline: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, padding: SPACING.md, marginBottom: SPACING.base, ...SHADOW.sm },
  searchPlaceholder: { fontSize: 14, color: COLORS.textMuted },
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.lg },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.md },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },
  offersRow: { marginTop: -SPACING.sm },
  offerCard: { width: 220, borderRadius: RADIUS.lg, padding: SPACING.base, marginRight: SPACING.md },
  offerTitle: { fontSize: 15, fontWeight: '800', color: COLORS.white, marginBottom: 4 },
  offerSubtitle: { fontSize: 12, color: COLORS.white + 'CC', marginBottom: SPACING.sm },
  codeChip: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  offerCode: { fontSize: 12, fontWeight: '800' },
  categoriesRow: { marginTop: -SPACING.sm },
  categoryChip: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.md, marginRight: SPACING.sm, minWidth: 70, ...SHADOW.sm },
  categoryIcon: { fontSize: 26, marginBottom: 4 },
  categoryName: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  aboutBanner: { marginHorizontal: SPACING.base, backgroundColor: COLORS.secondary, borderRadius: RADIUS.xl, padding: SPACING.lg, marginBottom: SPACING.base },
  aboutTitle: { fontSize: 18, fontWeight: '800', color: COLORS.primaryDark, marginBottom: 6 },
  aboutDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20, marginBottom: SPACING.base },
  aboutStats: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, textAlign: 'center' },
  statDivider: { width: 1, height: 32, backgroundColor: COLORS.border },
});
