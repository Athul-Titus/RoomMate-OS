"""Messaging routes and WebSocket endpoint."""
from __future__ import annotations

import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.database import AsyncSessionLocal, get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token
from app.modules.auth.models import User
from app.modules.messaging import repository as repo
from app.modules.messaging.schemas import ConversationResponse, MessageResponse, SendMessageRequest
from app.modules.messaging.service import MessagingService, manager

router = APIRouter(tags=["Messaging"])


@router.get("/conversations", response_model=list[ConversationResponse])
async def list_conversations(
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[ConversationResponse]:
    return await MessagingService.list_conversations(db, current_user.id)


@router.get("/conversations/{conversation_id}/messages", response_model=list[MessageResponse])
async def get_messages(
    conversation_id: uuid.UUID,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> list[MessageResponse]:
    return await MessagingService.get_messages(db, conversation_id, current_user.id)


@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: uuid.UUID,
    req: SendMessageRequest,
    current_user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MessageResponse:
    return await MessagingService.send_message(db, conversation_id, current_user.id, req.content)


@router.websocket("/ws/conversations/{conversation_id}")
async def websocket_conversation(
    websocket: WebSocket,
    conversation_id: uuid.UUID,
    token: str = Query(...),
) -> None:
    # 1. Authorize token
    try:
        payload = decode_token(token)
        user_id_str = payload.get("sub")
        if not user_id_str:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return
        user_id = uuid.UUID(user_id_str)
    except Exception:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Check conversation membership in DB
    async with AsyncSessionLocal() as db:
        if not await repo.is_member(db, conversation_id, user_id):
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

    # 3. Accept and register connection
    await manager.connect(conversation_id, websocket)

    try:
        while True:
            data = await websocket.receive_json()
            # If client sends a new message over WS directly
            if data.get("type") == "send_message" and data.get("content"):
                async with AsyncSessionLocal() as db:
                    await MessagingService.send_message(
                        db, conversation_id, user_id, data["content"]
                    )
    except WebSocketDisconnect:
        manager.disconnect(conversation_id, websocket)
    except Exception:
        manager.disconnect(conversation_id, websocket)

