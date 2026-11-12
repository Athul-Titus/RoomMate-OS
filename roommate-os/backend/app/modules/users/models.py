"""Users module — re-exports User from auth.models to avoid circular imports."""
from __future__ import annotations

from app.modules.auth.models import User

__all__ = ["User"]
