from pydantic import BaseModel, EmailStr
from typing import Optional

class UserProfile(BaseModel):
    id: str
    phone: str
    name: str
    email: Optional[EmailStr] = None
