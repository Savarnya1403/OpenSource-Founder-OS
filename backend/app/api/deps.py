from typing import Optional
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_token

security = HTTPBearer()
security_optional = HTTPBearer(auto_error=False)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated user"""
    try:
        payload = decode_token(credentials.credentials)
        if not payload or "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": int(payload["sub"]), **payload}
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_optional)) -> Optional[dict]:
    """Dependency that returns user if authenticated, None otherwise"""
    if not credentials:
        return None
    try:
        payload = decode_token(credentials.credentials)
        if not payload or "sub" not in payload:
            return None
        return {"id": int(payload["sub"]), **payload}
    except Exception:
        return None


async def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Dependency to get current authenticated admin"""
    try:
        payload = decode_token(credentials.credentials)
        if not payload or payload.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return payload
    except Exception:
        raise HTTPException(status_code=403, detail="Invalid or expired admin token")
