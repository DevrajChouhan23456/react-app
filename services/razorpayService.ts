import { Alert, Linking } from 'react-native';

// Razorpay Key — replace with your actual key from https://dashboard.razorpay.com
export const RAZORPAY_KEY_ID = 'rzp_test_XXXXXXXXXXXXXXXX';

export interface RazorpayOrderPayload {
  amount: number; // in paise (rupees * 100)
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}

export interface RazorpayOrderResponse {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
  status: string;
}

export interface RazorpayPaymentOptions {
  orderId: string;
  amount: number; // in paise
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  description?: string;
}

export interface RazorpayPaymentResult {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

// ------------------------------------------------------------------
// Create Razorpay Order via your backend
// Replace BASE_URL with your real backend URL
// ------------------------------------------------------------------
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createRazorpayOrder(
  payload: RazorpayOrderPayload
): Promise<RazorpayOrderResponse> {
  const res = await fetch(`${BACKEND_URL}/payments/create-order`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to create Razorpay order');
  return res.json();
}

// ------------------------------------------------------------------
// Verify payment signature via your backend
// ------------------------------------------------------------------
export async function verifyRazorpayPayment(
  result: RazorpayPaymentResult
): Promise<{ verified: boolean }> {
  const res = await fetch(`${BACKEND_URL}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}
