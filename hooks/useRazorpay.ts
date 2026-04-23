import { useState } from 'react';
import { Alert } from 'react-native';
import {
  RAZORPAY_KEY_ID,
  createRazorpayOrder,
  verifyRazorpayPayment,
  RazorpayPaymentOptions,
  RazorpayPaymentResult,
} from '@/services/razorpayService';

// Install: npx expo install react-native-razorpay
// Docs: https://github.com/razorpay/react-native-razorpay
let RazorpayCheckout: any = null;
try {
  RazorpayCheckout = require('react-native-razorpay').default;
} catch {
  // Not installed yet — will show instructions
}

export type PaymentStatus = 'idle' | 'creating_order' | 'processing' | 'verifying' | 'success' | 'failed';

export function useRazorpay() {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const initiatePayment = async (
    options: RazorpayPaymentOptions,
    onSuccess: (paymentId: string) => void,
    onFailure?: (err: string) => void
  ) => {
    if (!RazorpayCheckout) {
      Alert.alert(
        'Razorpay Not Installed',
        'Run: npx expo install react-native-razorpay\n\nThen rebuild your app with: npx expo run:android',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setStatus('creating_order');
      setError(null);

      // Step 1 — Create order on backend
      const order = await createRazorpayOrder({
        amount: options.amount,
        currency: 'INR',
        receipt: options.orderId,
        notes: { appOrderId: options.orderId },
      });

      setStatus('processing');

      // Step 2 — Open Razorpay checkout
      const razorpayOptions = {
        description: options.description || 'Dal Bafla Order Payment',
        image: 'https://picsum.photos/seed/dalbafla/200/200',
        currency: 'INR',
        key: RAZORPAY_KEY_ID,
        amount: options.amount,
        order_id: order.id,
        name: 'Gau Stories - Dal Bafla',
        prefill: {
          email: options.customerEmail || '',
          contact: options.customerPhone,
          name: options.customerName,
        },
        theme: { color: '#FF6B00' },
      };

      const result: RazorpayPaymentResult = await RazorpayCheckout.open(razorpayOptions);

      setStatus('verifying');

      // Step 3 — Verify signature on backend
      const verification = await verifyRazorpayPayment(result);

      if (verification.verified) {
        setStatus('success');
        setPaymentId(result.razorpay_payment_id);
        onSuccess(result.razorpay_payment_id);
      } else {
        throw new Error('Payment signature verification failed');
      }
    } catch (err: any) {
      const msg = err?.description || err?.message || 'Payment failed';
      setStatus('failed');
      setError(msg);
      if (err?.code === 0) {
        // User cancelled — no alert needed
        setStatus('idle');
      } else {
        Alert.alert('Payment Failed', msg);
        onFailure?.(msg);
      }
    }
  };

  const reset = () => {
    setStatus('idle');
    setPaymentId(null);
    setError(null);
  };

  return { initiatePayment, status, paymentId, error, reset };
}
