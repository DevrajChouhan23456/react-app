import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { MENU_ITEMS, MENU_CATEGORIES } from '@/constants/data';
import FoodCard from '@/components/FoodCard';
import { useCartStore } from '@/store/cartStore';

export default function MenuScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let items = MENU_ITEMS;
    if (activeCategory !== 'All') {
      items = items.filter((i) => i.category === activeCategory);
    }
    if (search.trim()) {
      items = items.filter((i) =>
        i.name.toLowerCase().includes(search.toLowerCase()) ||
        i.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    return items;
  }, [activeCategory, search]);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🍽️ Our Menu</Text>
        <Text style={styles.subtitle}>Fresh daily from Bhopal kitchen</Text>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          placeholderTextColor={COLORS.textFaint}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryScroll}
        contentContainerStyle={{ paddingHorizontal: SPACING.base }}
      >
        {MENU_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            style={[styles.catChip, activeCategory === cat.name && styles.catChipActive]}
            onPress={() => setActiveCategory(cat.name)}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={[styles.catName, activeCategory === cat.name && styles.catNameActive]}>
              {cat.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

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
          </View>
        ) : (
          filtered.map((item) => (
            <FoodCard
              key={item.id}
              item={item}
              onPress={() => router.push(`/product/${item.id}`)}
              onAdd={() =>
                addItem({ id: item.id, name: item.name, price: item.price, image: item.image, quantity: 1, selectedAddons: [] })
              }
            />
          ))
        )}
        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { paddingHorizontal: SPACING.base, paddingTop: SPACING.base, paddingBottom: SPACING.sm },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text },
  subtitle: { fontSize: 13, color: COLORS.textMuted, marginTop: 2 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, backgroundColor: COLORS.surface, marginHorizontal: SPACING.base, borderRadius: RADIUS.lg, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, marginBottom: SPACING.sm, ...SHADOW.sm },
  searchInput: { flex: 1, fontSize: 14, color: COLORS.text },
  categoryScroll: { marginBottom: SPACING.sm, flexGrow: 0 },
  catChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface, marginRight: SPACING.sm, borderWidth: 1.5, borderColor: COLORS.border },
  catChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  catIcon: { fontSize: 14 },
  catName: { fontSize: 13, fontWeight: '600', color: COLORS.textMuted },
  catNameActive: { color: COLORS.white },
  list: { flex: 1 },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyIcon: { fontSize: 48, marginBottom: SPACING.md },
  emptyText: { fontSize: 16, fontWeight: '700', color: COLORS.text },
  emptyDesc: { fontSize: 13, color: COLORS.textMuted, marginTop: 4 },
});
