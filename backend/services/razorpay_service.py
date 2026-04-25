import os

RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

client = None
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    try:
        import razorpay

        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    except Exception:
        client = None


def create_razorpay_order(amount: int, currency: str, receipt: str):
    if not client:
        return {
            "mock": True,
            "id": "order_mock_123",
            "amount": amount,
            "currency": currency,
            "receipt": receipt,
        }
    return client.order.create({
        "amount": amount,
        "currency": currency,
        "receipt": receipt,
        "payment_capture": 1,
    })


def verify_payment_signature(data: dict):
    if not client:
        return {"valid": True, "mock": True}
    try:
        client.utility.verify_payment_signature(data)
        return {"valid": True}
    except Exception as e:
        return {"valid": False, "error": str(e)}
