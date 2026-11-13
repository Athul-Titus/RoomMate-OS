"""Moderation schemas."""
from __future__ import annotations

import uuid
from typing import Optional

from pydantic import BaseModel


class ReportUserRequest(BaseModel):
    reported_user_id: uuid.UUID
    reason: str
    description: Optional[str] = None


class BlockResponse(BaseModel):
    blocked_user_id: uuid.UUID
    status: str
