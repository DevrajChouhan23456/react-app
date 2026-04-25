import React, { useCallback, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW, TYPOGRAPHY } from '@/constants/theme';
import { MENU_ITEMS, OFFERS, MENU_CATEGORIES } from '@/constants/data';
import FoodCard from '@/components/FoodCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

function FadeInView({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, tension: 80, friction: 12 }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

export default function HomeScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const user = useAuthStore((s) => s.user);
  const bestsellers = MENU_ITEMS.filter((i) => i.isBestseller);
  const scrollY = useRef(new Animated.Value(0)).current;

  const handleAdd = useCallback((item: typeof MENU_ITEMS[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, selectedAddons: [] });
  }, [addItem]);

  const headerOpacity = scrollY.interpolate({ inputRange: [0, 80], outputRange: [1, 0.96], extrapolate: 'clamp' });

  return (
    <SafeAreaView style={styles.safe}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <FadeInView delay={0}>
          <Animated.View style={[styles.header, { opacity: headerOpacity }]}>
            <View>
              <View style={styles.locationRow}>
                <View style={styles.locationDot} />
                <Text style={styles.locationLabel}>Delivering to</Text>
                <Ionicons name="chevron-down" size={13} color={COLORS.primary} />
              </View>
              <Text style={styles.areaText}>MP Nagar, Bhopal</Text>
            </View>
            <TouchableOpacity style={styles.notifBtn} activeOpacity={0.7}>
              <Ionicons name="notifications" size={20} color={COLORS.primary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          </Animated.View>
        </FadeInView>

        {/* Hero Banner */}
        <FadeInView delay={80}>
          <View style={styles.heroBanner}>
            <View style={styles.heroContent}>
              <View style={styles.heroBadge}>
                <Text style={styles.heroBadgeText}>🔥 Trending Today</Text>
              </View>
              <Text style={styles.heroGreeting}>
                Namaste, {user?.name?.split(' ')[0] || 'Foodie'} 🙏
              </Text>
              <Text style={styles.heroTitle}>Authentic Dal Bafla{`\n`}from Bhopal 🫕</Text>
              <TouchableOpacity
                style={styles.heroBtn}
                onPress={() => router.push('/(tabs)/menu')}
                activeOpacity={0.85}
              >
                <Text style={styles.heroBtnText}>Order Now</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
              </TouchableOpacity>
            </View>
            <View style={styles.heroDecoration}>
              <Text style={{ fontSize: 80 }}>🫕</Text>
            </View>
          </View>
        </FadeInView>

        {/* Search Bar */}
        <FadeInView delay={140}>
          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/menu')}
            activeOpacity={0.85}
          >
            <View style={styles.searchIcon}>
              <Ionicons name="search" size={16} color={COLORS.primary} />
            </View>
            <Text style={styles.searchPlaceholder}>Search dal bafla, thali, sweets...</Text>
            <View style={styles.searchFilter}>
              <Ionicons name="options" size={16} color={COLORS.textMuted} />
            </View>
          </TouchableOpacity>
        </FadeInView>

        {/* Offers Banner */}
        <FadeInView delay={200}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Offers & Deals</Text>
              <View style={styles.sectionBadge}><Text style={styles.sectionBadgeText}>🎉 {OFFERS.length} active</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.offersRow}>
              {OFFERS.map((offer, idx) => (
                <TouchableOpacity key={offer.id} activeOpacity={0.88}>
                  <View style={[styles.offerCard, { backgroundColor: offer.color }]}>
                    <View style={styles.offerGlow} />
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerSubtitle}>{offer.subtitle}</Text>
                    <View style={styles.codeChip}>
                      <Text style={[styles.offerCode, { color: offer.color }]}>{offer.code}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Categories */}
        <FadeInView delay={260}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesRow}>
              {MENU_CATEGORIES.map((cat, idx) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.categoryChip}
                  onPress={() => router.push('/(tabs)/menu')}
                  activeOpacity={0.75}
                >
                  <View style={styles.categoryIconWrap}>
                    <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.categoryName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* Bestsellers */}
        <FadeInView delay={320}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bestsellers 🔥</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/menu')} style={styles.seeAllBtn}>
                <Text style={styles.seeAll}>See all</Text>
                <Ionicons name="arrow-forward" size={13} color={COLORS.primary} />
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
        </FadeInView>

        {/* Stats Banner */}
        <FadeInView delay={380}>
          <View style={styles.statsBanner}>
            <Text style={styles.statsTitle}>Why Gau Stories? 🫕</Text>
            <Text style={styles.statsDesc}>Authentic Dal Bafla made with love — freshly prepared daily with pure desi ghee.</Text>
            <View style={styles.statsRow}>
              {[
                { num: '500+', label: 'Happy\nCustomers' },
                { num: '4.8⭐', label: 'Average\nRating' },
                { num: '30min', label: 'Fast\nDelivery' },
              ].map((s, i, arr) => (
                <React.Fragment key={s.num}>
                  <View style={styles.stat}>
                    <Text style={styles.statNum}>{s.num}</Text>
                    <Text style={styles.statLabel}>{s.label}</Text>
                  </View>
                  {i < arr.length - 1 && <View style={styles.statDivider} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </FadeInView>

        <View style={{ height: SPACING.xxxl }} />
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.sm, paddingBottom: SPACING.md },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  locationDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: COLORS.primary },
  locationLabel: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  areaText: { ...TYPOGRAPHY.h4, color: COLORS.text, marginTop: 3 },
  notifBtn: { width: 44, height: 44, backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.full, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  notifDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.error, borderWidth: 1.5, borderColor: COLORS.white },

  // Hero
  heroBanner: { marginHorizontal: SPACING.base, marginBottom: SPACING.lg, backgroundColor: COLORS.primary, borderRadius: RADIUS.xxl, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', ...SHADOW.lg },
  heroContent: { flex: 1 },
  heroBadge: { backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start', marginBottom: SPACING.sm },
  heroBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.white, letterSpacing: 0.3 },
  heroGreeting: { fontSize: 13, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginBottom: 4 },
  heroTitle: { fontSize: 22, fontWeight: '900', color: COLORS.white, lineHeight: 28, marginBottom: SPACING.lg, letterSpacing: -0.5 },
  heroBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: 'rgba(255,255,255,0.22)', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, alignSelf: 'flex-start', borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  heroBtnText: { color: COLORS.white, fontWeight: '800', fontSize: 14 },
  heroDecoration: { alignItems: 'center', justifyContent: 'center' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: RADIUS.xl, padding: SPACING.md, marginBottom: SPACING.lg, borderWidth: 1.5, borderColor: COLORS.borderWarm, ...SHADOW.sm },
  searchIcon: { width: 32, height: 32, backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  searchPlaceholder: { flex: 1, fontSize: 14, color: COLORS.textFaint, fontWeight: '500' },
  searchFilter: { width: 32, height: 32, backgroundColor: COLORS.surfaceOffset, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },

  // Section
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: 0 },
  sectionBadge: { backgroundColor: COLORS.accentLight, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  sectionBadgeText: { fontSize: 11, fontWeight: '700', color: COLORS.warning },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAll: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Offers
  offersRow: { marginTop: SPACING.sm },
  offerCard: { width: 230, borderRadius: RADIUS.xl, padding: SPACING.lg, marginRight: SPACING.md, overflow: 'hidden', ...SHADOW.md },
  offerGlow: { position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.12)' },
  offerTitle: { fontSize: 16, fontWeight: '900', color: COLORS.white, marginBottom: 3, letterSpacing: -0.3 },
  offerSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.82)', marginBottom: SPACING.md, lineHeight: 17 },
  codeChip: { backgroundColor: COLORS.white, paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  offerCode: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },

  // Categories
  categoriesRow: { marginTop: SPACING.sm },
  categoryChip: { alignItems: 'center', marginRight: SPACING.md, width: 68 },
  categoryIconWrap: { width: 60, height: 60, backgroundColor: COLORS.surface, borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs, borderWidth: 1.5, borderColor: COLORS.borderWarm, ...SHADOW.sm },
  categoryIcon: { fontSize: 28 },
  categoryName: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center', lineHeight: 15 },

  // Stats
  statsBanner: { marginHorizontal: SPACING.base, backgroundColor: COLORS.surfaceWarm, borderRadius: RADIUS.xxl, padding: SPACING.xl, marginBottom: SPACING.base, borderWidth: 1.5, borderColor: COLORS.borderWarm, ...SHADOW.sm },
  statsTitle: { ...TYPOGRAPHY.h3, color: COLORS.text, marginBottom: SPACING.sm },
  statsDesc: { ...TYPOGRAPHY.body, color: COLORS.textMuted, lineHeight: 20, marginBottom: SPACING.lg },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statNum: { fontSize: 18, fontWeight: '900', color: COLORS.primary, letterSpacing: -0.5 },
  statLabel: { fontSize: 11, color: COLORS.textMuted, marginTop: 3, textAlign: 'center', lineHeight: 15 },
  statDivider: { width: 1, height: 36, backgroundColor: COLORS.borderWarm },
});
