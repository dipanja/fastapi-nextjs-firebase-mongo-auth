from typing import Literal

from pydantic import Field, SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings managed by Pydantic."""

    # -------------------------------------------------
    # Explicit environment declarations
    # -------------------------------------------------
    BACKEND_RUNNING_ON: Literal["local", "cloud"] = "local"
    FRONTEND_RUNNING_ON: Literal["local", "cloud"] = "local"

    FRONTEND_URL_LOCAL: str = Field(
        "http://localhost:3000",
        description="Local frontend URL",
    )
    FRONTEND_URL_CLOUD: str = Field(..., description="Cloud frontend URL")

    # Secret variables - using SecretStr for sensitive data
    CLAUDE_API_KEY: SecretStr = Field(..., description="API key for Claude")

    TAVILY_API_KEY: SecretStr = Field(..., description="API key for Tavily")

    MONGO_URI: SecretStr = Field(..., description="MongoDB connection URI")

    REDIS_URL: SecretStr = Field(..., description="Redis connection URL")

    REDIS_HOST: str = Field(..., description="Redis host address")

    # Firebase configuration
    FIREBASE_SERVICE_ACCOUNT_JSON: str = Field(
        ..., description="Complete Firebase service account JSON"
    )

    # Non-secret variables
    DB_NAME: str = Field(..., description="Database name")

    RESULT_COLLECTION: str = Field(
        default="results", description="User collection name"
    )
    USER_COLLECTION: str = Field(default="users", description="user collection name")

    MAX_TAVILY_RESULTS: int = Field(
        default=10, description="Max number of Tavily results"
    )

    MAX_TOKENS: int = Field(default=200, ge=200, description="max tokens for Claude")

    INITIAL_COIN: int = Field(
        default=0,
        description="Initional coin to be given to the user",
    )

    # -------------------------------------------------
    # Derived configuration
    # -------------------------------------------------

    @property
    def allowed_origins(self) -> list[str]:
        """Allowed CORS origins depend on where the frontend runs."""
        if self.FRONTEND_RUNNING_ON == "local":
            return [
                self.FRONTEND_URL_LOCAL,
                "http://127.0.0.1:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3001",
            ]
        else:
            return [self.FRONTEND_URL_CLOUD]

    @property
    def cookie_settings(self) -> dict:
        """Secure cookie policy depends on where backend runs."""
        is_local_backend = self.BACKEND_RUNNING_ON == "local"
        return {
            "httponly": True,
            "secure": not is_local_backend,  # True in cloud, False locally
            "samesite": "none" if not is_local_backend else "lax",
            "max_age": 60 * 60 * 24 * 14,  # 14 days
        }

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


# Create a singleton instance
settings = Settings()  # type: ignore
