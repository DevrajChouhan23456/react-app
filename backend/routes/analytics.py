from fastapi import APIRouter
from routes.orders import ORDERS
from database.connection import supabase

router = APIRouter()


def _to_float(value) -> float:
    try:
        return float(value or 0)
    except (TypeError, ValueError):
        return 0.0


def _build_summary(orders: list[dict], top_items: list[tuple[str, int]]):
    total_orders = len(orders)
    total_revenue = sum(_to_float(order.get("total_amount")) for order in orders)
    avg_order_value = total_revenue / total_orders if total_orders else 0

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": round(avg_order_value, 2),
        "top_items": top_items,
    }


@router.get("/sales-summary")
def sales_summary():
    # Prefer Supabase data when available
    if supabase:
        orders_res = supabase.table("orders").select("id,total_amount").execute()
        if orders_res.error or not orders_res.data:
            # Fallback to in-memory analytics
            return _analytics_from_memory()

        orders_data = orders_res.data
        if not orders_data:
            return {
                "total_orders": 0,
                "total_revenue": 0,
                "avg_order_value": 0,
                "top_items": [],
            }

        # Top items from order_items table
        items_res = supabase.table("order_items").select("name,quantity").execute()
        item_counts = {}
        if not items_res.error and items_res.data:
            for row in items_res.data:
                name = row.get("name")
                qty = row.get("quantity", 0)
                if not name:
                    continue
                item_counts[name] = item_counts.get(name, 0) + qty

        top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
        return _build_summary(orders_data, top_items)

    # No Supabase configured → use in-memory orders
    return _analytics_from_memory()


def _analytics_from_memory():
    if not ORDERS:
        return {
            "total_orders": 0,
            "total_revenue": 0,
            "avg_order_value": 0,
            "top_items": [],
        }

    item_counts = {}
    for order in ORDERS:
        for item in order["items"]:
            item_counts[item["name"]] = item_counts.get(item["name"], 0) + item["quantity"]

    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]
    return _build_summary(ORDERS, top_items)
