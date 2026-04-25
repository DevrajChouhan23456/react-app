from fastapi import APIRouter
from models.order import OrderCreate, OrderResponse
from services.notifications import send_order_notification
import uuid

router = APIRouter()
ORDERS = []

@router.post("/", response_model=OrderResponse)
def place_order(order: OrderCreate):
    total = sum(item.quantity * item.price for item in order.items)
    order_id = f"ORD-{str(uuid.uuid4())[:8].upper()}"
    new_order = {
        "order_id": order_id,
        "status": "placed",
        "total_amount": total,
        **order.model_dump(),
    }
    ORDERS.append(new_order)
    send_order_notification(order_id, total)
    return {
        "order_id": order_id,
        "status": "placed",
        "total_amount": total,
    }

@router.get("/")
def list_orders():
    return ORDERS

@router.get("/{order_id}")
def get_order(order_id: str):
    order = next((o for o in ORDERS if o["order_id"] == order_id), None)
    if not order:
        return {"error": "Order not found"}
    return order
