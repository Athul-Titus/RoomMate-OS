"""Profiles module Pydantic v2 schemas."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, field_validator, model_validator


class ProfileResponse(BaseModel):
    """Public profile — employer_name and phone NEVER included."""

    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    display_name: str
    bio: Optional[str] = None
    occupation_category: Optional[str] = None
    work_mode: Optional[str] = None
    profile_visibility: str
    profile_completion: int
    profile_photo_url: Optional[str] = None  # signed URL, not raw storage key
    created_at: datetime
    updated_at: datetime


class OwnProfileResponse(ProfileResponse):
    """Own profile — adds employer_name. Never includes phone number."""

    employer_name: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    occupation_category: Optional[str] = None
    employer_name: Optional[str] = None
    work_mode: Optional[str] = None
    profile_visibility: Optional[str] = None

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if len(v) < 2 or len(v) > 50:
            raise ValueError("display_name must be between 2 and 50 characters")
        return v

    @field_validator("bio")
    @classmethod
    def validate_bio(cls, v: str | None) -> str | None:
        if v is not None and len(v) > 500:
            raise ValueError("bio must not exceed 500 characters")
        return v

    @field_validator("work_mode")
    @classmethod
    def validate_work_mode(cls, v: str | None) -> str | None:
        if v is not None and v not in ("office", "hybrid", "remote"):
            raise ValueError("work_mode must be one of: office, hybrid, remote")
        return v

    @field_validator("profile_visibility")
    @classmethod
    def validate_visibility(cls, v: str | None) -> str | None:
        if v is not None and v not in ("public", "matches_only", "private"):
            raise ValueError("profile_visibility must be one of: public, matches_only, private")
        return v


class PreferencesRequest(BaseModel):
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    move_in_from: Optional[date] = None
    move_in_to: Optional[date] = None
    preferred_stay_months: Optional[int] = None

    @field_validator("min_budget", "max_budget")
    @classmethod
    def must_be_positive(cls, v: Decimal | None) -> Decimal | None:
        if v is not None and v < 0:
            raise ValueError("Budget values must be positive")
        return v

    @model_validator(mode="after")
    def max_gte_min(self) -> "PreferencesRequest":
        if (
            self.min_budget is not None
            and self.max_budget is not None
            and self.max_budget < self.min_budget
        ):
            raise ValueError("max_budget must be greater than or equal to min_budget")
        return self


class PreferencesResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    currency: str
    move_in_from: Optional[date] = None
    move_in_to: Optional[date] = None
    preferred_stay_months: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class ProfileCompletionResponse(BaseModel):
    percentage: int
    completed_fields: list[str]
    missing_fields: list[str]


class CityResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    name: str
    state: str
    timezone: str


class NeighbourhoodResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    city_id: uuid.UUID
    name: str
