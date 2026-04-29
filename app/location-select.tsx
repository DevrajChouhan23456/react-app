import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

export default function LocationSelectScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [usingLocation, setUsingLocation] = useState(false);
  const [statusText, setStatusText] = useState('Looks like you\'re logged out\nPlease log in to see saved addresses');

  const handleToggleLocation = async (value: boolean) => {
    setUsingLocation(value);
    if (!value) {
      setStatusText('Looks like you\'re logged out\nPlease log in to see saved addresses');
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setStatusText('Location permission denied. You can still search manually.');
      setUsingLocation(false);
      return;
    }

    try {
      const loc = await Location.getCurrentPositionAsync({});
      setStatusText(`Location detected!\nLat ${loc.coords.latitude.toFixed(3)}, Lng ${loc.coords.longitude.toFixed(3)}`);
    } catch {
      setStatusText('Could not get location. Please search manually.');
      setUsingLocation(false);
    }
  };

  const handleSave = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* ── Header with Back Button ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Select Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={COLORS.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search an area or address"
            placeholderTextColor={COLORS.textFaint}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.toggleRow}>
          <View style={styles.toggleLeft}>
            <Ionicons name="navigate" size={18} color={COLORS.primary} />
            <Text style={styles.toggleLabel}>Use my current location</Text>
          </View>
          <Switch
            value={usingLocation}
            onValueChange={handleToggleLocation}
            thumbColor={usingLocation ? COLORS.primary : '#f4f3f4'}
            trackColor={{ false: '#E1E1E1', true: COLORS.primaryGlow }}
          />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Ionicons
              name={usingLocation ? 'location' : 'lock-closed-outline'}
              size={28}
              color={usingLocation ? COLORS.primary : COLORS.textFaint}
            />
          </View>
          <Text style={styles.emptyText}>{statusText}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85}>
          <Ionicons name="checkmark-circle" size={18} color="#fff" />
          <Text style={styles.primaryText}>Save &amp; Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7FA' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: SPACING.base, paddingVertical: SPACING.md,
    backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 17, fontWeight: '800', color: COLORS.text },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.lg },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...SHADOW.sm,
  },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: 14, color: COLORS.text },
  toggleRow: {
    marginTop: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, ...SHADOW.sm,
  },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  toggleLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyCircle: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#E6E7F0',
    alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  emptyText: { fontSize: 14, color: COLORS.textMuted, textAlign: 'center', lineHeight: 20 },
  primaryBtn: {
    marginBottom: SPACING.xl, backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl, paddingVertical: SPACING.md,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
