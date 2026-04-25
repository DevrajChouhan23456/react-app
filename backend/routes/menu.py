from fastapi import APIRouter
from models.menu import MenuItem, MenuItemCreate
from typing import List
import uuid
from database.connection import supabase

router = APIRouter()

MOCK_MENU = [
    {
        "id": "1",
        "name": "Dal Bafla Regular",
        "description": "Authentic dal bafla with ghee and chutney",
        "price": 149,
        "image": None,
        "category": "Bestseller",
        "available": True
    },
    {
        "id": "2",
        "name": "Dal Bafla Mini",
        "description": "Smaller portion perfect for light hunger",
        "price": 99,
        "image": None,
        "category": "Mini Meals",
        "available": True
    },
    {
        "id": "3",
        "name": "Family Pack",
        "description": "Dal bafla combo for 4 people",
        "price": 499,
        "image": None,
        "category": "Family Packs",
        "available": True
    },
    {
        "id": "4",
        "name": "Extra Churma",
        "description": "Sweet churma add-on",
        "price": 49,
        "image": None,
        "category": "Add-ons",
        "available": True
    }
]


def _map_menu_row(row: dict) -> dict:
    return {
        "id": str(row.get("id")),
        "name": row.get("name", ""),
        "description": row.get("description") or "",
        "price": float(row.get("price", 0)),
        "image": row.get("image"),
        "category": row.get("category") or "General",
        "available": bool(row.get("available", True)),
    }


@router.get("/", response_model=List[MenuItem])
def get_menu():
    """Get menu items from Supabase if configured, otherwise use mock menu."""
    if supabase:
        res = supabase.table("menu_items").select("*").eq("available", True).order("sort_order").execute()
        if res.error:
            # Fallback to mock menu on error
            return MOCK_MENU
        return [_map_menu_row(row) for row in res.data]
    return MOCK_MENU


@router.get("/{item_id}", response_model=MenuItem)
def get_menu_item(item_id: str):
    if supabase:
        res = supabase.table("menu_items").select("*").eq("id", item_id).single().execute()
        if res.error or not res.data:
            return {"error": "Item not found"}
        return _map_menu_row(res.data)

    item = next((m for m in MOCK_MENU if m["id"] == item_id), None)
    if not item:
        return {"error": "Item not found"}
    return item


@router.post("/", response_model=MenuItem)
def create_menu_item(item: MenuItemCreate):
    """Create a new menu item in Supabase if configured, otherwise in mock list."""
    if supabase:
        insert_data = {
            "name": item.name,
            "description": item.description,
            "price": item.price,
            "image": item.image,
            "category": item.category,
            "available": True,
        }
        res = supabase.table("menu_items").insert(insert_data).execute()
        if res.error or not res.data:
            # Fallback to mock
            new_item = {
                "id": str(uuid.uuid4()),
                **item.model_dump(),
                "available": True,
            }
            MOCK_MENU.append(new_item)
            return new_item
        return _map_menu_row(res.data[0])

    new_item = {
        "id": str(uuid.uuid4()),
        **item.model_dump(),
        "available": True,
    }
    MOCK_MENU.append(new_item)
    return new_item
