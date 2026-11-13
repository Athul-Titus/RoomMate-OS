"""Lifestyle questionnaire and dealbreakers models."""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin, UUIDMixin


class LifestyleQuestion(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lifestyle_questions"

    question_key: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    question_text: Mapped[str] = mapped_column(Text, nullable=False)
    dimension: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., cleanliness, sleep, guests
    options_json: Mapped[list[dict[str, Any]]] = mapped_column(JSONB, nullable=False)
    order_num: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    answers: Mapped[list[LifestyleAnswer]] = relationship(
        "LifestyleAnswer", back_populates="question", cascade="all, delete-orphan"
    )


class LifestyleAnswer(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "lifestyle_answers"
    __table_args__ = (
        UniqueConstraint("user_id", "question_id", name="uq_user_question_answer"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("lifestyle_questions.id", ondelete="CASCADE"), nullable=False
    )
    answer_value: Mapped[str] = mapped_column(String(100), nullable=False)

    question: Mapped[LifestyleQuestion] = relationship("LifestyleQuestion", back_populates="answers")


class UserDealbreaker(UUIDMixin, TimestampMixin, Base):
    __tablename__ = "user_dealbreakers"
    __table_args__ = (
        UniqueConstraint("user_id", "question_key", name="uq_user_dealbreaker_key"),
    )

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    question_key: Mapped[str] = mapped_column(String(50), nullable=False)
    unacceptable_values: Mapped[list[str]] = mapped_column(JSONB, nullable=False)  # List of values user cannot tolerate
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
