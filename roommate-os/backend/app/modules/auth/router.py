"""Auth HTTP routes."""
from __future__ import annotations

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import get_current_user
from app.core.config import get_settings
from app.core.database import get_db
from app.core.exceptions import UnauthorizedError
from app.modules.auth import service
from app.modules.auth.schemas import LoginRequest, MeResponse, RegisterRequest, TokenResponse

router = APIRouter()

_COOKIE_NAME = "refresh_token"
_COOKIE_MAX_AGE = 60 * 60 * 24 * 7  # 7 days in seconds


def _set_refresh_cookie(response: Response, token: str) -> None:
    settings = get_settings()
    response.set_cookie(
        key=_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=settings.app_env == "production",
        samesite="lax",
        max_age=_COOKIE_MAX_AGE,
        path="/api/v1/auth",
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key=_COOKIE_NAME, path="/api/v1/auth")


@router.post("/register", status_code=status.HTTP_201_CREATED, response_model=TokenResponse)
async def register(
    body: RegisterRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    settings = get_settings()
    user, access_token, refresh_token = await service.register(
        db, body.email, body.password, body.display_name
    )
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=MeResponse.model_validate(user),
    )


@router.post("/login", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def login(
    body: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    settings = get_settings()
    user, access_token, refresh_token = await service.login(db, body.email, body.password)
    _set_refresh_cookie(response, refresh_token)
    return TokenResponse(
        access_token=access_token,
        expires_in=settings.access_token_expire_minutes * 60,
        user=MeResponse.model_validate(user),
    )


@router.post("/refresh", status_code=status.HTTP_200_OK, response_model=TokenResponse)
async def refresh_token(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=_COOKIE_NAME),
) -> TokenResponse:
    settings = get_settings()
    if not refresh_token:
        raise UnauthorizedError("No refresh token provided")
    new_access, new_refresh = await service.refresh(db, refresh_token)
    _set_refresh_cookie(response, new_refresh)
    return TokenResponse(
        access_token=new_access,
        expires_in=settings.access_token_expire_minutes * 60,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    response: Response,
    db: AsyncSession = Depends(get_db),
    refresh_token: str | None = Cookie(default=None, alias=_COOKIE_NAME),
) -> None:
    if refresh_token:
        await service.logout(db, refresh_token)
    _clear_refresh_cookie(response)


@router.get("/me", response_model=MeResponse)
async def me(current_user=Depends(get_current_user)) -> MeResponse:  # noqa: ANN001
    return MeResponse.model_validate(current_user)
