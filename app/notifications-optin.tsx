import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { COLORS, SPACING, RADIUS, SHADOW } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { registerForPushNotificationsAsync } from '@/services/notifications';

export default function NotificationsOptInScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);

  const goHome = () => {
    router.replace('/(tabs)');
  };

  const handleEnable = async () => {
    setLoading(true);
    try {
      await registerForPushNotificationsAsync(user?.id);
    } catch (e) {
      console.log('Notification setup error', e);
    }
    setLoading(false);
    goHome();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <View style={styles.illustration}>
          <Text style={{ fontSize: 80 }}>📣</Text>
        </View>

        <Text style={styles.title}>Get updates on your order status</Text>
        <Text style={styles.subtitle}>
          Turn on notifications to get real-time updates when your Dal Bafla order is accepted, prepared and delivered.
        </Text>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={handleEnable}
          activeOpacity={0.85}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryText}>Enable notifications</Text>
          )}
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
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.md,
  },
  primaryText: { color: '#fff', fontSize: 15, fontWeight: '800' },
  skipBtn: { marginTop: SPACING.lg },
  skipText: { fontSize: 14, fontWeight: '600', color: COLORS.textMuted },
});
