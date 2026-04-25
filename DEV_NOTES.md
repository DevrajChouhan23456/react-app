# Dev Notes — Gau Stories App

## Auth — MSG91 OTP (via FastAPI backend)

The app uses **MSG91** for OTP SMS, called via your own FastAPI backend.
The frontend never calls MSG91 directly — it calls `POST /api/auth/send-otp` and `POST /api/auth/verify-otp`.

### Dev Mode (default — no SMS sent)

In dev mode:
- Backend generates a real OTP but prints it to the **server console** instead of sending SMS
- Backend also returns `dev_otp` in the API response
- The OTP screen **auto-fills** the OTP boxes so you can verify instantly
- No MSG91 account needed

Controlled by `MSG91_DEV_MODE` in `backend/.env`:

```env
MSG91_DEV_MODE=true    # dev — OTP in console + auto-fill on screen
MSG91_DEV_MODE=false   # production — real SMS via MSG91
```

### Production Setup (MSG91 real SMS)

#### Step 1 — Create MSG91 account
1. Go to https://msg91.com
2. Sign up → verify mobile
3. Free trial gives ₹0 credit — add ₹500 for production

#### Step 2 — Get API credentials
1. Dashboard → **API** → copy **Auth Key**
2. Dashboard → **SMS** → **OTP** → **Flow** → create OTP template:
   - Template: `Your Gau Stories OTP is ##OTP##. Valid for 5 minutes.`
   - Copy **Flow/Template ID**
3. Sender ID: `GAUSTRY` (6 chars, register under SMS → Sender ID)

#### Step 3 — Add to backend/.env

```env
MSG91_AUTH_KEY=your_auth_key_here
MSG91_TEMPLATE_ID=your_flow_template_id_here
MSG91_SENDER_ID=GAUSTRY
MSG91_DEV_MODE=false
```

#### Step 4 — Restart backend
```bash
python -m uvicorn main:app --reload --port 3001
```

---

## Backend Setup (FastAPI)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate       # Windows PowerShell
# source .venv/bin/activate  # macOS/Linux
python -m pip install -r requirements.txt
python -m uvicorn main:app --reload --port 3001
```

API docs: http://localhost:3001/docs

### backend/.env

```env
# MSG91 OTP
MSG91_AUTH_KEY=your_auth_key
MSG91_TEMPLATE_ID=your_template_id
MSG91_SENDER_ID=GAUSTRY
MSG91_DEV_MODE=true

# Supabase (for menu/orders DB)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Frontend env (react-app/.env)

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_DEV_AUTH=true
# EXPO_PUBLIC_API_URL=http://192.168.X.X:3001/api
```

---

## Auth Flow

```
User enters phone
      ↓
POST /api/auth/send-otp  →  MSG91 sends SMS (or logs in dev)
      ↓
User enters OTP
      ↓
POST /api/auth/verify-otp  →  returns user_id + phone
      ↓
Profile setup (if new user)
      ↓
Home screen
```

---

## Current Feature Status

| Feature | Status |
|---|---|
| Phone login screen | ✅ Done |
| OTP screen (auto-fill in dev) | ✅ Done |
| MSG91 OTP backend service | ✅ Done |
| Profile setup | ✅ Done |
| Home / Menu | ✅ Done |
| Product detail | ✅ Done |
| Cart | ✅ Done |
| Checkout | ✅ Done |
| Order tracking | ✅ Done |
| FastAPI backend | ✅ Done |
| Supabase DB | ✅ Connected |
| Real MSG91 SMS | ⏳ Add API keys in backend/.env |
| Razorpay payment | ⏳ Add API keys |
