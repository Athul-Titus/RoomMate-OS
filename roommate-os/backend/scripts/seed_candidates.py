"""Seed demo flatmate candidates for Kochi / Kakkanad Infopark."""
import asyncio
import sys
import uuid
from pathlib import Path
from decimal import Decimal
from datetime import date

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.core.security import hash_password
from app.modules.auth.models import User
from app.modules.profiles.models import UserProfile, UserPreferences
from app.modules.lifestyle.models import LifestyleAnswer

DATABASE_URL = "postgresql+asyncpg://roommate:roommate@localhost:5432/roommate_os"

CANDIDATES = [
    {
        "email": "rahul.nair@example.com",
        "display_name": "Rahul Nair",
        "bio": "Senior frontend dev working at Infopark Phase 1. Looking for a quiet flatmate who keeps common areas clean and values personal space.",
        "occupation_category": "it_software",
        "work_mode": "hybrid",
        "min_budget": Decimal("12000"),
        "max_budget": Decimal("22000"),
        "move_in_from": date(2026, 12, 1),
        "preferred_stay_months": 11,
        "answers": [
            (uuid.UUID("c0000000-0000-0000-0000-000000000001"), "balanced"),
            (uuid.UUID("c0000000-0000-0000-0000-000000000002"), "early_bird"),
            (uuid.UUID("c0000000-0000-0000-0000-000000000003"), "moderate"),
        ]
    },
    {
        "email": "ananya.menon@example.com",
        "display_name": "Ananya Menon",
        "bio": "Product designer at SmartCity Kochi. Clean, organized, loves weekend cooking and quiet weekday evenings. Looking for 2BHK/3BHK shared flat in Kakkanad or Edachira.",
        "occupation_category": "design",
        "work_mode": "hybrid",
        "min_budget": Decimal("14000"),
        "max_budget": Decimal("25000"),
        "move_in_from": date(2026, 12, 15),
        "preferred_stay_months": 11,
        "answers": [
            (uuid.UUID("c0000000-0000-0000-0000-000000000001"), "proactive"),
            (uuid.UUID("c0000000-0000-0000-0000-000000000002"), "flexible"),
            (uuid.UUID("c0000000-0000-0000-0000-000000000003"), "minimal"),
        ]
    },
]

async def seed_candidates():
    engine = create_async_engine(DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        for c in CANDIDATES:
            # Check user
            u_res = await session.execute(select(User).where(User.email == c["email"]))
            user = u_res.scalar_one_or_none()
            if not user:
                user = User(
                    id=uuid.uuid4(),
                    email=c["email"],
                    password_hash=hash_password("Password123"),
                    account_status="active",
                )
                session.add(user)
                await session.flush()

                profile = UserProfile(
                    user_id=user.id,
                    display_name=c["display_name"],
                    bio=c["bio"],
                    occupation_category=c["occupation_category"],
                    work_mode=c["work_mode"],
                    profile_visibility="public",
                    profile_completion=85,
                )
                session.add(profile)

                prefs = UserPreferences(
                    user_id=user.id,
                    min_budget=c["min_budget"],
                    max_budget=c["max_budget"],
                    move_in_from=c["move_in_from"],
                    preferred_stay_months=c["preferred_stay_months"],
                )
                session.add(prefs)
                await session.flush()

                for q_id, ans_val in c["answers"]:
                    ans = LifestyleAnswer(
                        id=uuid.uuid4(),
                        user_id=user.id,
                        question_id=q_id,
                        answer_value=ans_val,
                    )
                    session.add(ans)

        await session.commit()
        print("✅ Candidates seeded successfully!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed_candidates())

