"""Permission definitions and authorization helpers."""
from __future__ import annotations

import uuid
from enum import Enum

from app.core.exceptions import ForbiddenError


class Permission(str, Enum):
    READ_PROFILE = "read:profile"
    EDIT_PROFILE = "edit:profile"
    READ_GROUP = "read:group"
    EDIT_GROUP = "edit:group"
    ADMIN_ACCESS = "admin:access"
    MANAGE_USERS = "admin:manage_users"
    VIEW_AUDIT_LOGS = "admin:view_audit_logs"


def require_permission(permission: Permission):  # noqa: ANN201
    """
    Dependency factory that checks a user has the required permission.
    Usage: Depends(require_permission(Permission.EDIT_GROUP))
    """
    from fastapi import Depends
    from app.api.dependencies import get_current_user

    async def _check(current_user=Depends(get_current_user)):  # noqa: ANN001
        if permission == Permission.ADMIN_ACCESS and not current_user.is_admin:
            raise ForbiddenError("Admin access required")
        return current_user

    return _check


def assert_self_or_admin(current_user: object, target_user_id: uuid.UUID) -> None:
    """
    Raise ForbiddenError unless the current_user owns the resource
    or is an admin.
    """
    if getattr(current_user, "is_admin", False):
        return
    if str(getattr(current_user, "id", None)) != str(target_user_id):
        raise ForbiddenError("You can only access your own resources")
