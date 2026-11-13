"""Lifestyle questionnaire and dealbreaker schemas."""
from __future__ import annotations

import uuid
from typing import Any

from pydantic import BaseModel, ConfigDict


class QuestionOption(BaseModel):
    value: str
    label: str


class LifestyleQuestionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    question_key: str
    dimension: str
    question_text: str
    options_json: list[dict[str, Any]]
    order_num: int


class SubmitAnswerItem(BaseModel):
    question_id: uuid.UUID
    answer_value: str


class SubmitAnswersRequest(BaseModel):
    answers: list[SubmitAnswerItem]


class UserAnswerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_id: uuid.UUID
    question_key: str
    dimension: str
    answer_value: str


class SetDealbreakerRequest(BaseModel):
    question_key: str
    unacceptable_values: list[str]


class DealbreakerResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    question_key: str
    unacceptable_values: list[str]

