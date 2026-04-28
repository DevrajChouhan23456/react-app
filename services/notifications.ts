import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/services/firebase';
import { router } from 'expo-router';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Register device for push notifications and save the token to Firestore
 * under users/{userId}.expoPushToken
 */
export async function registerForPushNotifications(userId: string): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications require a physical device.');
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied.');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync()).data;

  // Persist token to Firestore so the backend can send targeted pushes
  try {
    await updateDoc(doc(db, 'users', userId), { expoPushToken: token });
  } catch (err) {
    console.error('Failed to save push token:', err);
  }

  return token;
}

/**
 * Set up a listener that deep-links into the order tracking screen
 * when the user taps a notification that carries an orderId in its data.
 */
export function setupNotificationDeepLink() {
  // Handles taps on notifications received while app is open
  const foregroundSub = Notifications.addNotificationResponseReceivedListener((response) => {
    const orderId = response.notification.request.content.data?.orderId as string | undefined;
    if (orderId) {
      router.push(`/order/${orderId}`);
    }
  });

  // Handles taps on notifications that launched the app from terminated state
  Notifications.getLastNotificationResponseAsync().then((response) => {
    if (!response) return;
    const orderId = response.notification.request.content.data?.orderId as string | undefined;
    if (orderId) {
      router.push(`/order/${orderId}`);
    }
  });

  return () => foregroundSub.remove(); // call to clean up
}

/**
 * Helper to send a local test notification (useful during development)
 */
export async function sendLocalTestNotification(orderId: string, message: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍛 Dal Bhaffle',
      body: message,
      data: { orderId },
      sound: true,
    },
    trigger: null, // fire immediately
  });
}
