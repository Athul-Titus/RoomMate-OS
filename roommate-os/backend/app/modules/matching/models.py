"""Matching, Discovery actions, and Mutual Matches models."""
from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base, TimestampMixin, UUIDMixin


class DiscoveryAction(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "discovery_actions"
    __table_args__ = (
        UniqueConstraint("user_id", "target_user_id", name="uq_user_target_action"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    target_user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    # Action type: "pass" | "save" | "express_interest"
    action: Mapped[str] = mapped_column(String(30), nullable=False)


class MutualMatch(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "mutual_matches"
    __table_args__ = (
        UniqueConstraint("user_a_id", "user_b_id", name="uq_mutual_match_pair"),
        CheckConstraint("user_a_id < user_b_id", name="chk_canonical_user_order"),
    )

    user_a_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    user_b_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    compatibility_score: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    status: Mapped[str] = mapped_column(String(20), default="active", nullable=False)  # active | unmatched
    matched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

