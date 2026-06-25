from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db, init_db
from app.models.forum import (
    ForumPostDB, ForumReplyDB,
    ForumPostCreate, ForumReplyCreate,
    ForumPostOut, ForumReplyOut,
    FORUM_CATEGORIES,
)
from app.api.deps import get_current_user, get_optional_user

router = APIRouter(prefix="/forum", tags=["forum"])

_db_ready = False


async def ensure_db():
    """Idempotent: create tables on first request (safety net for serverless cold starts)."""
    global _db_ready
    if not _db_ready:
        await init_db()
        _db_ready = True


@router.get("/categories")
async def list_categories():
    return FORUM_CATEGORIES


@router.get("/posts")
async def list_posts(
    category: str | None = Query(None),
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(ForumPostDB).order_by(desc(ForumPostDB.created_at))
    if category:
        stmt = stmt.where(ForumPostDB.category == category)
    result = await db.execute(stmt.offset(offset).limit(limit))
    posts = result.scalars().all()
    count_stmt = select(ForumPostDB)
    if category:
        count_stmt = count_stmt.where(ForumPostDB.category == category)
    count_res = await db.execute(count_stmt)
    total = len(count_res.scalars().all())
    return {
        "total": total,
        "posts": [ForumPostOut.from_db(p) for p in posts],
    }


@router.post("/posts", status_code=201)
async def create_post(
    payload: ForumPostCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    await ensure_db()
    if payload.category not in FORUM_CATEGORIES:
        raise HTTPException(status_code=400, detail=f"Invalid category. Choose from: {FORUM_CATEGORIES}")
    post = ForumPostDB(
        user_id=user["id"],
        title=payload.title,
        body=payload.body,
        category=payload.category,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)
    return ForumPostOut.from_db(post)


@router.get("/posts/{post_id}")
async def get_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(ForumPostDB).where(ForumPostDB.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    replies_result = await db.execute(
        select(ForumReplyDB).where(ForumReplyDB.post_id == post_id).order_by(ForumReplyDB.created_at)
    )
    replies = replies_result.scalars().all()
    return ForumPostOut.from_db(post, replies)


@router.post("/posts/{post_id}/replies", status_code=201)
async def create_reply(
    post_id: int,
    payload: ForumReplyCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    await ensure_db()
    result = await db.execute(select(ForumPostDB).where(ForumPostDB.id == post_id))
    post = result.scalar_one_or_none()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    reply = ForumReplyDB(post_id=post_id, user_id=user["id"], body=payload.body)
    db.add(reply)
    post.reply_count = (post.reply_count or 0) + 1
    await db.commit()
    await db.refresh(reply)
    return ForumReplyOut.from_db(reply)
