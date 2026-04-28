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

    const loc = await Location.getCurrentPositionAsync({});
    setStatusText(`Location turned on.\nLat ${loc.coords.latitude.toFixed(3)}, Lng ${loc.coords.longitude.toFixed(3)}`);
    // Later we can reverse-geocode and save area name into a store so the home header updates.
  };

  const handleSave = () => {
    // For now, simply go back to home tabs.
    router.back();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Select Your Location</Text>
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
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Turn on Location</Text>
          <Switch
            value={usingLocation}
            onValueChange={handleToggleLocation}
            thumbColor={usingLocation ? COLORS.primary : '#f4f3f4'}
            trackColor={{ false: '#E1E1E1', true: COLORS.primaryGlow }}
          />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyCircle}>
            <Ionicons name="lock-closed-outline" size={28} color={COLORS.textFaint} />
          </View>
          <Text style={styles.emptyText}>{statusText}</Text>
        </View>

        <TouchableOpacity style={styles.primaryBtn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.primaryText}>Save & Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F7FA' },
  header: { paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, paddingBottom: SPACING.md },
  title: { fontSize: 20, fontWeight: '800', color: COLORS.text },
  content: { flex: 1, paddingHorizontal: SPACING.xl },
  searchRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: RADIUS.xl, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...SHADOW.sm,
  },
  searchInput: { flex: 1, marginLeft: SPACING.sm, fontSize: 14, color: COLORS.text },
  toggleRow: {
    marginTop: SPACING.lg, flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', backgroundColor: '#fff', borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
  },
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
    alignItems: 'center', justifyContent: 'center',
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
