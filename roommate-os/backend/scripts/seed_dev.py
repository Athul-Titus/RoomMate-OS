"""
DEMO SEED SCRIPT — FOR LOCAL DEVELOPMENT ONLY.
DO NOT RUN IN PRODUCTION.

Creates all tables for Phase 1 & Phase 2 if they do not exist, then seeds:
- City: Kochi, Kerala
- Neighbourhoods: Kakkanad, Infopark Phase 1 & 2, SmartCity, Edachira, Vazhakkala, Thrikkakara, Palarivattom
- Phase 2 Default 3-Question Lifestyle Assessment
"""

import asyncio
import os
import sys
import uuid
from pathlib import Path

# Ensure backend root directory is in sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text, select

# Import declarative Base and all models across Phase 1 & Phase 2
from app.core.database import Base
from app.modules.lifestyle.models import LifestyleQuestion
import app.modules.auth.models  # noqa: F401
import app.modules.profiles.models  # noqa: F401
import app.modules.matching.models  # noqa: F401
import app.modules.messaging.models  # noqa: F401
import app.modules.moderation.models  # noqa: F401

DATABASE_URL = "postgresql+asyncpg://roommate:roommate@localhost:5432/roommate_os"

# Fixed UUIDs for idempotency
KOCHI_CITY_ID = uuid.UUID("a0000000-0000-0000-0000-000000000001")

NEIGHBOURHOODS = [
    ("Kakkanad", uuid.UUID("b0000000-0000-0000-0000-000000000001")),
    ("Infopark Phase 1", uuid.UUID("b0000000-0000-0000-0000-000000000002")),
    ("Infopark Phase 2", uuid.UUID("b0000000-0000-0000-0000-000000000003")),
    ("SmartCity", uuid.UUID("b0000000-0000-0000-0000-000000000004")),
    ("Edachira", uuid.UUID("b0000000-0000-0000-0000-000000000005")),
    ("Vazhakkala", uuid.UUID("b0000000-0000-0000-0000-000000000006")),
    ("Thrikkakara", uuid.UUID("b0000000-0000-0000-0000-000000000007")),
    ("Palarivattom", uuid.UUID("b0000000-0000-0000-0000-000000000008")),
]

LIFESTYLE_QUESTIONS = [
    {
        "id": uuid.UUID("c0000000-0000-0000-0000-000000000001"),
        "question_key": "cleanliness",
        "dimension": "cleanliness",
        "question_text": "How do you manage daily cleanliness and household chores?",
        "options_json": [
            {"value": "proactive", "label": "Very tidy: Clean up immediately after cooking/eating and keep common areas neat."},
            {"value": "balanced", "label": "Balanced: Reasonably neat, clean up once a day or on a regular routine."},
            {"value": "relaxed", "label": "Relaxed: Comfortable with occasional clutter, deep clean on weekends."}
        ],
        "order_num": 1
    },
    {
        "id": uuid.UUID("c0000000-0000-0000-0000-000000000002"),
        "question_key": "sleep_schedule",
        "dimension": "sleep",
        "question_text": "What is your typical sleep and quiet hours schedule?",
        "options_json": [
            {"value": "early_bird", "label": "Early riser: Sleep before 11 PM and prefer quiet mornings."},
            {"value": "flexible", "label": "Standard hours: Sleep around midnight, quiet after 11 PM."},
            {"value": "night_owl", "label": "Night owl: Active past 1 AM, remote/US shift work schedule."}
        ],
        "order_num": 2
    },
    {
        "id": uuid.UUID("c0000000-0000-0000-0000-000000000003"),
        "question_key": "guest_policy",
        "dimension": "guests",
        "question_text": "What is your preference regarding visitors and overnight guests?",
        "options_json": [
            {"value": "minimal", "label": "Quiet home: Advance notice required for any visitors, no frequent guests."},
            {"value": "moderate", "label": "Moderate: Friends welcome occasionally with reasonable advance heads-up."},
            {"value": "social", "label": "Social: Open-door vibe, frequent friends and gatherings are welcome."}
        ],
        "order_num": 3
    },
]

async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # 1. Create all Phase 1 & Phase 2 tables if they do not exist
    print("🛠 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ All tables verified!")

    # 2. Seed Kochi and Neighbourhoods
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        print("🌱 Seeding Kochi (Kakkanad & Infopark) city and neighbourhoods...")
        
        # Insert City
        await session.execute(
            text("""
            INSERT INTO cities (id, name, state, country_code, timezone, active, created_at, updated_at)
            VALUES (:id, 'Kochi', 'Kerala', 'IN', 'Asia/Kolkata', true, NOW(), NOW())
            ON CONFLICT (id) DO NOTHING;
            """),
            {"id": KOCHI_CITY_ID}
        )

        # Insert Neighbourhoods
        for name, n_id in NEIGHBOURHOODS:
            await session.execute(
                text("""
                INSERT INTO neighbourhoods (id, city_id, name, active, created_at, updated_at)
                VALUES (:id, :city_id, :name, true, NOW(), NOW())
                ON CONFLICT (id) DO NOTHING;
                """),
                {"id": n_id, "city_id": KOCHI_CITY_ID, "name": name}
            )

        # 3. Seed 3 Lifestyle Questions using ORM
        print("📋 Seeding default 3-question lifestyle assessment...")
        for q_data in LIFESTYLE_QUESTIONS:
            existing = await session.execute(
                select(LifestyleQuestion).where(LifestyleQuestion.id == q_data["id"])
            )
            q_obj = existing.scalar_one_or_none()
            if not q_obj:
                q_obj = LifestyleQuestion(**q_data)
                session.add(q_obj)
            else:
                q_obj.question_text = q_data["question_text"]
                q_obj.options_json = q_data["options_json"]
                q_obj.dimension = q_data["dimension"]

        await session.commit()
        print("✅ Phase 2 seed complete! Kochi tech corridor and lifestyle questions ready.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
