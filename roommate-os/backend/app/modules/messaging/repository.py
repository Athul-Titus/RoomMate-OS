"""Messaging repository functions."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.modules.messaging.models import Conversation, ConversationMember, Message
from app.modules.profiles.models import UserProfile


async def is_member(db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID) -> bool:
    stmt = select(ConversationMember).where(
        ConversationMember.conversation_id == conversation_id,
        ConversationMember.user_id == user_id,
    )
    res = await db.execute(stmt)
    return res.scalar_one_or_none() is not None


async def get_user_conversations(
    db: AsyncSession, user_id: uuid.UUID
) -> list[dict]:
    # Find all conversation IDs for user
    my_convs_stmt = select(ConversationMember.conversation_id).where(ConversationMember.user_id == user_id)
    my_convs = (await db.execute(my_convs_stmt)).scalars().all()

    conv_summaries = []
    for c_id in my_convs:
        # Find partner
        partner_stmt = (
            select(ConversationMember.user_id, UserProfile.display_name)
            .join(UserProfile, ConversationMember.user_id == UserProfile.user_id)
            .where(ConversationMember.conversation_id == c_id, ConversationMember.user_id != user_id)
        )
        partner_row = (await db.execute(partner_stmt)).first()
        if not partner_row:
            continue
        partner_id, partner_name = partner_row

        # Last message
        last_msg_stmt = (
            select(Message)
            .where(Message.conversation_id == c_id)
            .order_by(Message.created_at.desc())
            .limit(1)
        )
        last_msg = (await db.execute(last_msg_stmt)).scalar_one_or_none()

        # Unread count
        unread_stmt = (
            select(func.count(Message.id))
            .where(
                Message.conversation_id == c_id,
                Message.sender_id != user_id,
                Message.is_read.is_(False),
            )
        )
        unread_count = (await db.execute(unread_stmt)).scalar() or 0

        conv_stmt = select(Conversation).where(Conversation.id == c_id)
        conv = (await db.execute(conv_stmt)).scalar_one()

        conv_summaries.append({
            "id": c_id,
            "partner_id": partner_id,
            "partner_name": partner_name,
            "last_message": last_msg,
            "unread_count": unread_count,
            "updated_at": conv.updated_at,
        })

    conv_summaries.sort(key=lambda x: x["updated_at"], reverse=True)
    return conv_summaries


async def get_messages(
    db: AsyncSession, conversation_id: uuid.UUID, limit: int = 100
) -> Sequence[Message]:
    stmt = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    return res.scalars().all()


async def add_message(
    db: AsyncSession, conversation_id: uuid.UUID, sender_id: uuid.UUID, content: str
) -> Message:
    msg = Message(
        id=uuid.uuid4(),
        conversation_id=conversation_id,
        sender_id=sender_id,
        content=content.strip(),
        is_read=False,
    )
    db.add(msg)
    
    # Touch conversation updated_at
    conv_stmt = select(Conversation).where(Conversation.id == conversation_id)
    conv = (await db.execute(conv_stmt)).scalar_one_or_none()
    if conv:
        from datetime import datetime, timezone
        conv.updated_at = datetime.now(timezone.utc)

    await db.flush()
    return msg


async def mark_messages_read(
    db: AsyncSession, conversation_id: uuid.UUID, user_id: uuid.UUID
) -> None:
    from sqlalchemy import update
    stmt = (
        update(Message)
        .where(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read.is_(False),
        )
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.flush()
