"""Auth business logic."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import ConflictError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    hash_password,
    hash_token,
    verify_password,
)
from app.modules.auth.models import User
from app.modules.auth.repository import (
    create_audit_log,
    create_user,
    get_refresh_token,
    get_user_by_email,
    revoke_refresh_token,
    store_refresh_token,
)

# Generic error message — prevents email enumeration
_AUTH_ERROR = "Invalid credentials"


async def register(
    db: AsyncSession,
    email: str,
    password: str,
    display_name: str,
) -> tuple[User, str, str]:
    """
    Register a new user. Raises ConflictError with a generic message
    to prevent account enumeration (same message whether email exists or not).
    Returns (user, access_token, refresh_token).
    """
    existing = await get_user_by_email(db, email)
    if existing is not None:
        # Same error message to prevent enumeration
        raise ConflictError("An account with this email already exists")

    pw_hash = hash_password(password)
    user = await create_user(db, email, pw_hash, display_name)

    access_token = create_access_token(subject=str(user.id))
    refresh_token_str = create_refresh_token(subject=str(user.id))

    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await store_refresh_token(db, user.id, hash_token(refresh_token_str), expires_at)

    await create_audit_log(
        db,
        actor_id=user.id,
        action="user_registered",
        entity_type="user",
        entity_id=user.id,
        metadata={"email_domain": email.split("@")[-1]},
    )

    return user, access_token, refresh_token_str


async def login(
    db: AsyncSession,
    email: str,
    password: str,
) -> tuple[User, str, str]:
    """
    Authenticate user. Uses the same generic error for wrong email OR wrong
    password to prevent enumeration.
    Returns (user, access_token, refresh_token).
    """
    user = await get_user_by_email(db, email)
    if user is None or user.password_hash is None:
        raise UnauthorizedError(_AUTH_ERROR)

    if not verify_password(password, user.password_hash):
        raise UnauthorizedError(_AUTH_ERROR)

    if user.account_status != "active":
        raise UnauthorizedError(_AUTH_ERROR)

    # Update last active
    user.last_active_at = datetime.now(timezone.utc)
    db.add(user)

    access_token = create_access_token(subject=str(user.id))
    refresh_token_str = create_refresh_token(subject=str(user.id))

    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await store_refresh_token(db, user.id, hash_token(refresh_token_str), expires_at)

    await create_audit_log(
        db,
        actor_id=user.id,
        action="user_logged_in",
        entity_type="user",
        entity_id=user.id,
    )

    return user, access_token, refresh_token_str


async def refresh(
    db: AsyncSession,
    refresh_token_str: str,
) -> tuple[str, str]:
    """
    Issue a new access + refresh token pair. Revokes the old refresh token.
    Raises UnauthorizedError if the token is invalid, expired, or already revoked.
    """
    from app.core.security import decode_token
    from app.modules.auth.repository import get_user_by_id

    try:
        payload = decode_token(refresh_token_str)
    except UnauthorizedError:
        raise UnauthorizedError("Invalid or expired refresh token")

    if payload.get("type") != "refresh":
        raise UnauthorizedError("Invalid token type")

    token_hash = hash_token(refresh_token_str)
    stored = await get_refresh_token(db, token_hash)

    if stored is None:
        raise UnauthorizedError("Refresh token not found")
    if stored.revoked_at is not None:
        raise UnauthorizedError("Refresh token has been revoked")
    if stored.expires_at < datetime.now(timezone.utc):
        raise UnauthorizedError("Refresh token has expired")

    # Revoke old token
    await revoke_refresh_token(db, token_hash)

    user_id = payload.get("sub", "")
    user = await get_user_by_id(db, user_id)
    if user is None or user.account_status != "active":
        raise UnauthorizedError("User not found or inactive")

    # Issue new pair
    new_access = create_access_token(subject=str(user.id))
    new_refresh = create_refresh_token(subject=str(user.id))

    settings = get_settings()
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days)
    await store_refresh_token(db, user.id, hash_token(new_refresh), expires_at)

    return new_access, new_refresh


async def logout(db: AsyncSession, refresh_token_str: str) -> None:
    """Revoke the given refresh token."""
    token_hash = hash_token(refresh_token_str)
    await revoke_refresh_token(db, token_hash)
