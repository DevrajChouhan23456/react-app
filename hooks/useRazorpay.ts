import { useState } from 'react';
import { Alert } from 'react-native';
import {
  assertRazorpayCheckoutConfigured,
  createRazorpayOrder,
  verifyRazorpayPayment,
} from '@/services/razorpayService';

export type PaymentStatus =
  | 'idle'
  | 'creating_order'
  | 'awaiting_payment'
  | 'verifying'
  | 'success'
  | 'failed';

export interface RazorpayPaymentOptions {
  appOrderId: string;
  amount: number;       // in rupees (we convert to paise internally)
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

export function useRazorpay() {
  const [status, setStatus] = useState<PaymentStatus>('idle');
  const [razorpayOrderId, setRazorpayOrderId] = useState<string | null>(null);
  const [amountPaise, setAmountPaise] = useState<number>(0);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [webViewVisible, setWebViewVisible] = useState(false);
  const [pendingOptions, setPendingOptions] = useState<RazorpayPaymentOptions | null>(null);

  // Step 1 — called from checkout screen
  const initiatePayment = async (options: RazorpayPaymentOptions) => {
    try {
      assertRazorpayCheckoutConfigured();
      setStatus('creating_order');
      setError(null);
      setPendingOptions(options);

      const paise = options.amount * 100;
      const order = await createRazorpayOrder({
        amount: paise,
        currency: 'INR',
        receipt: options.appOrderId,
        notes: { appOrderId: options.appOrderId },
      });

      setRazorpayOrderId(order.id);
      setAmountPaise(paise);
      setStatus('awaiting_payment');
      setWebViewVisible(true);
    } catch (err: any) {
      setStatus('failed');
      setError(err.message);
      Alert.alert('Payment unavailable', err.message || 'Could not initiate payment. Please try again.');
    }
  };

  // Step 2 — called by RazorpayWebView on success
  const handlePaymentSuccess = async (
    rpPaymentId: string,
    rpOrderId: string,
    rpSignature: string,
    onSuccess: (paymentId: string) => void
  ) => {
    setWebViewVisible(false);
    setStatus('verifying');
    try {
      const result = await verifyRazorpayPayment({
        razorpay_payment_id: rpPaymentId,
        razorpay_order_id: rpOrderId,
        razorpay_signature: rpSignature,
      });
      if (result.verified) {
        setStatus('success');
        setPaymentId(rpPaymentId);
        onSuccess(rpPaymentId);
      } else {
        throw new Error('Signature verification failed');
      }
    } catch (err: any) {
      setStatus('failed');
      setError(err.message);
      Alert.alert('Payment Error', err.message || 'Could not verify payment. Contact support.');
    }
  };

  const handlePaymentFailure = (errMsg: string) => {
    setWebViewVisible(false);
    setStatus('failed');
    setError(errMsg);
    Alert.alert('Payment Failed', errMsg);
  };

  const dismissWebView = () => {
    setWebViewVisible(false);
    setStatus('idle');
  };

  const reset = () => {
    setStatus('idle');
    setPaymentId(null);
    setError(null);
    setRazorpayOrderId(null);
    setWebViewVisible(false);
    setPendingOptions(null);
  };

  return {
    initiatePayment,
    handlePaymentSuccess,
    handlePaymentFailure,
    dismissWebView,
    reset,
    status,
    paymentId,
    error,
    webViewVisible,
    razorpayOrderId,
    amountPaise,
    pendingOptions,
  };
}
