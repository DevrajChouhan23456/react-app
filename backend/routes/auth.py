from fastapi import APIRouter
from pydantic import BaseModel
from services.msg91Service import send_otp, verify_otp

router = APIRouter()


class SendOtpRequest(BaseModel):
    phone: str  # 10-digit Indian mobile number or +91XXXXXXXXXX


class VerifyOtpRequest(BaseModel):
    phone: str
    otp: str


@router.post("/send-otp")
async def send_otp_route(body: SendOtpRequest):
    """
    Send OTP to the given phone number via MSG91.
    In dev mode (MSG91_DEV_MODE=true), returns dev_otp in response.
    """
    result = await send_otp(body.phone)
    if not result["success"]:
        return {"success": False, "message": result["message"]}
    response = {"success": True, "message": result["message"]}
    if "dev_otp" in result:
        response["dev_otp"] = result["dev_otp"]  # only present in dev mode
    return response


@router.post("/verify-otp")
def verify_otp_route(body: VerifyOtpRequest):
    """
    Verify OTP entered by user.
    Returns success + a simple user token (extend with JWT later).
    """
    result = verify_otp(body.phone, body.otp)
    if not result["success"]:
        return {"success": False, "message": result["message"]}

    # Normalize phone for user ID
    phone = body.phone.lstrip("+")
    if phone.startswith("91") and len(phone) == 12:
        phone = phone[2:]

    return {
        "success": True,
        "message": "Login successful",
        "user_id": f"user_{phone}",
        "phone": f"+91{phone}",
    }
