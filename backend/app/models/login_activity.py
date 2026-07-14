from __future__ import annotations
from datetime import datetime
from sqlalchemy import String, DateTime, Integer, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from pydantic import BaseModel
from typing import Optional


class LoginActivityDB(Base):
    __tablename__ = "login_activities"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    login_timestamp: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), index=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)  # Client IP
    user_agent: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)  # Browser/Device info
    login_status: Mapped[str] = mapped_column(String(20), default="success")  # success, failed
    device_info: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)  # Device details


# Pydantic schemas
class LoginActivityCreate(BaseModel):
    user_id: int
    email: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    login_status: str = "success"
    device_info: Optional[str] = None


class LoginActivityResponse(BaseModel):
    id: int
    user_id: int
    email: str
    login_timestamp: datetime
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    login_status: str
    device_info: Optional[str] = None

    class Config:
        from_attributes = True
