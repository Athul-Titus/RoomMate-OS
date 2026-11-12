"""Application configuration via Pydantic Settings."""
from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_env: str = "local"
    app_name: str = "ROOMMATE OS"
    app_version: str = "0.1.0"

    # Security
    secret_key: str
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # Database
    database_url: str
    database_url_sync: str

    # Redis
    redis_url: str = "redis://localhost:6379/0"

    # Email
    email_adapter: str = "console"
    email_from_address: str = "no-reply@roommateos.com"
    email_from_name: str = "ROOMMATE OS"
    resend_api_key: Optional[str] = None

    # Storage
    storage_adapter: str = "minio"
    storage_endpoint: str = "http://localhost:9000"
    storage_access_key: str = "minioadmin"
    storage_secret_key: str = "minioadmin"
    storage_bucket_private: str = "roommate-private"
    storage_bucket_public: str = "roommate-public"
    storage_region: str = "ap-south-1"

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000"]

    # Nominatim (OpenStreetMap geocoding)
    nominatim_base_url: str = "https://nominatim.openstreetmap.org"
    nominatim_user_agent: str = "RoommateOS/0.1"

    @field_validator("allowed_origins", mode="before")
    @classmethod
    def parse_origins(cls, v: object) -> object:
        if isinstance(v, str):
            import json
            return json.loads(v)
        return v


@lru_cache
def get_settings() -> Settings:
    return Settings()
