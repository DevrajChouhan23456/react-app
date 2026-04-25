from fastapi import APIRouter
from models.order import OrderCreate, OrderResponse
from services.notifications import send_order_notification
import uuid
from database.connection import supabase

router = APIRouter()
ORDERS = []


@router.post("/", response_model=OrderResponse)
def place_order(order: OrderCreate):
    total = sum(item.quantity * item.price for item in order.items)
    order_id = f"ORD-{str(uuid.uuid4())[:8].upper()}"

    # Insert into Supabase if configured
    if supabase:
        order_record = {
            "client_order_id": order_id,
            "user_id": order.user_id,
            "address": order.address,
            "payment_method": order.payment_method,
            "notes": order.notes,
            "status": "placed",
            "total_amount": total,
        }
        res = supabase.table("orders").insert(order_record).execute()
        if not res.error and res.data:
            db_order = res.data[0]
            db_order_id = db_order.get("id")
            items_payload = [
                {
                    "order_id": db_order_id,
                    "item_id": item.item_id,
                    "name": item.name,
                    "quantity": item.quantity,
                    "price": item.price,
                }
                for item in order.items
            ]
            supabase.table("order_items").insert(items_payload).execute()

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
    if supabase:
        res = supabase.table("orders").select("*").order("created_at", desc=True).execute()
        if not res.error:
            return res.data
    return ORDERS


@router.get("/{order_id}")
def get_order(order_id: str):
    if supabase:
        # First try to match by client_order_id, then by id
        res = supabase.table("orders").select("*").eq("client_order_id", order_id).single().execute()
        if res.error or not res.data:
            res = supabase.table("orders").select("*").eq("id", order_id).single().execute()
        if not res.error and res.data:
            order = res.data
            items_res = supabase.table("order_items").select("*").eq("order_id", order["id"]).execute()
            order["items"] = items_res.data if not items_res.error else []
            return order

    order = next((o for o in ORDERS if o["order_id"] == order_id), None)
    if not order:
        return {"error": "Order not found"}
    return order
