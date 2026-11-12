"""Profiles module async data-access functions."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.profiles.models import City, Neighbourhood, UserPreferences, UserProfile


async def get_profile(db: AsyncSession, user_id: uuid.UUID) -> UserProfile | None:
    result = await db.execute(select(UserProfile).where(UserProfile.user_id == user_id))
    return result.scalar_one_or_none()


async def create_profile(db: AsyncSession, user_id: uuid.UUID, display_name: str) -> UserProfile:
    profile = UserProfile(user_id=user_id, display_name=display_name)
    db.add(profile)
    await db.flush()
    return profile


async def update_profile(db: AsyncSession, user_id: uuid.UUID, updates: dict) -> UserProfile:
    profile = await get_profile(db, user_id)
    if profile is None:
        # Create if doesn't exist (defensive)
        profile = UserProfile(user_id=user_id, display_name=updates.pop("display_name", ""))

    for key, value in updates.items():
        setattr(profile, key, value)

    db.add(profile)
    await db.flush()
    return profile


async def get_preferences(db: AsyncSession, user_id: uuid.UUID) -> UserPreferences | None:
    result = await db.execute(select(UserPreferences).where(UserPreferences.user_id == user_id))
    return result.scalar_one_or_none()


async def upsert_preferences(db: AsyncSession, user_id: uuid.UUID, data: dict) -> UserPreferences:
    prefs = await get_preferences(db, user_id)
    if prefs is None:
        prefs = UserPreferences(user_id=user_id, **data)
    else:
        for key, value in data.items():
            setattr(prefs, key, value)
    db.add(prefs)
    await db.flush()
    return prefs


def compute_completion(profile: UserProfile, prefs: UserPreferences | None) -> int:
    """
    Compute profile completion percentage (0–100).
    Score breakdown:
      display_name         +10
      bio                  +10
      occupation_category  +10
      profile_photo_key    +20
      work_mode            +5
      min+max budget       +20
      move_in_from         +10
      preferred_stay_months+5
      employer_name        +5   (bonus, clearly optional)
      lifestyle (placeholder)+5
    Total: 100
    """
    score = 0
    if profile.display_name:
        score += 10
    if profile.bio:
        score += 10
    if profile.occupation_category:
        score += 10
    if profile.profile_photo_key:
        score += 20
    if profile.work_mode:
        score += 5
    if prefs and prefs.min_budget is not None and prefs.max_budget is not None:
        score += 20
    if prefs and prefs.move_in_from is not None:
        score += 10
    if prefs and prefs.preferred_stay_months is not None:
        score += 5
    if profile.employer_name:
        score += 5
    # lifestyle placeholder
    score += 5  # TODO: add lifestyle fields — currently always awarded as placeholder
    return min(score, 100)


def _completion_fields(profile: UserProfile, prefs: UserPreferences | None) -> tuple[list[str], list[str]]:
    """Return (completed_fields, missing_fields)."""
    checks: list[tuple[str, bool]] = [
        ("display_name", bool(profile.display_name)),
        ("bio", bool(profile.bio)),
        ("occupation_category", bool(profile.occupation_category)),
        ("profile_photo", bool(profile.profile_photo_key)),
        ("work_mode", bool(profile.work_mode)),
        ("budget_range", bool(prefs and prefs.min_budget is not None and prefs.max_budget is not None)),
        ("move_in_from", bool(prefs and prefs.move_in_from is not None)),
        ("preferred_stay_months", bool(prefs and prefs.preferred_stay_months is not None)),
        ("employer_name", bool(profile.employer_name)),
    ]
    completed = [name for name, done in checks if done]
    missing = [name for name, done in checks if not done]
    return completed, missing


async def get_cities(db: AsyncSession) -> list[City]:
    result = await db.execute(select(City).where(City.active.is_(True)).order_by(City.name))
    return list(result.scalars().all())


async def get_neighbourhoods(db: AsyncSession, city_id: uuid.UUID) -> list[Neighbourhood]:
    result = await db.execute(
        select(Neighbourhood)
        .where(Neighbourhood.city_id == city_id, Neighbourhood.active.is_(True))
        .order_by(Neighbourhood.name)
    )
    return list(result.scalars().all())
