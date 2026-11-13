"""Lifestyle service business logic."""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.lifestyle import repository as repo
from app.modules.lifestyle.schemas import (
    DealbreakerResponse,
    LifestyleQuestionResponse,
    SetDealbreakerRequest,
    SubmitAnswersRequest,
    UserAnswerResponse,
)


class LifestyleService:
    @staticmethod
    async def list_questions(db: AsyncSession) -> list[LifestyleQuestionResponse]:
        questions = await repo.get_active_questions(db)
        return [LifestyleQuestionResponse.model_validate(q) for q in questions]

    @staticmethod
    async def get_my_answers(db: AsyncSession, user_id: uuid.UUID) -> list[UserAnswerResponse]:
        answers = await repo.get_user_answers(db, user_id)
        return [
            UserAnswerResponse(
                question_id=a.question_id,
                question_key=a.question.question_key,
                dimension=a.question.dimension,
                answer_value=a.answer_value,
            )
            for a in answers
        ]

    @staticmethod
    async def submit_answers(
        db: AsyncSession, user_id: uuid.UUID, req: SubmitAnswersRequest
    ) -> list[UserAnswerResponse]:
        items = [(item.question_id, item.answer_value) for item in req.answers]
        await repo.upsert_answers(db, user_id, items)
        return await LifestyleService.get_my_answers(db, user_id)

    @staticmethod
    async def get_my_dealbreakers(db: AsyncSession, user_id: uuid.UUID) -> list[DealbreakerResponse]:
        dbs = await repo.get_user_dealbreakers(db, user_id)
        return [
            DealbreakerResponse(
                question_key=d.question_key,
                unacceptable_values=d.unacceptable_values,
            )
            for d in dbs
        ]

    @staticmethod
    async def set_dealbreaker(
        db: AsyncSession, user_id: uuid.UUID, req: SetDealbreakerRequest
    ) -> DealbreakerResponse:
        db_obj = await repo.upsert_dealbreaker(db, user_id, req.question_key, req.unacceptable_values)
        return DealbreakerResponse(
            question_key=db_obj.question_key,
            unacceptable_values=db_obj.unacceptable_values,
        )

