"""Matching and Discovery API routes."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.modules.auth.models import User
from app.modules.matching.schemas import (
    ActionRequest,
    ActionResponse,
    DiscoveryCardResponse,
    MutualMatchResponse,
)
from app.modules.matching.service import MatchingService

router = APIRouter(tags=["Matching & Discovery"])


@router.get("/discovery/people", response_model=list[DiscoveryCardResponse])
async def get_discovery_feed(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[DiscoveryCardResponse]:
    return await MatchingService.get_discovery_feed(db, current_user.id)


@router.post("/discovery/actions", response_model=ActionResponse)
async def perform_action(
    req: ActionRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ActionResponse:
    return await MatchingService.perform_action(db, current_user.id, req)


@router.get("/matches", response_model=list[MutualMatchResponse])
async def list_mutual_matches(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[MutualMatchResponse]:
    return await MatchingService.list_mutual_matches(db, current_user.id)

