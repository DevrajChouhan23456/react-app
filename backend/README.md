# Python FastAPI Backend Setup

This backend powers the **Dal Bafla React Native app**.

## Features
- Menu API
- Orders API
- Razorpay payment create/verify
- Supabase JWT verify
- Sales analytics
- MSG91 owner notifications
- Auto API docs via FastAPI

## 1. Create Python environment

```bash
cd backend
python -m venv .venv
```

### Windows
```bash
.venv\Scripts\activate
```

### macOS / Linux
```bash
source .venv/bin/activate
```

## 2. Install dependencies

```bash
pip install -r requirements.txt
```

## 3. Add environment variables

```bash
cp .env.example .env
```

Fill these values in `.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `MSG91_AUTH_KEY`
- `OWNER_PHONE`

## 4. Run the server

```bash
uvicorn main:app --reload --port 3001
```

## 5. Open API docs

```bash
http://localhost:3001/docs
```

## Main routes
- `GET /api/menu/`
- `POST /api/menu/`
- `POST /api/orders/`
- `GET /api/orders/`
- `POST /api/payments/create`
- `POST /api/payments/verify`
- `GET /api/auth/verify?token=...`
- `GET /api/analytics/sales-summary`

## Notes
- Menu and orders are using in-memory mock storage right now.
- Next step: connect orders/menu to Supabase Postgres tables.
- Razorpay returns mock response until keys are configured.
- MSG91 notification only sends after auth key + owner phone are set.
