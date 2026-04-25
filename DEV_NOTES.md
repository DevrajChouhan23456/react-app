# Dev Notes — Gau Stories App

## Auth — Dev Mode (OTP Bypass)

By default the app runs in **dev mode** where:
- Any 10-digit phone number is accepted
- OTP is always **`123456`**
- No SMS provider or Supabase phone config needed

Controlled by `EXPO_PUBLIC_DEV_AUTH` env var in `.env`:

```env
# .env (in react-app/)
EXPO_PUBLIC_DEV_AUTH=true    # dev mode — OTP is always 123456
EXPO_PUBLIC_DEV_AUTH=false   # production — real Supabase SMS OTP
```

### To enable real SMS OTP (production)

1. Go to [Supabase Dashboard](https://supabase.com) → your project
2. **Authentication → Providers → Phone** → Enable
3. Choose SMS provider: **Twilio** (recommended for India)
   - Sign up at twilio.com (free trial available)
   - Get Account SID, Auth Token, and a phone number
   - Enter in Supabase phone provider settings
4. Set `EXPO_PUBLIC_DEV_AUTH=false` in `.env`
5. Restart Expo: `npx expo start --clear`

---

## Backend (FastAPI + Supabase)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate     # Windows
source .venv/bin/activate  # macOS/Linux
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 3001
```

API docs: http://localhost:3001/docs

### Backend env vars (backend/.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret
```

---

## Frontend env vars (react-app/.env)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DEV_AUTH=true
# EXPO_PUBLIC_API_URL=http://192.168.X.X:3001/api
```

---

## Current Status

| Feature | Status |
|---|---|
| Phone login screen | ✅ Done |
| OTP screen | ✅ Done |
| Profile setup | ✅ Done |
| Home / Menu | ✅ Done |
| Product detail | ✅ Done |
| Cart | ✅ Done |
| Checkout | ✅ Done |
| Order tracking | ✅ Done |
| FastAPI backend | ✅ Done |
| Supabase DB | ✅ Connected |
| Real SMS OTP | ⏳ Configure Twilio |
| Razorpay payment | ⏳ Add API keys |
