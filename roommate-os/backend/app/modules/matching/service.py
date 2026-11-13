"""Matching and Discovery business logic."""
from __future__ import annotations

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.lifestyle.models import LifestyleAnswer
from app.modules.matching import repository as repo
from app.modules.matching.engine import calculate_compatibility
from app.modules.matching.models import MutualMatch
from app.modules.matching.schemas import (
    ActionRequest,
    ActionResponse,
    DiscoveryCardResponse,
    MutualMatchResponse,
)
from app.modules.profiles.models import UserPreferences, UserProfile


class MatchingService:
    @staticmethod
    async def get_discovery_feed(
        db: AsyncSession, current_user_id: uuid.UUID
    ) -> list[DiscoveryCardResponse]:
        candidates = await repo.get_candidate_users(db, current_user_id)
        if not candidates:
            return []

        # Get current user lifestyle & dealbreakers
        my_answers = await repo.get_user_answers_map(db, current_user_id)
        my_dealbreakers = await repo.get_user_dealbreakers_map(db, current_user_id)

        cards: list[DiscoveryCardResponse] = []
        for user, profile, prefs in candidates:
            # Candidate answers and dealbreakers
            cand_answers = await repo.get_user_answers_map(db, user.id)
            cand_dealbreakers = await repo.get_user_dealbreakers_map(db, user.id)

            comp = calculate_compatibility(my_answers, cand_answers, my_dealbreakers, cand_dealbreakers)
            # Skip candidates that conflict with hard dealbreakers
            if comp["is_dealbreaker"]:
                continue

            # Check existing action
            act = await repo.get_action(db, current_user_id, user.id)

            card = DiscoveryCardResponse(
                user_id=user.id,
                display_name=profile.display_name,
                bio=profile.bio,
                occupation_category=profile.occupation_category,
                work_mode=profile.work_mode,
                min_budget=prefs.min_budget if prefs else None,
                max_budget=prefs.max_budget if prefs else None,
                move_in_from=prefs.move_in_from if prefs else None,
                preferred_stay_months=prefs.preferred_stay_months if prefs else None,
                compatibility_score=comp["score"],
                alignments=comp["alignments"],
                potential_frictions=comp["potential_frictions"],
                my_action=act.action if act else None,
            )
            cards.append(card)

        # Sort by compatibility score descending
        cards.sort(key=lambda c: c.compatibility_score, reverse=True)
        return cards

    @staticmethod
    async def perform_action(
        db: AsyncSession, current_user_id: uuid.UUID, req: ActionRequest
    ) -> ActionResponse:
        is_match, conv_id = await repo.record_action(
            db, current_user_id, req.target_user_id, req.action
        )
        return ActionResponse(
            user_id=current_user_id,
            target_user_id=req.target_user_id,
            action=req.action,
            is_mutual_match=is_match,
            conversation_id=conv_id,
        )

    @staticmethod
    async def list_mutual_matches(
        db: AsyncSession, current_user_id: uuid.UUID
    ) -> list[MutualMatchResponse]:
        matches = await repo.get_mutual_matches(db, current_user_id)
        result: list[MutualMatchResponse] = []

        my_answers = await repo.get_user_answers_map(db, current_user_id)
        my_dealbreakers = await repo.get_user_dealbreakers_map(db, current_user_id)

        for m in matches:
            partner_id = m.user_b_id if m.user_a_id == current_user_id else m.user_a_id
            
            # Fetch partner profile
            p_res = await db.execute(select(UserProfile).where(UserProfile.user_id == partner_id))
            partner_prof = p_res.scalar_one_or_none()
            if not partner_prof:
                continue

            prefs_res = await db.execute(select(UserPreferences).where(UserPreferences.user_id == partner_id))
            partner_prefs = prefs_res.scalar_one_or_none()

            partner_answers = await repo.get_user_answers_map(db, partner_id)
            partner_dealbreakers = await repo.get_user_dealbreakers_map(db, partner_id)
            comp = calculate_compatibility(my_answers, partner_answers, my_dealbreakers, partner_dealbreakers)

            conv_id = await repo.get_match_conversation(db, current_user_id, partner_id)

            card = DiscoveryCardResponse(
                user_id=partner_id,
                display_name=partner_prof.display_name,
                bio=partner_prof.bio,
                occupation_category=partner_prof.occupation_category,
                work_mode=partner_prof.work_mode,
                min_budget=partner_prefs.min_budget if partner_prefs else None,
                max_budget=partner_prefs.max_budget if partner_prefs else None,
                move_in_from=partner_prefs.move_in_from if partner_prefs else None,
                preferred_stay_months=partner_prefs.preferred_stay_months if partner_prefs else None,
                compatibility_score=comp["score"],
                alignments=comp["alignments"],
                potential_frictions=comp["potential_frictions"],
                my_action="express_interest",
            )

            result.append(
                MutualMatchResponse(
                    id=m.id,
                    partner=card,
                    compatibility_score=comp["score"],
                    matched_at=m.matched_at,
                    conversation_id=conv_id,
                )
            )

        return result
