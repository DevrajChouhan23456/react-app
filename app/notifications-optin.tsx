import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

// Note: We keep this screen purely UI-only while you are using Expo Go.
// Expo Go on SDK 53 no longer supports remote push notifications via expo-notifications.
// When you build a development client, we can re-introduce the real permission logic.

export default function NotificationsOptInScreen() {
  const router = useRouter();

  const goHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <Text style={{ fontSize: 80 }}>📣</Text>
        </View>

        <Text style={styles.title}>Get updates on your order status</Text>
        <Text style={styles.subtitle}>
          Turn on notifications in your device settings later to get real-time updates on your Dal Bafla orders.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={goHome}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>Continue</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goHome} style={styles.skipBtn}>
          <Text style={styles.skipText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  content: { flex: 1, paddingHorizontal: SPACING.xl, paddingTop: SPACING.xl, alignItems: 'center' },
  illustration: { marginTop: SPACING.xl, marginBottom: SPACING.lg },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.text, width: '100%', marginBottom: SPACING.sm },
  subtitle: { fontSize: 14, color: COLORS.textMuted, lineHeight: 20, width: '100%', marginBottom: SPACING.xl },
  primaryBtn: {
    width: '100%', backgroundColor: COLORS.primary, borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md, alignItems: 'center', justifyContent: 'center', ...SHADOW.md,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  skipBtn: { marginTop: SPACING.lg },
  skipText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
});
