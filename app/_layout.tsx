import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { registerForPushNotifications, setupNotificationDeepLink } from '@/services/notifications';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#C8420F',
    secondary: '#5A3FC0',
  },
};

export default function RootLayout() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!user?.uid) return;
    registerForPushNotifications(user.uid);
    const cleanup = setupNotificationDeepLink();
    return cleanup;
  }, [user?.uid]);

  return (
    <PaperProvider theme={theme}>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="order/[id]" />
        <Stack.Screen name="auth" />
      </Stack>
    </PaperProvider>
  );
}
