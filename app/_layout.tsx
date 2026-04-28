import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '@/store/authStore';
import { View, ActivityIndicator } from 'react-native';
import { COLORS } from '@/constants/theme';
import * as Notifications from 'expo-notifications';
import { useOrderStore } from '@/store/orderStore';

export default function RootLayout() {
  const { session, user, loading, loadSession } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    loadSession();
  }, []);

  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === 'auth';

    if (!session) {
      if (!inAuthGroup) router.replace('/auth/phone');
    } else if (session && !user?.name) {
      router.replace('/auth/profile-setup');
    } else if (session && user?.name && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, user, loading]);

  useEffect(() => {
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data as any;
      const orderId = data?.orderId;
      if (!orderId) return;

      const { subscribeToActiveOrder, setActiveOrder } = useOrderStore.getState();
      setActiveOrder({ id: orderId } as any);
      subscribeToActiveOrder(orderId);
      router.push('/order-tracking');
    });

    return () => sub.remove();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/phone" />
        <Stack.Screen name="auth/otp" />
        <Stack.Screen name="auth/profile-setup" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="product/[id]" options={{ presentation: 'modal' }} />
        <Stack.Screen name="checkout" />
        <Stack.Screen name="order-tracking" />
      </Stack>
    </>
  );
}
