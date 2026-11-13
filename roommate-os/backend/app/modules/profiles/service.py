"""Profiles module service/business-logic layer."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.modules.profiles import repository as repo
from app.modules.profiles.models import UserProfile, UserPreferences
from app.modules.profiles.schemas import (
    OwnProfileResponse,
    ProfileCompletionResponse,
    ProfileResponse,
    UpdateProfileRequest,
    PreferencesRequest,
    PreferencesResponse,
    CityResponse,
    NeighbourhoodResponse,
)


class ProfileService:
    @staticmethod
    async def get_own_profile(db: AsyncSession, user_id: uuid.UUID) -> OwnProfileResponse:
        profile = await repo.get_profile(db, user_id)
        if not profile:
            raise NotFoundError("Profile not found")
        
        prefs = await repo.get_preferences(db, user_id)
        completion = repo.compute_completion(profile, prefs)
        if profile.profile_completion != completion:
            profile.profile_completion = completion
            await db.flush()

        return OwnProfileResponse(
            user_id=profile.user_id,
            display_name=profile.display_name,
            bio=profile.bio,
            occupation_category=profile.occupation_category,
            employer_name=profile.employer_name,
            work_mode=profile.work_mode,
            profile_visibility=profile.profile_visibility,
            profile_completion=profile.profile_completion,
            profile_photo_url=None,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    @staticmethod
    async def get_public_profile(
        db: AsyncSession, target_user_id: uuid.UUID, viewer_id: uuid.UUID | None = None
    ) -> ProfileResponse:
        profile = await repo.get_profile(db, target_user_id)
        if not profile:
            raise NotFoundError("Profile not found")

        # Visibility access check
        if profile.profile_visibility == "private" and viewer_id != target_user_id:
            raise ForbiddenError("This profile is private")

        return ProfileResponse(
            user_id=profile.user_id,
            display_name=profile.display_name,
            bio=profile.bio,
            occupation_category=profile.occupation_category,
            work_mode=profile.work_mode,
            profile_visibility=profile.profile_visibility,
            profile_completion=profile.profile_completion,
            profile_photo_url=None,
            created_at=profile.created_at,
            updated_at=profile.updated_at,
        )

    @staticmethod
    async def update_profile(
        db: AsyncSession, user_id: uuid.UUID, req: UpdateProfileRequest
    ) -> OwnProfileResponse:
        updates = {k: v for k, v in req.model_dump(exclude_unset=True).items()}
        profile = await repo.update_profile(db, user_id, updates)
        
        prefs = await repo.get_preferences(db, user_id)
        profile.profile_completion = repo.compute_completion(profile, prefs)
        await db.flush()

        return await ProfileService.get_own_profile(db, user_id)

    @staticmethod
    async def upsert_preferences(
        db: AsyncSession, user_id: uuid.UUID, req: PreferencesRequest
    ) -> PreferencesResponse:
        data = {k: v for k, v in req.model_dump(exclude_unset=True).items()}
        prefs = await repo.upsert_preferences(db, user_id, data)

        profile = await repo.get_profile(db, user_id)
        if profile:
            profile.profile_completion = repo.compute_completion(profile, prefs)
            await db.flush()

        return PreferencesResponse(
            user_id=prefs.user_id,
            min_budget=prefs.min_budget,
            max_budget=prefs.max_budget,
            currency=prefs.currency,
            move_in_from=prefs.move_in_from,
            move_in_to=prefs.move_in_to,
            preferred_stay_months=prefs.preferred_stay_months,
            created_at=prefs.created_at,
            updated_at=prefs.updated_at,
        )

    @staticmethod
    async def get_completion(db: AsyncSession, user_id: uuid.UUID) -> ProfileCompletionResponse:
        profile = await repo.get_profile(db, user_id)
        if not profile:
            raise NotFoundError("Profile not found")

        prefs = await repo.get_preferences(db, user_id)
        percentage = repo.compute_completion(profile, prefs)
        completed, missing = repo._completion_fields(profile, prefs)
        return ProfileCompletionResponse(
            percentage=percentage,
            completed_fields=completed,
            missing_fields=missing,
        )

    @staticmethod
    async def list_cities(db: AsyncSession) -> list[CityResponse]:
        cities = await repo.get_cities(db)
        return [CityResponse.model_validate(c) for c in cities]

    @staticmethod
    async def list_neighbourhoods(db: AsyncSession, city_id: uuid.UUID) -> list[NeighbourhoodResponse]:
        neighbourhoods = await repo.get_neighbourhoods(db, city_id)
        return [NeighbourhoodResponse.model_validate(n) for n in neighbourhoods]

