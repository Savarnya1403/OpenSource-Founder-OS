from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, func
from datetime import datetime, timedelta, timezone
from app.core.security import create_access_token, hash_password, verify_password
from app.core.config import get_settings
from app.core.database import get_db
from app.models.admin import AdminLogin, AdminToken
from app.models.login_activity import LoginActivityDB, LoginActivityResponse
from app.api.deps import get_current_admin

router = APIRouter(prefix="/admin", tags=["admin"])
settings = get_settings()


@router.post("/login", response_model=AdminToken)
async def admin_login(payload: AdminLogin):
    """Admin login endpoint"""
    if payload.username != settings.ADMIN_USERNAME or payload.password != settings.ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")
    
    token = create_access_token({"sub": "admin", "role": "admin"})
    return AdminToken(
        access_token=token,
        token_type="bearer",
        username=payload.username,
    )


@router.get("/dashboard/overview")
async def get_dashboard_overview(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get admin dashboard overview with key metrics"""
    try:
        # Total logins
        total_stmt = select(func.count(LoginActivityDB.id))
        total_result = await db.execute(total_stmt)
        total_logins = total_result.scalar() or 0

        # Successful logins
        success_stmt = select(func.count(LoginActivityDB.id)).where(
            LoginActivityDB.login_status == "success"
        )
        success_result = await db.execute(success_stmt)
        successful_logins = success_result.scalar() or 0

        # Failed logins
        failed_stmt = select(func.count(LoginActivityDB.id)).where(
            LoginActivityDB.login_status == "failed"
        )
        failed_result = await db.execute(failed_stmt)
        failed_logins = failed_result.scalar() or 0

        # Unique users
        users_stmt = select(func.count(func.distinct(LoginActivityDB.user_id)))
        users_result = await db.execute(users_stmt)
        unique_users = users_result.scalar() or 0

        # Unique IPs
        ips_stmt = select(func.count(func.distinct(LoginActivityDB.ip_address)))
        ips_result = await db.execute(ips_stmt)
        unique_ips = ips_result.scalar() or 0

        # Last 24h logins
        time_24h = datetime.now(timezone.utc) - timedelta(hours=24)
        last_24h_stmt = select(func.count(LoginActivityDB.id)).where(
            LoginActivityDB.login_timestamp >= time_24h
        )
        last_24h_result = await db.execute(last_24h_stmt)
        logins_24h = last_24h_result.scalar() or 0

        return {
            "total_logins": total_logins,
            "successful_logins": successful_logins,
            "failed_logins": failed_logins,
            "success_rate": round((successful_logins / total_logins * 100), 2) if total_logins > 0 else 0,
            "unique_users": unique_users,
            "unique_ips": unique_ips,
            "logins_last_24h": logins_24h,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching overview: {str(e)}")


@router.get("/dashboard/recent-logins", response_model=list[LoginActivityResponse])
async def get_recent_logins(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """Get recent logins for admin dashboard"""
    try:
        stmt = (
            select(LoginActivityDB)
            .order_by(desc(LoginActivityDB.login_timestamp))
            .limit(limit)
        )
        result = await db.execute(stmt)
        logins = result.scalars().all()
        return logins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching recent logins: {str(e)}")


@router.get("/dashboard/failed-logins", response_model=list[LoginActivityResponse])
async def get_failed_logins(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
):
    """Get failed login attempts for security monitoring"""
    try:
        stmt = (
            select(LoginActivityDB)
            .where(LoginActivityDB.login_status == "failed")
            .order_by(desc(LoginActivityDB.login_timestamp))
            .limit(limit)
        )
        result = await db.execute(stmt)
        logins = result.scalars().all()
        return logins
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching failed logins: {str(e)}")


@router.get("/dashboard/ip-analysis")
async def get_ip_analysis(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Analyze login patterns by IP address"""
    try:
        stmt = (
            select(
                LoginActivityDB.ip_address,
                func.count(LoginActivityDB.id).label("total_logins"),
                func.count(func.case((LoginActivityDB.login_status == "success",), else_=None)).label("successful"),
                func.count(func.case((LoginActivityDB.login_status == "failed",), else_=None)).label("failed"),
                func.count(func.distinct(LoginActivityDB.user_id)).label("unique_users"),
            )
            .group_by(LoginActivityDB.ip_address)
            .order_by(desc(func.count(LoginActivityDB.id)))
            .limit(50)
        )
        result = await db.execute(stmt)
        rows = result.all()
        
        data = [
            {
                "ip_address": row[0] or "unknown",
                "total_logins": row[1],
                "successful_logins": row[2],
                "failed_logins": row[3],
                "unique_users": row[4],
            }
            for row in rows
        ]
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing IPs: {str(e)}")


@router.get("/dashboard/user-analysis")
async def get_user_analysis(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    """Analyze login patterns by user"""
    try:
        stmt = (
            select(
                LoginActivityDB.user_id,
                LoginActivityDB.email,
                func.count(LoginActivityDB.id).label("total_logins"),
                func.count(func.case((LoginActivityDB.login_status == "success",), else_=None)).label("successful"),
                func.count(func.case((LoginActivityDB.login_status == "failed",), else_=None)).label("failed"),
                func.max(LoginActivityDB.login_timestamp).label("last_login"),
                func.count(func.distinct(LoginActivityDB.ip_address)).label("unique_ips"),
            )
            .group_by(LoginActivityDB.user_id, LoginActivityDB.email)
            .order_by(desc(func.count(LoginActivityDB.id)))
            .limit(100)
        )
        result = await db.execute(stmt)
        rows = result.all()
        
        data = [
            {
                "user_id": row[0],
                "email": row[1],
                "total_logins": row[2],
                "successful_logins": row[3],
                "failed_logins": row[4],
                "last_login": row[5],
                "unique_ips": row[6],
            }
            for row in rows
        ]
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing users: {str(e)}")


@router.get("/dashboard/hourly-stats")
async def get_hourly_stats(
    admin: dict = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
    hours: int = 24,
):
    """Get hourly login statistics for the last N hours"""
    try:
        time_ago = datetime.now(timezone.utc) - timedelta(hours=hours)
        
        stmt = (
            select(
                func.strftime('%Y-%m-%d %H:00', LoginActivityDB.login_timestamp).label("hour"),
                func.count(LoginActivityDB.id).label("total_logins"),
                func.count(func.case((LoginActivityDB.login_status == "success",), else_=None)).label("successful"),
                func.count(func.case((LoginActivityDB.login_status == "failed",), else_=None)).label("failed"),
            )
            .where(LoginActivityDB.login_timestamp >= time_ago)
            .group_by(func.strftime('%Y-%m-%d %H:00', LoginActivityDB.login_timestamp))
            .order_by(func.strftime('%Y-%m-%d %H:00', LoginActivityDB.login_timestamp))
        )
        result = await db.execute(stmt)
        rows = result.all()
        
        data = [
            {
                "hour": row[0],
                "total_logins": row[1],
                "successful_logins": row[2],
                "failed_logins": row[3],
            }
            for row in rows
        ]
        return data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching hourly stats: {str(e)}")
