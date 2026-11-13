"""Matching and discovery schemas."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict


class DiscoveryCardResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: uuid.UUID
    display_name: str
    bio: Optional[str] = None
    occupation_category: Optional[str] = None
    work_mode: Optional[str] = None
    min_budget: Optional[Decimal] = None
    max_budget: Optional[Decimal] = None
    move_in_from: Optional[date] = None
    preferred_stay_months: Optional[int] = None
    compatibility_score: int
    alignments: list[str]
    potential_frictions: list[str]
    my_action: Optional[str] = None  # "pass" | "save" | "express_interest" | None


class ActionRequest(BaseModel):
    target_user_id: uuid.UUID
    action: str  # "pass" | "save" | "express_interest"


class ActionResponse(BaseModel):
    user_id: uuid.UUID
    target_user_id: uuid.UUID
    action: str
    is_mutual_match: bool
    conversation_id: Optional[uuid.UUID] = None


class MutualMatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    partner: DiscoveryCardResponse
    compatibility_score: int
    matched_at: datetime
    conversation_id: Optional[uuid.UUID] = None

