from fastapi import APIRouter
from models.menu import MenuItem, MenuItemCreate
from typing import List
import uuid

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

@router.get("/", response_model=List[MenuItem])
def get_menu():
    return MOCK_MENU

@router.get("/{item_id}", response_model=MenuItem)
def get_menu_item(item_id: str):
    item = next((m for m in MOCK_MENU if m["id"] == item_id), None)
    if not item:
        return {"error": "Item not found"}
    return item

@router.post("/", response_model=MenuItem)
def create_menu_item(item: MenuItemCreate):
    new_item = {
        "id": str(uuid.uuid4()),
        **item.model_dump(),
        "available": True,
    }
    MOCK_MENU.append(new_item)
    return new_item
