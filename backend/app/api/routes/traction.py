from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import Optional
from app.core.database import get_db
from app.models.traction import TractionEntryDB, TractionEntryCreate, TractionEntryOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/traction", tags=["traction"])


@router.get("", response_model=list[TractionEntryOut])
async def get_traction(
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(TractionEntryDB)
        .where(TractionEntryDB.user_id == user["id"])
        .order_by(desc(TractionEntryDB.entry_date))
        .limit(limit)
    )
    return result.scalars().all()


@router.post("", response_model=TractionEntryOut, status_code=201)
async def create_traction(
    payload: TractionEntryCreate,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    entry = TractionEntryDB(user_id=user["id"], **payload.model_dump())
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    return entry


@router.get("/chart")
async def get_traction_chart(
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(TractionEntryDB)
        .where(TractionEntryDB.user_id == user["id"])
        .order_by(TractionEntryDB.entry_date)
        .limit(52)
    )
    entries = result.scalars().all()
    if not entries:
        return {"labels": [], "mrr": [], "dau": [], "cac": [], "ltv": [], "nps": []}
    return {
        "labels": [str(e.entry_date) for e in entries],
        "mrr": [e.mrr for e in entries],
        "dau": [e.dau for e in entries],
        "cac": [e.cac for e in entries],
        "ltv": [e.ltv for e in entries],
        "nps": [e.nps for e in entries],
        "latest": {
            "mrr": entries[-1].mrr,
            "arr": entries[-1].arr or ((entries[-1].mrr or 0) * 12),
            "dau": entries[-1].dau,
            "mau": entries[-1].mau,
            "cac": entries[-1].cac,
            "ltv": entries[-1].ltv,
            "nps": entries[-1].nps,
            "ltv_cac_ratio": round(entries[-1].ltv / entries[-1].cac, 2)
                             if entries[-1].ltv and entries[-1].cac and entries[-1].cac > 0 else None,
        },
        "prev": {
            "mrr": entries[-2].mrr if len(entries) > 1 else None,
            "dau": entries[-2].dau if len(entries) > 1 else None,
            "cac": entries[-2].cac if len(entries) > 1 else None,
        } if len(entries) > 1 else None,
    }


@router.delete("/{entry_id}", status_code=204)
async def delete_traction(
    entry_id: int,
    db: AsyncSession = Depends(get_db),
    user: dict = Depends(get_current_user),
):
    result = await db.execute(
        select(TractionEntryDB).where(
            TractionEntryDB.id == entry_id,
            TractionEntryDB.user_id == user["id"],
        )
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    await db.delete(entry)
    await db.commit()
