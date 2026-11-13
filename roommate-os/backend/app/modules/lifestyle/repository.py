"""Lifestyle module async data access."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.modules.lifestyle.models import LifestyleAnswer, LifestyleQuestion, UserDealbreaker


async def get_active_questions(db: AsyncSession) -> Sequence[LifestyleQuestion]:
    result = await db.execute(
        select(LifestyleQuestion)
        .where(LifestyleQuestion.is_active.is_(True))
        .order_by(LifestyleQuestion.order_num)
    )
    return result.scalars().all()


async def get_user_answers(db: AsyncSession, user_id: uuid.UUID) -> Sequence[LifestyleAnswer]:
    result = await db.execute(
        select(LifestyleAnswer)
        .options(joinedload(LifestyleAnswer.question))
        .where(LifestyleAnswer.user_id == user_id)
    )
    return result.scalars().all()


async def upsert_answers(
    db: AsyncSession, user_id: uuid.UUID, answers: list[tuple[uuid.UUID, str]]
) -> None:
    for question_id, val in answers:
        stmt = (
            insert(LifestyleAnswer)
            .values(
                id=uuid.uuid4(),
                user_id=user_id,
                question_id=question_id,
                answer_value=val,
            )
            .on_conflict_do_update(
                constraint="uq_user_question_answer",
                set_={"answer_value": val},
            )
        )
        await db.execute(stmt)
    await db.flush()


async def get_user_dealbreakers(db: AsyncSession, user_id: uuid.UUID) -> Sequence[UserDealbreaker]:
    result = await db.execute(
        select(UserDealbreaker)
        .where(UserDealbreaker.user_id == user_id, UserDealbreaker.is_active.is_(True))
    )
    return result.scalars().all()


async def upsert_dealbreaker(
    db: AsyncSession, user_id: uuid.UUID, question_key: str, unacceptable: list[str]
) -> UserDealbreaker:
    stmt = (
        insert(UserDealbreaker)
        .values(
            id=uuid.uuid4(),
            user_id=user_id,
            question_key=question_key,
            unacceptable_values=unacceptable,
            is_active=True,
        )
        .on_conflict_do_update(
            constraint="uq_user_dealbreaker_key",
            set_={"unacceptable_values": unacceptable, "is_active": True},
        )
        .returning(UserDealbreaker)
    )
    result = await db.execute(stmt)
    await db.flush()
    return result.scalar_one()

