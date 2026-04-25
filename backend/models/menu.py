from pydantic import BaseModel
from typing import Optional

class MenuItem(BaseModel):
    id: str
    name: str
    description: str
    price: float
    image: Optional[str] = None
    category: str
    available: bool = True

class MenuItemCreate(BaseModel):
    name: str
    description: str
    price: float
    image: Optional[str] = None
    category: str
