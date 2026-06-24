from __future__ import annotations
from sqlalchemy import Integer, String, Text, DateTime, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.core.database import Base

FORUM_CATEGORIES = [
    "General",
    "Fundraising",
    "GTM & Sales",
    "Product",
    "Legal & Compliance",
    "Team & Culture",
    "Mental Health",
]


class ForumPostDB(Base):
    __tablename__ = "forum_posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), nullable=False, default="General")
    reply_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


class ForumReplyDB(Base):
    __tablename__ = "forum_replies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    post_id: Mapped[int] = mapped_column(Integer, ForeignKey("forum_posts.id"), nullable=False, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())


# Pydantic schemas
class ForumPostCreate(BaseModel):
    title: str
    body: str
    category: str = "General"


class ForumReplyCreate(BaseModel):
    body: str


def _anon_id(user_id: int) -> str:
    h = (user_id * 2654435761) & 0xFFFF
    return f"Founder #{h:04d}"


class ForumReplyOut(BaseModel):
    id: int
    author: str
    body: str
    created_at: datetime

    @classmethod
    def from_db(cls, r: ForumReplyDB) -> "ForumReplyOut":
        return cls(id=r.id, author=_anon_id(r.user_id), body=r.body, created_at=r.created_at)


class ForumPostOut(BaseModel):
    id: int
    title: str
    body: str
    category: str
    author: str
    reply_count: int
    created_at: datetime
    replies: Optional[List[ForumReplyOut]] = None

    @classmethod
    def from_db(cls, p: ForumPostDB, replies: Optional[List[ForumReplyDB]] = None) -> "ForumPostOut":
        return cls(
            id=p.id,
            title=p.title,
            body=p.body,
            category=p.category,
            author=_anon_id(p.user_id),
            reply_count=p.reply_count,
            created_at=p.created_at,
            replies=[ForumReplyOut.from_db(r) for r in replies] if replies else None,
        )
