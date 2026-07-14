from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from app.core.database import get_db
from app.models.login_activity import LoginActivityDB, LoginActivityResponse
from app.api.deps import get_current_user

router = APIRouter(prefix="/login-activities", tags=["login-activities"])


@router.get("", response_model=list[LoginActivityResponse])
async def get_login_activities(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0,
):
    """Get login activity history for the current user"""
    try:
        stmt = (
            select(LoginActivityDB)
            .where(LoginActivityDB.user_id == user["id"])
            .order_by(desc(LoginActivityDB.login_timestamp))
            .limit(limit)
            .offset(offset)
        )
        result = await db.execute(stmt)
        activities = result.scalars().all()
        return activities
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching login activities: {str(e)}")


@router.get("/stats", response_model=dict)
async def get_login_stats(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get login statistics for the current user"""
    try:
        # Get total successful logins
        success_stmt = select(LoginActivityDB).where(
            (LoginActivityDB.user_id == user["id"]) & 
            (LoginActivityDB.login_status == "success")
        )
        success_result = await db.execute(success_stmt)
        successful_logins = len(success_result.scalars().all())

        # Get total failed logins
        failed_stmt = select(LoginActivityDB).where(
            (LoginActivityDB.user_id == user["id"]) & 
            (LoginActivityDB.login_status == "failed")
        )
        failed_result = await db.execute(failed_stmt)
        failed_logins = len(failed_result.scalars().all())

        # Get unique IP addresses
        ip_stmt = select(LoginActivityDB.ip_address).where(
            LoginActivityDB.user_id == user["id"]
        ).distinct()
        ip_result = await db.execute(ip_stmt)
        unique_ips = len([ip for ip in ip_result.scalars().all() if ip])

        return {
            "total_successful_logins": successful_logins,
            "total_failed_logins": failed_logins,
            "unique_ip_addresses": unique_ips,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching login stats: {str(e)}")


@router.get("/recent", response_model=LoginActivityResponse)
async def get_recent_login(
    user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the most recent successful login"""
    try:
        stmt = (
            select(LoginActivityDB)
            .where(
                (LoginActivityDB.user_id == user["id"]) & 
                (LoginActivityDB.login_status == "success")
            )
            .order_by(desc(LoginActivityDB.login_timestamp))
            .limit(1)
        )
        result = await db.execute(stmt)
        activity = result.scalar_one_or_none()
        
        if not activity:
            raise HTTPException(status_code=404, detail="No login activity found")
        
        return activity
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recent login: {str(e)}")
