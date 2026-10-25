from __future__ import annotations
from sqlalchemy import String, Text, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from datetime import datetime


class UserDB(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    startup_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    startup_stage: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    sector: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    city: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    profile_json: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# Pydantic schemas
class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str
    startup_name: Optional[str] = None
    startup_stage: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if len(v) > 128:
            raise ValueError("Password must be under 128 characters")
        return v

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        if len(v) > 100:
            raise ValueError("Name must be under 100 characters")
        return v

    @field_validator("startup_name", "city", mode="before")
    @classmethod
    def trim_optional_str(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        return v[:100] if v else None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    startup_name: Optional[str] = None
    startup_stage: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    startup_name: Optional[str] = None
    startup_stage: Optional[str] = None
    sector: Optional[str] = None
    city: Optional[str] = None

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        v = v.strip()
        if not v:
            raise ValueError("Name cannot be empty")
        return v[:100]

    @field_validator("startup_name", "city", mode="before")
    @classmethod
    def trim_optional_str(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return v.strip()[:100] if v.strip() else None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
