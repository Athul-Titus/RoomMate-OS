"""Profiles module SQLAlchemy models."""
from __future__ import annotations

import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import Boolean, Date, Enum, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base, TimestampMixin

_WORK_MODE = Enum("office", "hybrid", "remote", name="work_mode_enum")
_VISIBILITY = Enum("public", "matches_only", "private", name="profile_visibility_enum")


class City(TimestampMixin, Base):
    __tablename__ = "cities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    country_code: Mapped[str] = mapped_column(String(10), nullable=False, default="IN", server_default="IN")
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="Asia/Kolkata", server_default="Asia/Kolkata")
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    neighbourhoods: Mapped[list[Neighbourhood]] = relationship(
        "Neighbourhood", back_populates="city", cascade="all, delete-orphan"
    )


class Neighbourhood(TimestampMixin, Base):
    __tablename__ = "neighbourhoods"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    city_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cities.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    city: Mapped[City] = relationship("City", back_populates="neighbourhoods")


class UserProfile(TimestampMixin, Base):
    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    display_name: Mapped[str] = mapped_column(String(50), nullable=False)
    bio: Mapped[str | None] = mapped_column(Text, nullable=True)
    occupation_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    employer_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    work_mode: Mapped[str | None] = mapped_column(_WORK_MODE, nullable=True)
    profile_photo_key: Mapped[str | None] = mapped_column(Text, nullable=True)
    profile_visibility: Mapped[str] = mapped_column(
        _VISIBILITY, nullable=False, default="public", server_default="public"
    )
    # Computed server-side; never set by client directly
    profile_completion: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    user: Mapped[object] = relationship("User", back_populates="profile")
    preferences: Mapped[UserPreferences | None] = relationship(
        "UserPreferences",
        back_populates="profile",
        uselist=False,
        foreign_keys="[UserPreferences.user_id]",
        primaryjoin="UserProfile.user_id == UserPreferences.user_id",
    )


class UserPreferences(TimestampMixin, Base):
    __tablename__ = "user_preferences"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    min_budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    max_budget: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR", server_default="INR")
    move_in_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    move_in_to: Mapped[date | None] = mapped_column(Date, nullable=True)
    preferred_stay_months: Mapped[int | None] = mapped_column(Integer, nullable=True)

    profile: Mapped[UserProfile | None] = relationship(
        "UserProfile",
        back_populates="preferences",
        foreign_keys=[user_id],
        primaryjoin="UserPreferences.user_id == UserProfile.user_id",
    )
