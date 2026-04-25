from fastapi import APIRouter
from pydantic import BaseModel
from services.razorpay_service import create_razorpay_order, verify_payment_signature

router = APIRouter()

class CreatePaymentRequest(BaseModel):
    amount: int
    currency: str = "INR"
    receipt: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

@router.post("/create")
def create_payment(request: CreatePaymentRequest):
    return create_razorpay_order(request.amount, request.currency, request.receipt)

@router.post("/verify")
def verify_payment(request: VerifyPaymentRequest):
    return verify_payment_signature(request.model_dump())
