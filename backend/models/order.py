from pydantic import BaseModel
from typing import List, Optional

class OrderItem(BaseModel):
    item_id: str
    name: str
    quantity: int
    price: float

class OrderCreate(BaseModel):
    user_id: str
    items: List[OrderItem]
    address: str
    payment_method: str
    notes: Optional[str] = None

class OrderResponse(BaseModel):
    order_id: str
    status: str
    total_amount: float
