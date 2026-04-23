# Razorpay Setup Guide (WebView — Expo 55 Compatible)

## Why WebView?

`react-native-razorpay` does NOT support New Architecture (React 19 / Expo 55).
This app uses Razorpay Web Checkout embedded in a WebView — zero native modules,
works perfectly with Expo Go and development builds.

---

## 1. Install the only required package

```bash
npx expo install react-native-webview
```

That's it. No other Razorpay package needed.

---

## 2. Get your Razorpay API Keys

1. Sign up at https://dashboard.razorpay.com
2. Settings → API Keys → Generate Test Key
3. Copy Key ID and Key Secret

---

## 3. Add keys to your .env file

Create `.env` in project root:
```
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

> Note: `10.0.2.2` is Android emulator's localhost.
> For real device, use your PC's local IP: `http://192.168.x.x:3001/api`

---

## 4. Backend setup

The backend routes are in `backend/payments/razorpay.js`.

```bash
cd backend
npm install razorpay express
```

Add to your Express app:
```js
const paymentRoutes = require('./payments/razorpay');
app.use('/api/payments', paymentRoutes);
```

Add to backend `.env`:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

---

## 5. Payment Flow

```
User taps "Pay ₹180 Online"
    ↓
App calls backend → POST /api/payments/create-order
    ↓
Backend creates Razorpay order → returns order_id
    ↓
App opens RazorpayWebView (Modal with WebView)
    ↓
Razorpay Web Checkout loads inside WebView
    ↓
User pays via UPI / Card / Netbanking
    ↓
WebView sends message → App receives payment result
    ↓
App calls backend → POST /api/payments/verify (HMAC check)
    ↓
Order placed → navigates to Order Tracking
```

---

## 6. Test Credentials

### Test Cards
| Card Number         | Expiry | CVV | Result  |
|---------------------|--------|-----|---------|
| 4111 1111 1111 1111 | Any    | Any | Success |
| 4000 0000 0000 0002 | Any    | Any | Failure |

### Test UPI
- `success@razorpay` → Success
- `failure@razorpay` → Failure

### Test Netbanking
- Select any bank → Use test credentials shown on page

---

## 7. Go Live Checklist

- [ ] Replace `rzp_test_` key with `rzp_live_` key
- [ ] Enable payment methods in Razorpay Dashboard
- [ ] Set webhook URL: Dashboard → Settings → Webhooks
- [ ] Test with real ₹1 transaction
- [ ] Add GST info to your Razorpay account
