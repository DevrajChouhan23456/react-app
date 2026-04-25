import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW, TYPOGRAPHY } from '@/constants/theme';
import { MENU_ITEMS, MENU_CATEGORIES } from '@/constants/data';
import FoodCard from '@/components/FoodCard';
import { useCartStore } from '@/store/cartStore';

export default function MenuScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const searchFocusAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(headerAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const filtered = useMemo(() => {
    let items = MENU_ITEMS;
    if (activeCategory !== 'All') items = items.filter((i) => i.category === activeCategory);
    if (search.trim()) items = items.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase()));
    return items;
  }, [activeCategory, search]);

  const onSearchFocus = () => Animated.timing(searchFocusAnim, { toValue: 1, duration: 200, useNativeDriver: false }).start();
  const onSearchBlur = () => Animated.timing(searchFocusAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
  const borderColor = searchFocusAnim.interpolate({ inputRange: [0, 1], outputRange: [COLORS.borderWarm, COLORS.primary] });

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <Animated.View style={[styles.header, { opacity: headerAnim, transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [-10, 0] }) }] }]}>
        <View>
          <Text style={styles.title}>Our Menu 🍽️</Text>
          <Text style={styles.subtitle}>Fresh daily from Bhopal kitchen</Text>
        </View>
        <View style={styles.countBadge}>
          <Text style={styles.countText}>{filtered.length} items</Text>
        </View>
      </Animated.View>

      {/* Search */}
      <Animated.View style={[styles.searchRow, { borderColor }]}>
        <View style={styles.searchIconWrap}>
          <Ionicons name="search" size={16} color={COLORS.primary} />
        </View>
        <TextInput
          style={styles.searchInput}
          placeholder="Search dal bafla, thali..."
          placeholderTextColor={COLORS.textFaint}
          value={search}
          onChangeText={setSearch}
          onFocus={onSearchFocus}
          onBlur={onSearchBlur}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </Animated.View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: SPACING.base, gap: SPACING.sm }}
      >
        {MENU_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, activeCategory === cat.name && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.name)}
            activeOpacity={0.75}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catName, activeCategory === cat.name && styles.catNameActive]}>{cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Result count line */}
      {search || activeCategory !== 'All' ? (
        <View style={styles.resultRow}>
          <Text style={styles.resultText}>{filtered.length} result{filtered.length !== 1 ? 's' : ''} found</Text>
          {(search || activeCategory !== 'All') && (
            <TouchableOpacity onPress={() => { setSearch(''); setActiveCategory('All'); }}>
              <Text style={styles.clearAllText}>Clear filters</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : null}

      {/* Items */}
      <ScrollView
        style={styles.list}
        contentContainerStyle={{ padding: SPACING.base }}
        showsVerticalScrollIndicator={false}
      >
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyText}>No items found</Text>
            <Text style={styles.emptyDesc}>Try a different search or category</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => { setSearch(''); setActiveCategory('All'); }}>
              <Text style={styles.emptyBtnText}>Clear search</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAdd={() => addItem({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, selectedAddons: [] })}
            />
          ))
        )}
        <View style={{ height: SPACING.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.md },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2, fontWeight: '500' },
  countBadge: { backgroundColor: COLORS.primaryGlow, paddingHorizontal: SPACING.md, paddingVertical: 6, borderRadius: RADIUS.full },
  countText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: SPACING.md, borderWidth: 1.5, ...SHADOW.sm },
  searchIconWrap: { width: 30, height: 30, backgroundColor: COLORS.primaryGlow, borderRadius: RADIUS.md, alignItems: 'center', justifyContent: 'center' },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text, fontWeight: '500' },
  clearBtn: { padding: 2 },
  categoryScroll: { marginBottom: SPACING.sm, flexGrow: 0 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.borderWarm },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary, ...SHADOW.sm },
  catIcon: { fontSize: 14 },
  catName: { fontSize: 13, fontWeight: '700', color: COLORS.textMuted },
  catNameActive: { color: COLORS.white },
  resultRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: SPACING.base, marginBottom: SPACING.sm },
  resultText: { fontSize: 12, color: COLORS.textMuted, fontWeight: '600' },
  clearAllText: { fontSize: 12, color: COLORS.primary, fontWeight: '700' },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 56, marginBottom: SPACING.md },
  emptyText: { ...TYPOGRAPHY.h3, color: COLORS.text },
  emptyDesc: { fontSize: 14, color: COLORS.textMuted, marginTop: 4, marginBottom: SPACING.xl },
  emptyBtn: { backgroundColor: COLORS.primaryGlow, paddingHorizontal: SPACING.xl, paddingVertical: SPACING.md, borderRadius: RADIUS.full },
  emptyBtnText: { color: COLORS.primary, fontWeight: '800', fontSize: 14 },
});
