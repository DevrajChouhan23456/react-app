import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { registerForPushNotifications, setupNotificationDeepLink } from '@/services/notifications';

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);

  // Register push token and wire deep-link navigation once user is known
  useEffect(() => {
    if (!user?.uid) return;
    registerForPushNotifications(user.uid);
    const cleanup = setupNotificationDeepLink();
    return cleanup;
  }, [user?.uid]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="auth" />
      </Stack>
    </>
  );
}
