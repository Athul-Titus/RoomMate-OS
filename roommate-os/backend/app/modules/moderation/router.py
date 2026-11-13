"""Moderation service and routes."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.modules.auth.models import User
from app.modules.moderation import repository as repo
from app.modules.moderation.schemas import BlockResponse, ReportUserRequest

router = APIRouter(tags=["Trust & Safety"])


@router.post("/users/{user_id}/block", response_model=BlockResponse)
async def block_user(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> BlockResponse:
    await repo.block_user(db, current_user.id, user_id)
    return BlockResponse(blocked_user_id=user_id, status="blocked")


@router.post("/reports")
async def report_user(
    req: ReportUserRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> dict[str, str]:
    await repo.create_report(
        db, current_user.id, req.reported_user_id, req.reason, req.description
    )
    return {"message": "Report submitted successfully for moderation review"}
