# Razorpay Integration Guide

## 1. Get your API Keys

1. Sign up at [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings → API Keys**
3. Generate test keys for development
4. Copy `Key ID` and `Key Secret`

---

## 2. Install the React Native SDK

```bash
npx expo install react-native-razorpay

# Then rebuild (required — this is a native module)
npx expo run:android
# OR
npx expo run:ios
```

> ⚠️ Razorpay uses native code — it does NOT work with Expo Go.
> You must use a **development build** or production APK.

---

## 3. Add your Key ID to the app

Edit `services/razorpayService.ts`:

```ts
export const RAZORPAY_KEY_ID = 'rzp_test_YOUR_KEY_HERE';
```

Or better — use an environment variable:

Create `.env` in the project root:
```
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_YOUR_KEY_HERE
EXPO_PUBLIC_API_URL=https://your-backend.com/api
```

Then in `razorpayService.ts`:
```ts
export const RAZORPAY_KEY_ID = process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID!;
```

---

## 4. Set up the Backend

The backend routes are in `backend/payments/razorpay.js`.

### Install dependencies:
```bash
npm install razorpay crypto express
```

### Add to your Express app:
```js
const paymentRoutes = require('./payments/razorpay');
app.use('/api/payments', paymentRoutes);
```

### Add environment variables to backend `.env`:
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

---

## 5. Payment Flow

```
User taps "Pay ₹180"
    ↓
App calls backend POST /api/payments/create-order
    ↓
Backend creates Razorpay order → returns order_id
    ↓
App opens Razorpay checkout sheet (UPI / Card / Netbanking)
    ↓
User completes payment
    ↓
App calls backend POST /api/payments/verify
    ↓
Backend verifies HMAC signature → confirms payment
    ↓
Order placed → navigates to Order Tracking
```

---

## 6. Test Cards

| Card Number        | Expiry | CVV | Result  |
|--------------------|--------|-----|---------|
| 4111 1111 1111 1111 | Any    | Any | Success |
| 5267 3181 8797 5449 | Any    | Any | Success |
| 4000 0000 0000 0002 | Any    | Any | Failure |

### Test UPI
- UPI ID: `success@razorpay` → Payment success
- UPI ID: `failure@razorpay` → Payment failure

---

## 7. Go Live Checklist

- [ ] Replace `rzp_test_` keys with `rzp_live_` keys
- [ ] Enable required payment methods in Razorpay Dashboard
- [ ] Set up webhook URL in Dashboard → Settings → Webhooks
- [ ] Test with real ₹1 transaction before launch
- [ ] Enable GST invoice in Razorpay Dashboard if needed
