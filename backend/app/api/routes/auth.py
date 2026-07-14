from __future__ import annotations
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import insert
from app.core.security import hash_password, verify_password, create_access_token
from app.core.github_db import get_users, save_users, find_user_by_email
from app.core.database import get_db
from app.models.user import UserRegister, UserLogin, UserProfile, TokenResponse
from app.models.login_activity import LoginActivityDB
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


async def log_login_activity(
    db: AsyncSession,
    user_id: int,
    email: str,
    ip_address: str | None,
    user_agent: str | None,
    login_status: str,
) -> None:
    """Log user login activity for audit trail and tracking"""
    try:
        stmt = insert(LoginActivityDB).values(
            user_id=user_id,
            email=email,
            ip_address=ip_address,
            user_agent=user_agent,
            login_status=login_status,
            device_info=f"{user_agent[:100] if user_agent else 'unknown'}" if user_agent else None,
        )
        await db.execute(stmt)
        await db.commit()
    except Exception as e:
        print(f"Error logging login activity: {e}")
        await db.rollback()


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    users, sha = await get_users()

    if any(u["email"] == payload.email for u in users):
        raise HTTPException(status_code=400, detail="Email already registered")

    new_id = (max((u["id"] for u in users), default=0) + 1)
    user_dict = {
        "id": new_id,
        "email": payload.email,
        "name": payload.name,
        "hashed_password": hash_password(payload.password),
        "startup_name": payload.startup_name,
        "startup_stage": payload.startup_stage,
        "sector": payload.sector,
        "city": payload.city,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    users.append(user_dict)
    await save_users(users, sha)

    token = create_access_token({"sub": str(new_id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(**{k: user_dict[k] for k in UserProfile.model_fields}),
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: UserLogin,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    users, _ = await get_users()
    user = next((u for u in users if u["email"] == payload.email), None)

    # Extract client details
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent", None)
    
    if not user or not verify_password(payload.password, user["hashed_password"]):
        # Log failed login attempt
        await log_login_activity(
            db=db,
            user_id=0,
            email=payload.email,
            ip_address=ip_address,
            user_agent=user_agent,
            login_status="failed",
        )
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Log successful login
    await log_login_activity(
        db=db,
        user_id=user["id"],
        email=user["email"],
        ip_address=ip_address,
        user_agent=user_agent,
        login_status="success",
    )

    token = create_access_token({"sub": str(user["id"])})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserProfile(**{k: user[k] for k in UserProfile.model_fields if k in user}),
    )


@router.get("/me", response_model=UserProfile)
async def me(user: dict = Depends(get_current_user)):
    return UserProfile(**{k: user[k] for k in UserProfile.model_fields if k in user})


@router.patch("/me", response_model=UserProfile)
async def update_profile(
    payload: dict,
    user: dict = Depends(get_current_user),
):
    users, sha = await get_users()
    allowed = {"name", "startup_name", "startup_stage", "sector", "city"}

    for i, u in enumerate(users):
        if u["id"] == user["id"]:
            for key, value in payload.items():
                if key in allowed:
                    users[i][key] = value
            await save_users(users, sha)
            return UserProfile(**{k: users[i][k] for k in UserProfile.model_fields if k in users[i]})

    raise HTTPException(status_code=404, detail="User not found")
