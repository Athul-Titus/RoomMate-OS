"""Profiles and Location API routes."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.modules.auth.models import User
from app.modules.profiles.schemas import (
    CityResponse,
    NeighbourhoodResponse,
    OwnProfileResponse,
    PreferencesRequest,
    PreferencesResponse,
    ProfileCompletionResponse,
    ProfileResponse,
    UpdateProfileRequest,
)
from app.modules.profiles.service import ProfileService

router = APIRouter()


@router.get("/me", response_model=OwnProfileResponse)
async def get_own_profile(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OwnProfileResponse:
    return await ProfileService.get_own_profile(db, current_user.id)


@router.patch("/me", response_model=OwnProfileResponse)
async def update_profile(
    req: UpdateProfileRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> OwnProfileResponse:
    return await ProfileService.update_profile(db, current_user.id, req)


@router.get("/me/completion", response_model=ProfileCompletionResponse)
async def get_profile_completion(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProfileCompletionResponse:
    return await ProfileService.get_completion(db, current_user.id)


@router.put("/me/preferences", response_model=PreferencesResponse)
async def update_preferences(
    req: PreferencesRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PreferencesResponse:
    return await ProfileService.upsert_preferences(db, current_user.id, req)


@router.get("/{user_id}", response_model=ProfileResponse)
async def get_public_profile(
    user_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ProfileResponse:
    return await ProfileService.get_public_profile(db, user_id, current_user.id)


locations_router = APIRouter()


@locations_router.get("/cities", response_model=list[CityResponse])
async def list_cities(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[CityResponse]:
    return await ProfileService.list_cities(db)


@locations_router.get("/cities/{city_id}/neighbourhoods", response_model=list[NeighbourhoodResponse])
async def list_neighbourhoods(
    city_id: uuid.UUID,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[NeighbourhoodResponse]:
    return await ProfileService.list_neighbourhoods(db, city_id)
