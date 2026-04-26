import httpx
import random
import time
import os

# ─── CONFIG ──────────────────────────────────────────────────────────────────
MSG91_AUTH_KEY  = os.getenv("MSG91_AUTH_KEY", "")
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "OTPSMS")
DEV_MODE        = os.getenv("MSG91_DEV_MODE", "true").lower() == "true"

# OTP config
OTP_LENGTH         = 6
OTP_EXPIRY_MINUTES = 5

# Dev-mode fallback store (only used when MSG91_DEV_MODE=true)
_dev_otp_store: dict[str, dict] = {}


def _normalize(phone: str) -> str:
    """Return 10-digit number, strip +91 / 91 prefix."""
    p = phone.lstrip("+")
    if p.startswith("91") and len(p) == 12:
        p = p[2:]
    return p


# ─── SEND OTP ────────────────────────────────────────────────────────────────
async def send_otp(phone: str) -> dict:
    """
    Send OTP via MSG91 simple OTP API  (no Flow / template needed).
    MSG91 generates + stores the OTP on their side — we just verify later.

    Dev mode  → prints OTP to console, stores in _dev_otp_store.
    Prod mode → calls https://api.msg91.com/api/v5/otp
    """
    normalized = _normalize(phone)

    # ── DEV MODE ─────────────────────────────────────────────────────────────
    if DEV_MODE or not MSG91_AUTH_KEY:
        otp = str(random.randint(100000, 999999))
        _dev_otp_store[normalized] = {
            "otp": otp,
            "expires_at": time.time() + OTP_EXPIRY_MINUTES * 60,
        }
        print(f"[MSG91 DEV] OTP for +91{normalized} → {otp}")
        return {
            "success": True,
            "message": "OTP sent (dev mode — check server console)",
            "dev_otp": otp,
        }

    # ── PRODUCTION — MSG91 OTP API ────────────────────────────────────────────
    # No template_id or flow_id required.
    # MSG91 sends a default OTP SMS and stores it server-side for verification.
    url = "https://api.msg91.com/api/v5/otp"
    params = {
        "template_id": os.getenv("MSG91_TEMPLATE_ID", ""),  # optional but recommended
        "mobile":      f"91{normalized}",
        "authkey":     MSG91_AUTH_KEY,
        "otp_length":  str(OTP_LENGTH),
        "otp_expiry":  str(OTP_EXPIRY_MINUTES),
    }
    # Remove template_id from params if not set — MSG91 uses default template
    if not params["template_id"]:
        del params["template_id"]

    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=10)
            data = resp.json()

        if data.get("type") == "success":
            return {"success": True, "message": "OTP sent successfully"}
        else:
            return {
                "success": False,
                "message": data.get("message", "MSG91: failed to send OTP"),
            }
    except Exception as e:
        return {"success": False, "message": f"Network error: {str(e)}"}


# ─── VERIFY OTP ──────────────────────────────────────────────────────────────
async def verify_otp_async(phone: str, otp: str) -> dict:
    """
    Verify OTP.
    Dev mode  → checks _dev_otp_store.
    Prod mode → calls https://api.msg91.com/api/v5/otp/verify  (MSG91 manages store).
    """
    normalized = _normalize(phone)

    # ── DEV MODE ─────────────────────────────────────────────────────────────
    if DEV_MODE or not MSG91_AUTH_KEY:
        record = _dev_otp_store.get(normalized)
        if not record:
            return {"success": False, "message": "OTP not found. Please request a new one."}
        if time.time() > record["expires_at"]:
            _dev_otp_store.pop(normalized, None)
            return {"success": False, "message": "OTP expired. Please request a new one."}
        if record["otp"] != otp:
            return {"success": False, "message": "Invalid OTP. Please try again."}
        _dev_otp_store.pop(normalized, None)
        return {"success": True, "message": "OTP verified successfully"}

    # ── PRODUCTION — MSG91 OTP Verify API ────────────────────────────────────
    url = "https://api.msg91.com/api/v5/otp/verify"
    params = {
        "mobile":  f"91{normalized}",
        "otp":     otp,
        "authkey": MSG91_AUTH_KEY,
    }
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, params=params, timeout=10)
            data = resp.json()

        if data.get("type") == "success":
            return {"success": True, "message": "OTP verified successfully"}
        else:
            return {
                "success": False,
                "message": data.get("message", "Invalid OTP. Please try again."),
            }
    except Exception as e:
        return {"success": False, "message": f"Network error: {str(e)}"}


# ─── SYNC WRAPPER (kept for backward compat with auth.py verify route) ───────
def verify_otp(phone: str, otp: str) -> dict:
    """
    Sync wrapper — runs the async verify in a new event loop.
    auth.py calls this directly; switching to async later is recommended.
    """
    import asyncio
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            # Already inside an async context (FastAPI) — use thread
            import concurrent.futures
            with concurrent.futures.ThreadPoolExecutor() as pool:
                future = pool.submit(asyncio.run, verify_otp_async(phone, otp))
                return future.result()
        return loop.run_until_complete(verify_otp_async(phone, otp))
    except Exception as e:
        return {"success": False, "message": str(e)}
