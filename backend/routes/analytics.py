from fastapi import APIRouter
from routes.orders import ORDERS
import pandas as pd

router = APIRouter()

@router.get("/sales-summary")
def sales_summary():
    if not ORDERS:
        return {
            "total_orders": 0,
            "total_revenue": 0,
            "avg_order_value": 0,
            "top_items": []
        }

    df = pd.DataFrame(ORDERS)
    total_orders = len(df)
    total_revenue = float(df["total_amount"].sum())
    avg_order_value = float(df["total_amount"].mean())

    item_counts = {}
    for order in ORDERS:
        for item in order["items"]:
            item_counts[item["name"]] = item_counts.get(item["name"], 0) + item["quantity"]

    top_items = sorted(item_counts.items(), key=lambda x: x[1], reverse=True)[:5]

    return {
        "total_orders": total_orders,
        "total_revenue": total_revenue,
        "avg_order_value": round(avg_order_value, 2),
        "top_items": top_items,
    }
