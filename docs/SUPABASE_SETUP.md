# Supabase Auth Setup Guide

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign up.
2. Click "New Project".
3. Name it `dal-bafla-app`.
4. Set a strong database password.
5. Choose a region close to your users, for example Singapore for India.

---

## 2. Get your API Keys

In the Supabase Dashboard:

- Go to **Settings -> API**
- Copy:
  - `Project URL` -> `EXPO_PUBLIC_SUPABASE_URL`
  - `anon / public key` or publishable key -> `EXPO_PUBLIC_SUPABASE_ANON_KEY`

---

## 3. Add to your `.env` file

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

Note:

- The app expects `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
- It also accepts `EXPO_PUBLIC_SUPABASE_KEY` as a fallback, but `EXPO_PUBLIC_SUPABASE_ANON_KEY` is the preferred name.
- Restart Expo after changing `.env`.

---

## 4. Enable Phone Auth in Supabase

1. Open **Authentication -> Providers**.
2. Enable **Phone**.
3. Connect a supported SMS provider for production OTP delivery.

Native Supabase phone providers currently include:

- Twilio
- MessageBird
- Vonage
- TextLocal (community-supported)

### Using MSG91 or another regional provider

MSG91 is not listed as a native hosted Supabase phone provider.

If you want to use MSG91, use a **Send SMS Hook** in Supabase Auth so Supabase generates the OTP and your hook sends the SMS through MSG91.

If you want the fastest setup, choose one of the native providers above instead.

---

## 5. Create the `profiles` table

In Supabase Dashboard -> **SQL Editor**, run:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT,
  name TEXT,
  email TEXT,
  addresses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can edit own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, phone)
  VALUES (NEW.id, NEW.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 6. Install required packages

```bash
npx expo install @supabase/supabase-js @react-native-async-storage/async-storage react-native-url-polyfill
```

---

## 7. Auth Flow

```text
App opens
  -> loadSession() checks AsyncStorage
  -> If session exists -> Home screen
  -> If no session -> Phone screen

Phone screen
  -> Enter 10-digit number
  -> sendOtp() -> Supabase sends SMS
  -> Navigate to OTP screen

OTP screen
  -> Enter 6-digit code
  -> verifyOtp() -> Supabase verifies
  -> First time? -> Profile Setup
  -> Returning user? -> Home screen

Profile Setup
  -> Enter name (+ optional email)
  -> Saved to profiles table
  -> Home screen
```

---

## 8. Development Testing

For local testing, use one of these:

- A real supported SMS provider in your Supabase project
- A Supabase **Send SMS Hook** wired to your own SMS service
- A self-hosted Supabase setup with test OTP configuration

Dashboard options for test phone auth can change, so check the current Supabase Auth provider settings before relying on an older toggle-based flow.

---

## 9. Go Live Checklist

- [ ] Use a supported SMS provider or a Send SMS Hook
- [ ] Confirm phone OTP works on a real device
- [ ] Set up email templates in **Authentication -> Templates**
- [ ] Enable RLS on all app tables
- [ ] Test signup, login, resend OTP, and logout
