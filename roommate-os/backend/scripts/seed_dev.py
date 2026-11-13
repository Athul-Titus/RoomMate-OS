"""
DEMO SEED SCRIPT — FOR LOCAL DEVELOPMENT ONLY.
DO NOT RUN IN PRODUCTION.

Creates all tables if they do not exist, then seeds:
- City: Kochi, Kerala
- Neighbourhoods: Kakkanad, Infopark Phase 1 & 2, SmartCity, Edachira, Vazhakkala, Thrikkakara, Palarivattom
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
from sqlalchemy import text

# Import declarative Base and all models so metadata knows all tables
from app.core.database import Base
import app.modules.auth.models  # noqa: F401
import app.modules.profiles.models  # noqa: F401

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

async def seed():
    engine = create_async_engine(DATABASE_URL, echo=False)
    
    # 1. Create all tables if they do not exist
    print("🛠 Creating database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("✅ Tables verified!")

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

        await session.commit()
        print("✅ Seed complete! Kochi and 8 Kakkanad IT corridors ready.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(seed())
