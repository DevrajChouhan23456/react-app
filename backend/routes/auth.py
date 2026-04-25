from fastapi import APIRouter
from jose import jwt, JWTError
import os

router = APIRouter()

@router.get("/verify")
def verify_token(token: str):
    secret = os.getenv("SUPABASE_JWT_SECRET", "")
    if not secret:
        return {"valid": False, "error": "JWT secret missing"}
    try:
        payload = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
        return {"valid": True, "payload": payload}
    except JWTError as e:
        return {"valid": False, "error": str(e)}
