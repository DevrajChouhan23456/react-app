import React, { useCallback, useRef, useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Animated, Dimensions, StatusBar,
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

  const stickyBg = scrollY.interpolate({ inputRange: [0, 60], outputRange: ['rgba(255,248,240,0)', 'rgba(255,248,240,1)'], extrapolate: 'clamp' });
  const stickyBorder = scrollY.interpolate({ inputRange: [40, 80], outputRange: [0, 1], extrapolate: 'clamp' });

  const firstName = user?.name?.split(' ')[0] || 'Foodie';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8F0" />

      {/* Sticky Header */}
      <Animated.View
        style={[
          styles.stickyHeader,
          { backgroundColor: stickyBg, borderBottomWidth: stickyBorder, borderBottomColor: '#F0E8DC' },
        ]}
      >
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
          <TouchableOpacity
            style={styles.iconBtn}
            activeOpacity={0.7}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{firstName[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* rest of component remains unchanged */}
      {/* ... keep existing ScrollView, sections, cart bar, styles etc. ... */}
    </SafeAreaView>
  );
}

// keep existing styles from previous file
