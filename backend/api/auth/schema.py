# api/auth/schema.py

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class WhoAmIResponse(BaseModel):
    """Response schema for the /api/auth/who-am-i endpoint."""

    success: bool = Field(
        default=True, description="Indicates if the request was successful"
    )
    firebase_uid: str = Field(..., description="User's Firebase UID")
    email: str = Field(..., description="User's email address")
    name: str = Field(default="", description="User's display name, if available")
    picture: str = Field(
        default="", description="User's profile picture URL, if available"
    )


class UserResponse(BaseModel):
    """Response model for user data."""

    firebase_uid: str = Field(..., description="Firebase unique identifier")
    email: str = Field(..., description="User email")
    name: Optional[str] = Field(..., description="User display name")
    profile_picture: Optional[str] = Field(None, description="User profile picture URL")
    coins: int = Field(default=0, description="User coins balance")
    is_admin: bool = Field(default=False, description="Account status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    coin_updated_at: datetime = Field(..., description="Coin updation timestamp")
    last_login: datetime = Field(..., description="Last login timestamp")


class InitUserResponse(BaseModel):
    """Response model for user initialization endpoint."""

    success: bool = Field(..., description="Whether initialization was successful")
    user: UserResponse = Field(..., description="User data")
    message: str = Field(
        default="User initialized successfully", description="Status message"
    )


class ErrorResponse(BaseModel):
    """Response model for error responses."""

    success: bool = Field(default=False, description="Whether request was successful")
    message: str = Field(..., description="Error message")
    error_code: str = Field(..., description="Error code for debugging")
