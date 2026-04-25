import httpx
import random
import time
import os
from typing import Optional

# In-memory OTP store: { phone: { otp, expires_at } }
# In production, use Redis for this.
_otp_store: dict[str, dict] = {}

MSG91_AUTH_KEY = os.getenv("MSG91_AUTH_KEY", "")
MSG91_TEMPLATE_ID = os.getenv("MSG91_TEMPLATE_ID", "")
MSG91_SENDER_ID = os.getenv("MSG91_SENDER_ID", "GAUSTRY")
DEV_MODE = os.getenv("MSG91_DEV_MODE", "true").lower() == "true"

OTP_EXPIRY_SECONDS = 300  # 5 minutes


def _generate_otp() -> str:
    return str(random.randint(100000, 999999))


async def send_otp(phone: str) -> dict:
    """
    Send OTP to phone via MSG91.
    In dev mode (MSG91_DEV_MODE=true), skips real SMS and logs OTP to console.
    Returns { success, message, otp (dev only) }
    """
    # Normalize phone: remove +91 prefix if present
    normalized = phone.lstrip("+")
    if normalized.startswith("91") and len(normalized) == 12:
        normalized = normalized[2:]

    otp = _generate_otp()
    expires_at = time.time() + OTP_EXPIRY_SECONDS
    _otp_store[normalized] = {"otp": otp, "expires_at": expires_at}

    if DEV_MODE or not MSG91_AUTH_KEY:
        # Dev mode — print OTP to console, no SMS sent
        print(f"[MSG91 DEV] OTP for +91{normalized} → {otp}")
        return {
            "success": True,
            "message": "OTP sent (dev mode — check server console)",
            "dev_otp": otp,  # returned in response for dev testing
        }

    # Production — send real SMS via MSG91 Flow API
    url = "https://control.msg91.com/api/v5/flow/"
    payload = {
        "flow_id": MSG91_TEMPLATE_ID,
        "sender": MSG91_SENDER_ID,
        "mobiles": f"91{normalized}",
        "OTP": otp,  # MSG91 template variable
    }
    headers = {
        "authkey": MSG91_AUTH_KEY,
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient() as client:
        resp = await client.post(url, json=payload, headers=headers, timeout=10)
        data = resp.json()

    if resp.status_code == 200 and data.get("type") == "success":
        return {"success": True, "message": "OTP sent successfully"}
    else:
        # Clean up store on failure
        _otp_store.pop(normalized, None)
        return {"success": False, "message": data.get("message", "Failed to send OTP")}


def verify_otp(phone: str, otp: str) -> dict:
    """
    Verify OTP entered by user.
    Returns { success, message }
    """
    normalized = phone.lstrip("+")
    if normalized.startswith("91") and len(normalized) == 12:
        normalized = normalized[2:]

    record = _otp_store.get(normalized)

    if not record:
        return {"success": False, "message": "OTP not found. Please request a new one."}

    if time.time() > record["expires_at"]:
        _otp_store.pop(normalized, None)
        return {"success": False, "message": "OTP expired. Please request a new one."}

    if record["otp"] != otp:
        return {"success": False, "message": "Invalid OTP. Please try again."}

    # OTP matched — clear it (one-time use)
    _otp_store.pop(normalized, None)
    return {"success": True, "message": "OTP verified successfully"}
