import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions, StatusBar, Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { MENU_ITEMS, OFFERS, MENU_CATEGORIES } from '@/constants/data';
import FoodCard from '@/components/FoodCard';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

// ── Fade-in animation wrapper ──────────────────────────────────────────────
function FadeInView({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 480, delay, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, delay, useNativeDriver: true, tension: 70, friction: 14 }),
    ]).start();
  }, []);
  return <Animated.View style={{ opacity, transform: [{ translateY }] }}>{children}</Animated.View>;
}

// ── Promo banner data ──────────────────────────────────────────────────────
const PROMO_BANNERS = [
  { id: 1, title: 'Dal Bafla Combo', subtitle: 'Classic authentic taste \nwith extra ghee & churma', badge: '🔥 BESTSELLER', gradient: ['#D4521A', '#E8793A'] as const },
  { id: 2, title: 'Free Delivery', subtitle: 'On orders above ₹199\nToday only!', badge: '🚀 LIMITED', gradient: ['#1A7D4A', '#2EAA6B'] as const },
  { id: 3, title: 'Loyalty Points', subtitle: 'Earn 10 pts on every order\nRedeem for discounts', badge: '⭐ REWARDS', gradient: ['#6B3FC8', '#9B6BF0'] as const },
];

export default function HomeScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const cartCount = useCartStore((s) => s.items.reduce((a, b) => a + b.quantity, 0));
  const user = useAuthStore((s) => s.user);
  const bestsellers = MENU_ITEMS.filter((i) => i.isBestseller).slice(0, 4);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerScroll = useRef<ScrollView>(null);

  const handleAdd = useCallback((item: typeof MENU_ITEMS[0]) => {
    addItem({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, selectedAddons: [] });
  }, [addItem]);

  // Auto-scroll promo banners
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveBanner((prev) => {
        const next = (prev + 1) % PROMO_BANNERS.length;
        bannerScroll.current?.scrollTo({ x: next * (width - SPACING.base * 2), animated: true });
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  // Sticky header opacity
  const stickyBg = scrollY.interpolate({ inputRange: [0, 60], outputRange: ['rgba(255,248,240,0)', 'rgba(255,248,240,1)'], extrapolate: 'clamp' });
  const stickyBorder = scrollY.interpolate({ inputRange: [40, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  const firstName = user?.name?.split(' ')[0] || 'Foodie';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <Animated.View style={[styles.stickyHeader, { backgroundColor: stickyBg, borderBottomWidth: stickyBorder, borderBottomColor: '#F0E8DC' }]}>
        <TouchableOpacity
          style={styles.locationBtn}
          activeOpacity={0.7}
          onPress={() => router.push('/location-select')}
        >
          <Ionicons name="location" size={16} color={COLORS.primary} />
          <View>
            <Text style={styles.deliverLabel}>Delivering to</Text>
            <View style={styles.locationRow}>
              <Text style={styles.locationText}>MP Nagar, Bhopal</Text>
              <Ionicons name="chevron-down" size={13} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.text} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} activeOpacity={0.7} onPress={() => router.push('/(tabs)/profile')}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        contentContainerStyle={{ paddingTop: 4 }}
      >
        {/* ── Search Bar ────────────────────────────────────────────── */}
        <FadeInView delay={0}>
          <TouchableOpacity style={styles.searchBar} onPress={() => router.push('/(tabs)/menu')} activeOpacity={0.85}>
            <Ionicons name="search" size={18} color={COLORS.textMuted} />
            <Text style={styles.searchText}>Search dal, bafla, sweets...</Text>
            <View style={styles.micBtn}>
              <Ionicons name="mic" size={15} color={COLORS.primary} />
            </View>
          </TouchableOpacity>
        </FadeInView>

        {/* ── Greeting strip ────────────────────────────────────────── */}
        <FadeInView delay={60}>
          <View style={styles.greetStrip}>
            <Text style={styles.greetText}>Good evening, <Text style={{ color: COLORS.primary, fontWeight: '800' }}>{firstName}</Text> 🙏</Text>
            <Text style={styles.greetSub}>What's on your mind today?</Text>
          </View>
        </FadeInView>

        {/* ── Promo Carousel ────────────────────────────────────────── */}
        <FadeInView delay={120}>
          <View style={styles.carouselWrap}>
            <ScrollView
              ref={bannerScroll}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              scrollEventThrottle={16}
              onMomentumScrollEnd={(e) => {
                const idx = Math.round(e.nativeEvent.contentOffset.x / (width - SPACING.base * 2));
                setActiveBanner(idx);
              }}
            >
              {PROMO_BANNERS.map((b) => (
                <TouchableOpacity key={b.id} activeOpacity={0.92} style={{ width: width - SPACING.base * 2 }}>
                  <LinearGradient colors={b.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.promoBanner}>
                    <View style={styles.promoGlow} />
                    <View style={styles.promoContent}>
                      <View style={styles.promoBadge}>
                        <Text style={styles.promoBadgeText}>{b.badge}</Text>
                      </View>
                      <Text style={styles.promoTitle}>{b.title}</Text>
                      <Text style={styles.promoSubtitle}>{b.subtitle}</Text>
                    </View>
                    <Text style={styles.promoEmoji}>🫕</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </ScrollView>
            {/* Dots */}
            <View style={styles.dotsRow}>
              {PROMO_BANNERS.map((_, i) => (
                <View key={i} style={[styles.dot, i === activeBanner && styles.dotActive]} />
              ))}
            </View>
          </View>
        </FadeInView>

        {/* ── Quick Stats Row ───────────────────────────────────────── */}
        <FadeInView delay={180}>
          <View style={styles.statsRow}>
            {[
              { icon: '⚡', val: '30 min', sub: 'Fast Delivery' },
              { icon: '🧈', val: 'Pure Ghee', sub: 'Desi Style' },
              { icon: '⭐', val: '4.8 Rating', sub: '500+ reviews' },
            ].map((s, i) => (
              <View key={i} style={styles.statCard}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statVal}>{s.val}</Text>
                <Text style={styles.statSub}>{s.sub}</Text>
              </View>
            ))}
          </View>
        </FadeInView>

        {/* ── Categories ────────────────────────────────────────────── */}
        <FadeInView delay={220}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>What's on your mind?</Text>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {MENU_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.catChip}
                  onPress={() => router.push('/(tabs)/menu')}
                  activeOpacity={0.75}
                >
                  <View style={styles.catIconWrap}>
                    <Text style={styles.catIcon}>{cat.icon}</Text>
                  </View>
                  <Text style={styles.catName}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* ── Offers Strip ──────────────────────────────────────────── */}
        <FadeInView delay={270}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Offers & Deals</Text>
              <View style={styles.liveBadge}><View style={styles.liveDot} /><Text style={styles.liveText}>LIVE</Text></View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {OFFERS.map((offer) => (
                <TouchableOpacity key={offer.id} activeOpacity={0.88} style={{ marginRight: SPACING.md }}>
                  <View style={[styles.offerCard, { backgroundColor: offer.color }]}>
                    <Text style={styles.offerTitle}>{offer.title}</Text>
                    <Text style={styles.offerSub}>{offer.subtitle}</Text>
                    <View style={styles.codeChip}>
                      <Text style={[styles.offerCode, { color: offer.color }]}>{offer.code}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </FadeInView>

        {/* ── Bestsellers ───────────────────────────────────────────── */}
        <FadeInView delay={320}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Bestsellers 🔥</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/menu')} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>See all</Text>
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

        {/* ── Why Us ────────────────────────────────────────────────── */}
        <FadeInView delay={370}>
          <View style={styles.whyCard}>
            <Text style={styles.whyTitle}>Why Gau Stories? 🫕</Text>
            <Text style={styles.whyDesc}>Authentic Dal Bafla made fresh daily with pure desi ghee — just like home.</Text>
          </View>
        </FadeInView>

        <View style={{ height: 100 }} />
      </Animated.ScrollView>

      {/* ── Floating Cart Bar ─────────────────────────────────────── */}
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartBar} onPress={() => router.push('/(tabs)/cart')} activeOpacity={0.92}>
          <View style={styles.cartBadge}><Text style={styles.cartBadgeText}>{cartCount}</Text></View>
          <Text style={styles.cartBarText}>View Cart</Text>
          <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const CARD_GAP = SPACING.base;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFF8F0' },

  // Sticky Header
  stickyHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingVertical: SPACING.sm, zIndex: 10 },
  locationBtn: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  deliverLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600', letterSpacing: 0.2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  locationText: { fontSize: 15, fontWeight: '800', color: COLORS.text },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  iconBtn: { width: 40, height: 40, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', ...SHADOW.sm },
  notifDot: { position: 'absolute', top: 8, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#E84040', borderWidth: 1.5, borderColor: '#FFF8F0' },
  avatarCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: '#fff', marginHorizontal: SPACING.base, borderRadius: RADIUS.xl, paddingVertical: SPACING.md, paddingHorizontal: SPACING.md, marginBottom: SPACING.sm, borderWidth: 1.5, borderColor: '#F0E8DC', ...SHADOW.sm },
  searchText: { flex: 1, fontSize: 14, color: COLORS.textFaint, fontWeight: '500' },
  micBtn: { width: 30, height: 30, borderRadius: RADIUS.md, backgroundColor: COLORS.primaryGlow, alignItems: 'center', justifyContent: 'center' },

  // Greeting
  greetStrip: { paddingHorizontal: SPACING.base, paddingBottom: SPACING.md },
  greetText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  greetSub: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },

  // Carousel
  carouselWrap: { marginHorizontal: SPACING.base, marginBottom: SPACING.lg },
  promoBanner: { borderRadius: RADIUS.xxl, padding: SPACING.xl, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', minHeight: 140 },
  promoGlow: { position: 'absolute', width: 180, height: 180, borderRadius: 90, backgroundColor: 'rgba(255,255,255,0.08)', top: -50, right: -40 },
  promoContent: { flex: 1 },
  promoBadge: { backgroundColor: 'rgba(255,255,255,0.25)', alignSelf: 'flex-start', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full, marginBottom: SPACING.sm },
  promoBadgeText: { fontSize: 10, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  promoTitle: { fontSize: 20, fontWeight: '900', color: '#fff', letterSpacing: -0.4, marginBottom: 4 },
  promoSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.85)', lineHeight: 18 },
  promoEmoji: { fontSize: 64, marginLeft: SPACING.md },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.md, gap: SPACING.xs },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4C5B5' },
  dotActive: { width: 18, backgroundColor: COLORS.primary },

  // Quick Stats
  statsRow: { flexDirection: 'row', gap: SPACING.sm, marginHorizontal: SPACING.base, marginBottom: SPACING.xl },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: RADIUS.xl, padding: SPACING.md, alignItems: 'center', borderWidth: 1, borderColor: '#F0E8DC', ...SHADOW.sm },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statVal: { fontSize: 12, fontWeight: '800', color: COLORS.text },
  statSub: { fontSize: 10, color: COLORS.textMuted, marginTop: 1, textAlign: 'center' },

  // Section
  section: { paddingHorizontal: SPACING.base, marginBottom: SPACING.xl },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.md },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: COLORS.text, letterSpacing: -0.3 },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FFF0E8', paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.full },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#E84040' },
  liveText: { fontSize: 10, fontWeight: '800', color: '#E84040', letterSpacing: 0.5 },
  seeAllBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  seeAllText: { fontSize: 13, fontWeight: '700', color: COLORS.primary },

  // Categories
  catChip: { alignItems: 'center', marginRight: SPACING.md, width: 72 },
  catIconWrap: { width: 64, height: 64, backgroundColor: '#fff', borderRadius: RADIUS.xl, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.xs, borderWidth: 1.5, borderColor: '#F0E8DC', ...SHADOW.sm },
  catIcon: { fontSize: 30 },
  catName: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted, textAlign: 'center', lineHeight: 15 },

  // Offers
  offerCard: { width: 200, borderRadius: RADIUS.xl, padding: SPACING.lg, overflow: 'hidden', ...SHADOW.md },
  offerTitle: { fontSize: 15, fontWeight: '900', color: '#fff', marginBottom: 3 },
  offerSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', marginBottom: SPACING.md, lineHeight: 16 },
  codeChip: { backgroundColor: '#fff', paddingHorizontal: SPACING.md, paddingVertical: 4, borderRadius: RADIUS.full, alignSelf: 'flex-start' },
  offerCode: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

  // Why card
  whyCard: { marginHorizontal: SPACING.base, backgroundColor: '#fff', borderRadius: RADIUS.xxl, padding: SPACING.xl, borderWidth: 1.5, borderColor: '#F0E8DC', ...SHADOW.sm },
  whyTitle: { fontSize: 16, fontWeight: '800', color: COLORS.text, marginBottom: SPACING.sm },
  whyDesc: { fontSize: 13, color: COLORS.textMuted, lineHeight: 20 },

  // Cart Bar
  cartBar: { position: 'absolute', bottom: 80, left: SPACING.xl, right: SPACING.xl, backgroundColor: COLORS.primary, borderRadius: RADIUS.xl, flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.md, paddingHorizontal: SPACING.lg, ...SHADOW.lg, gap: SPACING.sm },
  cartBadge: { backgroundColor: 'rgba(255,255,255,0.25)', width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cartBadgeText: { color: '#fff', fontSize: 13, fontWeight: '900' },
  cartBarText: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 15 },
});
