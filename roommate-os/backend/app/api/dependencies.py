"""FastAPI dependencies for authentication and authorization."""
from __future__ import annotations

import structlog
from fastapi import Depends, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import ForbiddenError, UnauthorizedError
from app.core.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

logger = structlog.get_logger(__name__)


async def get_current_user(
    request: Request,
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> object:
    """
    Decode the JWT, look up the user, assert account is active.
    Raises UnauthorizedError on any failure — no hints about which part failed.
    """
    from app.modules.auth.repository import get_user_by_id

    if not token:
        raise UnauthorizedError("Authentication required")

    try:
        payload = decode_token(token)
        token_type = payload.get("type")
        if token_type != "access":
            raise UnauthorizedError("Invalid token type")
        user_id: str = payload.get("sub", "")
        if not user_id:
            raise UnauthorizedError("Invalid token payload")
    except UnauthorizedError:
        raise
    except Exception as exc:
        raise UnauthorizedError("Authentication required") from exc

    user = await get_user_by_id(db, user_id)
    if user is None:
        raise UnauthorizedError("Authentication required")

    if user.account_status != "active":
        raise UnauthorizedError("Account is not active")

    # Bind request_id to structlog context if available
    request_id = getattr(getattr(request, "state", None), "request_id", None)
    if request_id:
        structlog.contextvars.bind_contextvars(request_id=str(request_id), user_id=str(user.id))

    return user


async def get_current_active_user(
    current_user=Depends(get_current_user),  # noqa: ANN001
) -> object:
    """Alias for get_current_user for explicit readability."""
    return current_user


async def require_admin(
    current_user=Depends(get_current_user),  # noqa: ANN001
) -> object:
    """Require the authenticated user to be an admin."""
    if not current_user.is_admin:
        raise ForbiddenError("Admin access required")
    return current_user
