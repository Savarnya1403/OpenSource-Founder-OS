from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token
from app.models.user import UserDB, UserRegister, UserLogin, UserProfile, TokenResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == payload.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = UserDB(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
        startup_name=payload.startup_name,
        startup_stage=payload.startup_stage,
        sector=payload.sector,
        city=payload.city,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(token_type="bearer", access_token=token, user=UserProfile.model_validate(user))


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserDB).where(UserDB.email == payload.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(token_type="bearer", access_token=token, user=UserProfile.model_validate(user))


@router.get("/me", response_model=UserProfile)
async def me(user: UserDB = Depends(get_current_user)):
    return UserProfile.model_validate(user)


@router.patch("/me", response_model=UserProfile)
async def update_profile(
    payload: dict,
    db: AsyncSession = Depends(get_db),
    user: UserDB = Depends(get_current_user),
):
    allowed = {"name", "startup_name", "startup_stage", "sector", "city"}
    for key, value in payload.items():
        if key in allowed:
            setattr(user, key, value)
    await db.commit()
    await db.refresh(user)
    return UserProfile.model_validate(user)
