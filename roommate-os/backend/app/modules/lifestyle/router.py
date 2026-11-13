"""Lifestyle questionnaire and dealbreaker routes."""
from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import get_db
from app.modules.auth.models import User
from app.modules.lifestyle.schemas import (
    DealbreakerResponse,
    LifestyleQuestionResponse,
    SetDealbreakerRequest,
    SubmitAnswersRequest,
    UserAnswerResponse,
)
from app.modules.lifestyle.service import LifestyleService

router = APIRouter(prefix="/lifestyle", tags=["Lifestyle Assessment"])


@router.get("/questions", response_model=list[LifestyleQuestionResponse])
async def list_questions(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[LifestyleQuestionResponse]:
    return await LifestyleService.list_questions(db)


@router.get("/my-answers", response_model=list[UserAnswerResponse])
async def get_my_answers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserAnswerResponse]:
    return await LifestyleService.get_my_answers(db, current_user.id)


@router.post("/answers", response_model=list[UserAnswerResponse])
async def submit_answers(
    req: SubmitAnswersRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[UserAnswerResponse]:
    return await LifestyleService.submit_answers(db, current_user.id, req)


@router.get("/my-dealbreakers", response_model=list[DealbreakerResponse])
async def get_my_dealbreakers(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[DealbreakerResponse]:
    return await LifestyleService.get_my_dealbreakers(db, current_user.id)


@router.post("/dealbreakers", response_model=DealbreakerResponse)
async def set_dealbreaker(
    req: SetDealbreakerRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> DealbreakerResponse:
    return await LifestyleService.set_dealbreaker(db, current_user.id, req)
