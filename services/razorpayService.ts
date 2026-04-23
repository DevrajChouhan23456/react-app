// Razorpay Web Checkout via WebView — works with Expo 55 + React 19
// No native module needed. Just react-native-webview.

export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXXXXXX';
const BACKEND_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3001/api';

export interface RazorpayOrderPayload {
  amount: number; // in paise
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

export async function verifyRazorpayPayment(result: {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}): Promise<{ verified: boolean }> {
  const res = await fetch(`${BACKEND_URL}/payments/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(result),
  });
  if (!res.ok) throw new Error('Payment verification failed');
  return res.json();
}

// Generates the full HTML page that opens Razorpay checkout inside WebView
export function getRazorpayHTML(options: {
  keyId: string;
  orderId: string;
  amount: number;
  name: string;
  description: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
}): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #f7f7f7; font-family: -apple-system, sans-serif;
           display: flex; align-items: center; justify-content: center;
           min-height: 100vh; }
    .loading { text-align: center; color: #666; }
    .loader { width: 48px; height: 48px; border: 4px solid #eee;
              border-top-color: #FF6B00; border-radius: 50%;
              animation: spin 0.8s linear infinite; margin: 0 auto 16px; }
    @keyframes spin { to { transform: rotate(360deg); } }
    p { font-size: 15px; }
  </style>
</head>
<body>
  <div class="loading">
    <div class="loader"></div>
    <p>Opening payment...</p>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    window.onload = function() {
      var options = {
        key: '${options.keyId}',
        amount: ${options.amount},
        currency: 'INR',
        name: '${options.name}',
        description: '${options.description}',
        order_id: '${options.orderId}',
        prefill: {
          name: '${options.customerName}',
          contact: '${options.customerPhone}',
          email: '${options.customerEmail}'
        },
        theme: { color: '#FF6B00' },
        modal: { backdropclose: false, escape: false },
        handler: function(response) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'PAYMENT_SUCCESS',
            data: response
          }));
        }
      };

      var rzp = new Razorpay(options);

      rzp.on('payment.failed', function(response) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'PAYMENT_FAILED',
          data: response.error
        }));
      });

      rzp.open();
    };
  </script>
</body>
</html>
  `;
}
