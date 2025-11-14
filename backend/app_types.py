# from enum import StrEnum
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator

from analysis.analysis_types import ServiceType


class SearchRequest(BaseModel):
    """User question model with validation."""

    # user_id: EmailStr
    question: str = Field(min_length=1, description="The search question")
    service_type: ServiceType

    @field_validator("question")
    @classmethod
    def validate_question_not_empty(cls, v: str) -> str:
        """Ensure question is not just whitespace."""
        if not v.strip():
            raise ValueError("Question cannot be empty or contain only whitespace")
        return v.strip()


class TaskResultQuery(BaseModel):
    """Query parameters for retrieving a single task result."""

    # user_id: EmailStr
    task_id: str

    @field_validator("task_id")
    @classmethod
    def validate_task_id_is_valid_uuid(cls, v: str) -> str:
        """Ensure task_id is a valid UUID format."""
        try:
            UUID(v)
        except ValueError:
            raise ValueError("task_id must be a valid UUID")
        return v


class AllResultsByService(BaseModel):
    """Query parameters for retrieving all results by service."""

    # user_id: EmailStr
    service: ServiceType


class AllResultsByUser(BaseModel):
    """Query parameters for retrieving all results by service."""

    # user_id: EmailStr
    pass


class TaskResult(BaseModel):
    """Single task result response model."""

    user_id: str
    task_id: str
    timestamp: str
    original_query: str
    service: ServiceType
    response: Optional[Any] = None

    @field_validator("timestamp", mode="before")
    @classmethod
    def convert_timestamp_to_iso_string(cls, v):
        """Convert datetime to ISO format string."""
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class AllResultsResponse(BaseModel):
    """Response model for all results by service."""

    results: list[TaskResult] = Field(default_factory=list)


class TaskResultSummary(BaseModel):
    """Lightweight task result summary without response data."""

    user_id: str
    task_id: str
    timestamp: str
    original_query: str
    service: ServiceType

    @field_validator("timestamp", mode="before")
    @classmethod
    def convert_timestamp_to_iso_string(cls, v):
        """Convert datetime to ISO format string."""
        if isinstance(v, datetime):
            return v.isoformat()
        return v


class AllResultsSummaryResponse(BaseModel):
    """Response model for all results summary by service (without response data)."""

    results: list[TaskResultSummary] = Field(default_factory=list)


class TaskResponse(BaseModel):
    task_id: str
