"""Moderation repository."""
from __future__ import annotations

import uuid

from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.moderation.models import UserBlock, UserReport


async def block_user(db: AsyncSession, user_id: uuid.UUID, blocked_user_id: uuid.UUID) -> None:
    stmt = (
        insert(UserBlock)
        .values(
            id=uuid.uuid4(),
            user_id=user_id,
            blocked_user_id=blocked_user_id,
        )
        .on_conflict_do_nothing(constraint="uq_user_blocked_pair")
    )
    await db.execute(stmt)
    await db.flush()


async def unblock_user(db: AsyncSession, user_id: uuid.UUID, blocked_user_id: uuid.UUID) -> None:
    from sqlalchemy import delete
    stmt = delete(UserBlock).where(
        UserBlock.user_id == user_id,
        UserBlock.blocked_user_id == blocked_user_id,
    )
    await db.execute(stmt)
    await db.flush()


async def create_report(
    db: AsyncSession,
    reporter_id: uuid.UUID,
    reported_id: uuid.UUID,
    reason: str,
    description: str | None = None,
) -> UserReport:
    report = UserReport(
        id=uuid.uuid4(),
        reporter_user_id=reporter_id,
        reported_user_id=reported_id,
        reason=reason,
        description=description,
        status="pending",
    )
    db.add(report)
    await db.flush()
    return report
