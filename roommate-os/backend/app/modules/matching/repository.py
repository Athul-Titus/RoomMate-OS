"""Matching and Discovery repository."""
from __future__ import annotations

import uuid
from typing import Sequence

from sqlalchemy import and_, or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.auth.models import User
from app.modules.lifestyle.models import LifestyleAnswer, UserDealbreaker
from app.modules.matching.models import DiscoveryAction, MutualMatch
from app.modules.messaging.models import Conversation, ConversationMember
from app.modules.moderation.models import UserBlock
from app.modules.profiles.models import UserPreferences, UserProfile


async def get_candidate_users(
    db: AsyncSession, current_user_id: uuid.UUID
) -> Sequence[tuple[User, UserProfile, UserPreferences | None]]:
    # Subquery: blocked users
    blocked_subq = select(UserBlock.blocked_user_id).where(UserBlock.user_id == current_user_id)
    blocking_me_subq = select(UserBlock.user_id).where(UserBlock.blocked_user_id == current_user_id)

    # Subquery: already passed users
    passed_subq = select(DiscoveryAction.target_user_id).where(
        DiscoveryAction.user_id == current_user_id, DiscoveryAction.action == "pass"
    )

    stmt = (
        select(User, UserProfile, UserPreferences)
        .join(UserProfile, User.id == UserProfile.user_id)
        .outerjoin(UserPreferences, User.id == UserPreferences.user_id)
        .where(
            User.id != current_user_id,
            User.account_status == "active",
            UserProfile.profile_visibility != "private",
            ~User.id.in_(blocked_subq),
            ~User.id.in_(blocking_me_subq),
            ~User.id.in_(passed_subq),
        )
    )
    result = await db.execute(stmt)
    return result.all()


async def get_user_answers_map(db: AsyncSession, user_id: uuid.UUID) -> dict[str, str]:
    stmt = (
        select(LifestyleAnswer)
        .where(LifestyleAnswer.user_id == user_id)
    )
    res = await db.execute(stmt)
    answers = res.scalars().all()
    # Also fetch question dimensions
    ans_map = {}
    for a in answers:
        q_res = await db.execute(select(a.question.__class__).where(a.question.__class__.id == a.question_id))
        q = q_res.scalar_one_or_none()
        if q:
            ans_map[q.dimension] = a.answer_value
            ans_map[q.question_key] = a.answer_value
    return ans_map


async def get_user_dealbreakers_map(db: AsyncSession, user_id: uuid.UUID) -> dict[str, list[str]]:
    stmt = select(UserDealbreaker).where(UserDealbreaker.user_id == user_id, UserDealbreaker.is_active.is_(True))
    res = await db.execute(stmt)
    dbs = res.scalars().all()
    return {d.question_key: d.unacceptable_values for d in dbs}


async def get_action(
    db: AsyncSession, user_id: uuid.UUID, target_user_id: uuid.UUID
) -> DiscoveryAction | None:
    stmt = select(DiscoveryAction).where(
        DiscoveryAction.user_id == user_id, DiscoveryAction.target_user_id == target_user_id
    )
    res = await db.execute(stmt)
    return res.scalar_one_or_none()


async def record_action(
    db: AsyncSession, user_id: uuid.UUID, target_user_id: uuid.UUID, action: str
) -> tuple[bool, uuid.UUID | None]:
    """Records an action and checks for mutual interest. Returns (is_mutual_match, conversation_id)."""
    stmt = (
        insert(DiscoveryAction)
        .values(
            id=uuid.uuid4(),
            user_id=user_id,
            target_user_id=target_user_id,
            action=action,
        )
        .on_conflict_do_update(
            constraint="uq_user_target_action",
            set_={"action": action},
        )
    )
    await db.execute(stmt)

    if action != "express_interest":
        await db.flush()
        return False, None

    # Check if target user has expressed interest in current user
    target_action = await get_action(db, target_user_id, user_id)
    if target_action and target_action.action == "express_interest":
        # Create Mutual Match
        user_a, user_b = (user_id, target_user_id) if user_id < target_user_id else (target_user_id, user_id)
        match_stmt = (
            insert(MutualMatch)
            .values(
                id=uuid.uuid4(),
                user_a_id=user_a,
                user_b_id=user_b,
                status="active",
            )
            .on_conflict_do_update(
                constraint="uq_mutual_match_pair",
                set_={"status": "active"},
            )
            .returning(MutualMatch)
        )
        res = await db.execute(match_stmt)
        match_obj = res.scalar_one()

        # Check or Create Conversation
        conv_stmt = (
            select(Conversation.id)
            .join(ConversationMember, Conversation.id == ConversationMember.conversation_id)
            .where(ConversationMember.user_id.in_([user_a, user_b]))
            .group_by(Conversation.id)
            .having(select(func.count(ConversationMember.id)).filter(ConversationMember.user_id.in_([user_a, user_b])).correlate(Conversation).as_scalar() == 2)
        )
        # Simplified conversation creation for match
        conv = Conversation(id=uuid.uuid4())
        db.add(conv)
        await db.flush()
        db.add(ConversationMember(id=uuid.uuid4(), conversation_id=conv.id, user_id=user_a))
        db.add(ConversationMember(id=uuid.uuid4(), conversation_id=conv.id, user_id=user_b))
        await db.flush()
        return True, conv.id

    await db.flush()
    return False, None


async def get_mutual_matches(db: AsyncSession, current_user_id: uuid.UUID) -> Sequence[MutualMatch]:
    stmt = (
        select(MutualMatch)
        .where(
            or_(MutualMatch.user_a_id == current_user_id, MutualMatch.user_b_id == current_user_id),
            MutualMatch.status == "active",
        )
        .order_by(MutualMatch.matched_at.desc())
    )
    res = await db.execute(stmt)
    return res.scalars().all()


async def get_match_conversation(
    db: AsyncSession, user_a: uuid.UUID, user_b: uuid.UUID
) -> uuid.UUID | None:
    # Find existing conversation between the two users
    stmt = (
        select(ConversationMember.conversation_id)
        .where(ConversationMember.user_id.in_([user_a, user_b]))
        .group_by(ConversationMember.conversation_id)
    )
    res = await db.execute(stmt)
    rows = res.scalars().all()
    for c_id in rows:
        members_stmt = select(ConversationMember.user_id).where(ConversationMember.conversation_id == c_id)
        members_res = await db.execute(members_stmt)
        members = set(members_res.scalars().all())
        if members == {user_a, user_b}:
            return c_id
    return None
