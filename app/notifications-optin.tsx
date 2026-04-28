import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Notifications from 'expo-notifications';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';

export default function NotificationsOptInScreen() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleEnable = async () => {
    try {
      setBusy(true);
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      // We don't block the user if they decline – just continue
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  const handleSkip = () => {
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
          Allow push notifications to get real-time updates on your Dal Bafla orders.
        </Text>

        <TouchableOpacity
          style={[styles.primaryBtn, busy && { opacity: 0.7 }]}
          onPress={handleEnable}
          disabled={busy}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryText}>{busy ? 'Enabling…' : 'Turn on Notifications'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipBtn}>
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
