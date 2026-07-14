from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthCredentials
from app.core.security import decode_token

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user"""
    try:
        payload = decode_token(credentials.credentials)
        if not payload or "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": int(payload["sub"]), **payload}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_admin(credentials: HTTPAuthCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated admin"""
    try:
        payload = decode_token(credentials.credentials)
        if not payload or payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid or expired admin token")
