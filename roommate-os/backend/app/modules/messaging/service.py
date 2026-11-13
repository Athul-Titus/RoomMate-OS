"""Messaging business logic and real-time connection manager."""
from __future__ import annotations

import uuid
from typing import Dict, Set

from fastapi import WebSocket
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.modules.messaging import repository as repo
from app.modules.messaging.models import Message
from app.modules.messaging.schemas import ConversationResponse, MessageResponse


class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: Dict[uuid.UUID, Set[WebSocket]] = {}

    async def connect(self, conversation_id: uuid.UUID, websocket: WebSocket) -> None:
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = set()
        self.active_connections[conversation_id].add(websocket)

    def disconnect(self, conversation_id: uuid.UUID, websocket: WebSocket) -> None:
        if conversation_id in self.active_connections:
            self.active_connections[conversation_id].discard(websocket)
            if not self.active_connections[conversation_id]:
                del self.active_connections[conversation_id]

    async def broadcast(self, conversation_id: uuid.UUID, message_dict: dict) -> None:
        if conversation_id in self.active_connections:
            for connection in list(self.active_connections[conversation_id]):
                try:
                    await connection.send_json(message_dict)
                except Exception:
                    self.disconnect(conversation_id, connection)


manager = ConnectionManager()


class MessagingService:
    @staticmethod
    async def list_conversations(
        db: AsyncSession, user_id: uuid.UUID
    ) -> list[ConversationResponse]:
        raw_list = await repo.get_user_conversations(db, user_id)
        return [
            ConversationResponse(
                id=c["id"],
                partner_id=c["partner_id"],
                partner_name=c["partner_name"],
                last_message=MessageResponse.model_validate(c["last_message"]) if c["last_message"] else None,
                unread_count=c["unread_count"],
                updated_at=c["updated_at"],
            )
            for c in raw_list
        ]

    @staticmethod
    async def get_messages(
        db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
    ) -> list[MessageResponse]:
        if not await repo.is_member(db, conversation_id, user_id):
            raise ForbiddenError("You are not a participant in this conversation")

        await repo.mark_messages_read(db, conversation_id, user_id)
        messages = await repo.get_messages(db, conversation_id)
        return [MessageResponse.model_validate(m) for m in messages]

    @staticmethod
    async def send_message(
        db: AsyncSession, conversation_id: uuid.UUID, sender_id: uuid.UUID, content: str
    ) -> MessageResponse:
        if not await repo.is_member(db, conversation_id, sender_id):
            raise ForbiddenError("You are not a participant in this conversation")

        msg = await repo.add_message(db, conversation_id, sender_id, content)
        resp = MessageResponse.model_validate(msg)

        # Broadcast via WebSockets
        await manager.broadcast(
            conversation_id,
            {
                "type": "new_message",
                "message": {
                    "id": str(resp.id),
                    "conversation_id": str(resp.conversation_id),
                    "sender_id": str(resp.sender_id),
                    "content": resp.content,
                    "is_read": resp.is_read,
                    "created_at": resp.created_at.isoformat(),
                },
            },
        )
        return resp
