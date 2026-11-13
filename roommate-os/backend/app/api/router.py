"""Main API router — mounts all module routers under /api/v1."""
from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.modules.auth.router import router as auth_router
from app.modules.profiles.router import router as profiles_router, locations_router
from app.modules.lifestyle.router import router as lifestyle_router
from app.modules.matching.router import router as matching_router
from app.modules.messaging.router import router as messaging_router
from app.modules.moderation.router import router as moderation_router

api_router = APIRouter(prefix="/api/v1")

# Health endpoints — no auth
@api_router.get("/health", tags=["ops"])
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@api_router.get("/ready", tags=["ops"])
async def ready() -> JSONResponse:
    return JSONResponse({"status": "ready"})


# Module routers
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(profiles_router, prefix="/profiles", tags=["Profiles"])
api_router.include_router(locations_router, tags=["Locations"])
api_router.include_router(lifestyle_router, tags=["Lifestyle"])
api_router.include_router(matching_router, tags=["Matching & Discovery"])
api_router.include_router(messaging_router, tags=["Messaging"])
api_router.include_router(moderation_router, tags=["Moderation & Safety"])
