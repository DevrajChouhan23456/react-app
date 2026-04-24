# Supabase Auth Setup Guide

## 1. Create a Supabase Project

1. Go to https://supabase.com and sign up (free)
2. Click "New Project"
3. Name it: `dal-bafla-app`
4. Set a strong database password
5. Region: Southeast Asia (Singapore) — closest to India

---

## 2. Get your API Keys

In Supabase Dashboard:
- Go to **Settings → API**
- Copy:
  - `Project URL` → EXPO_PUBLIC_SUPABASE_URL
  - `anon / public key` → EXPO_PUBLIC_SUPABASE_ANON_KEY

---

## 3. Add to your .env file

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EXPO_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
EXPO_PUBLIC_API_URL=http://10.0.2.2:3001/api
```

---

## 4. Enable Phone Auth in Supabase

1. Dashboard → **Authentication → Providers**
2. Enable **Phone** provider
3. For testing: enable "Enable phone confirmations" toggle
4. For production: connect Twilio or MSG91

### Using MSG91 (recommended for India, cheaper than Twilio)
1. Sign up at https://msg91.com
2. Get your Auth Key and Sender ID
3. In Supabase → Auth → SMS Provider → Select MSG91
4. Enter your MSG91 credentials

---

## 5. Create the profiles table

In Supabase Dashboard → **SQL Editor**, run:

```sql
-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  phone TEXT,
  name TEXT,
  email TEXT,
  addresses JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: users can only read/write their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can edit own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
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

```
App opens
  → loadSession() checks AsyncStorage
  → If session exists → Home screen
  → If no session → Phone screen

Phone screen
  → Enter 10-digit number
  → sendOtp() → Supabase sends SMS
  → Navigate to OTP screen

OTP screen
  → Enter 6-digit code
  → verifyOtp() → Supabase verifies
  → First time? → Profile Setup
  → Returning user? → Home screen

Profile Setup
  → Enter name (+ optional email)
  → Saved to profiles table
  → Home screen
```

---

## 8. Test without SMS (Development)

In Supabase Dashboard → Auth → **Phone** provider:
- Enable "**Disable phone confirmations**" for testing
- This skips real SMS — use OTP: `123456` for any number

Or add test phone numbers:
- Dashboard → Auth → **Users** → Add user manually

---

## 9. Go Live Checklist

- [ ] Connect MSG91 or Twilio for real SMS
- [ ] Disable "Disable phone confirmations"
- [ ] Set up email templates in Auth → Templates
- [ ] Enable RLS on all tables
- [ ] Test full flow on real Android device
