from __future__ import annotations
from sqlalchemy import Integer, Float, String, Text, Date, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from app.core.database import Base


class TractionEntryDB(Base):
    __tablename__ = "traction_entries"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False)
    mrr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    arr: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    dau: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    mau: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    cac: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    ltv: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    nps: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class TractionEntryCreate(BaseModel):
    entry_date: date
    mrr: Optional[float] = None
    arr: Optional[float] = None
    dau: Optional[int] = None
    mau: Optional[int] = None
    cac: Optional[float] = None
    ltv: Optional[float] = None
    nps: Optional[int] = None
    notes: Optional[str] = None


class TractionEntryOut(BaseModel):
    id: int
    entry_date: date
    mrr: Optional[float] = None
    arr: Optional[float] = None
    dau: Optional[int] = None
    mau: Optional[int] = None
    cac: Optional[float] = None
    ltv: Optional[float] = None
    nps: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
