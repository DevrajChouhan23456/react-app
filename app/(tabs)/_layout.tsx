import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';
import { COLORS, RADIUS, SHADOW, SPACING } from '@/constants/theme';
import { useCartStore } from '@/store/cartStore';
import { useRef, useEffect } from 'react';

function TabBarIcon({ name, color, focused }: { name: any; color: string; focused: boolean }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.15 : 1,
        useNativeDriver: true,
        tension: 300,
        friction: 10,
      }),
      Animated.timing(opacityAnim, {
        toValue: focused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused]);

  return (
    <View style={styles.iconContainer}>
      <Animated.View
        style={[
          styles.iconGlow,
          { opacity: opacityAnim },
        ]}
      />
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <Ionicons name={name} size={22} color={color} />
      </Animated.View>
    </View>
  );
}

function CartIcon({ color, focused }: { color: string; focused: boolean }) {
  const count = useCartStore((s) => s.getItemCount());
  const bounceAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count > 0) {
      Animated.sequence([
        Animated.spring(bounceAnim, { toValue: 1.4, useNativeDriver: true, tension: 400 }),
        Animated.spring(bounceAnim, { toValue: 1, useNativeDriver: true, tension: 400 }),
      ]).start();
    }
  }, [count]);

  return (
    <View>
      <TabBarIcon name="cart-outline" color={color} focused={focused} />
      {count > 0 && (
        <Animated.View style={[styles.badge, { transform: [{ scale: bounceAnim }] }]}>
          <Text style={styles.badgeText}>{count > 9 ? '9+' : count}</Text>
        </Animated.View>
      )}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textFaint,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} focused={focused} /> }} />
      <Tabs.Screen name="menu" options={{ title: 'Menu', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'restaurant' : 'restaurant-outline'} color={color} focused={focused} /> }} />
      <Tabs.Screen name="cart" options={{ title: 'Cart', tabBarIcon: ({ color, focused }) => <CartIcon color={color} focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile', tabBarIcon: ({ color, focused }) => <TabBarIcon name={focused ? 'person' : 'person-outline'} color={color} focused={focused} /> }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 0,
    height: Platform.OS === 'ios' ? 82 : 68,
    paddingBottom: Platform.OS === 'ios' ? 22 : 10,
    paddingTop: 8,
    borderRadius: 0,
    ...SHADOW.md,
  },
  tabItem: { paddingTop: 4 },
  tabLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  iconContainer: { alignItems: 'center', justifyContent: 'center', width: 44, height: 36 },
  iconGlow: {
    position: 'absolute',
    width: 40,
    height: 36,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primaryGlow,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: COLORS.error,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 2,
    borderColor: COLORS.white,
    ...SHADOW.sm,
  },
  badgeText: { color: COLORS.white, fontSize: 9, fontWeight: '800' },
});
