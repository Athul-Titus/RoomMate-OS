"""Main API router — mounts all module routers under /api/v1."""
from __future__ import annotations

from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.modules.auth.router import router as auth_router
from app.modules.profiles.router import router as profiles_router, locations_router

api_router = APIRouter(prefix="/api/v1")

# Health endpoints — no auth
@api_router.get("/health", tags=["ops"])
async def health() -> JSONResponse:
    return JSONResponse({"status": "ok"})


@api_router.get("/ready", tags=["ops"])
async def ready() -> JSONResponse:
    return JSONResponse({"status": "ready"})


# Module routers
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(profiles_router, prefix="/profiles", tags=["profiles"])
api_router.include_router(locations_router, tags=["locations"])
