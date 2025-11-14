# api/auth/routes.py
from datetime import timedelta
from typing import Optional

from fastapi import APIRouter, Header, HTTPException, Request, Response, status
from firebase_admin import auth

from api.auth.schema import (
    ErrorResponse,
    InitUserResponse,
    UserResponse,
    WhoAmIResponse,
)
from api.auth.service import AuthError, create_or_get_user, format_user_response
from settings import settings
from utils.firebase.firebase_manager import FirebaseTokenError, firebase_manager
from utils.logger import get_logger

logger = get_logger(__name__)


logger.info(
    f"Backend running on: {settings.BACKEND_RUNNING_ON}"
    f"Frontend running on: {settings.FRONTEND_RUNNING_ON}"
)
logger.info(f"Allowed origins: {settings.allowed_origins}")
logger.info(f"Cookie config: {settings.cookie_settings}")

auth_router = APIRouter(prefix="/api/auth", tags=["auth"])


@auth_router.post(
    "/users/init",
    response_model=InitUserResponse,
    responses={
        401: {"model": ErrorResponse, "description": "Missing or invalid credentials"},
        500: {"model": ErrorResponse, "description": "Internal server error"},
    },
)
async def init_user(
    response: Response,
    authorization: str = Header(None),
) -> InitUserResponse:
    """
    Initialize or get user after Firebase authentication.

    Accepts:
    - Authorization Bearer token (from Firebase client SDK)

    Actions:
    1. Verifies Firebase ID token.
    2. Creates Firebase session cookie.
    3. Creates or updates user in MongoDB.
    4. Returns success and sets cookie.
    """
    try:
        logger.info("Init user endpoint called")

        if not authorization or not authorization.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing Bearer token",
            )

        id_token = authorization.split("Bearer ")[1]
        logger.info("Verifying Firebase ID token")
        user_info = await firebase_manager.verify_firebase_id_token(id_token)

        # Create Firebase session cookie (14 days)
        expires_in = timedelta(days=14)
        session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)
        logger.info("Firebase session cookie created")

        # Create or update user in DB
        user_doc = await create_or_get_user(user_info)
        formatted_user = format_user_response(user_doc)

        cookie_cfg = settings.cookie_settings
        # Set secure cookie
        response.set_cookie(
            key="session",
            value=session_cookie,
            **cookie_cfg,
        )

        logger.info(f"User initialized successfully: {formatted_user['email']}")

        return InitUserResponse(
            success=True,
            user=UserResponse(**formatted_user),
            message="User initialized successfully",
        )

    except FirebaseTokenError as e:
        logger.error(f"Firebase verification error: {e}")
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except AuthError as e:
        logger.error(f"Auth service error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )
    except Exception as e:
        logger.error(f"Unexpected error in init_user: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@auth_router.get(
    "/who-am-i",
    response_model=WhoAmIResponse,
    responses={401: {"model": ErrorResponse, "description": "Unauthorized"}},
)
async def who_am_i(request: Request) -> WhoAmIResponse:
    """
    Identify the currently authenticated user via session cookie.
    """
    try:
        session_cookie = request.cookies.get("session")
        if not session_cookie:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="No session cookie"
            )

        user_info = await firebase_manager.verify_firebase_session_cookie(
            session_cookie
        )
        firebase_uid = user_info["uid"]
        email = user_info["email"]
        name = user_info.get("name", "")
        picture = user_info.get("picture", "")

        return WhoAmIResponse(
            success=True,
            firebase_uid=firebase_uid,
            email=email,
            name=name,
            picture=picture,
        )

    except FirebaseTokenError as e:
        logger.warning(f"Invalid session cookie: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired session",
        )
    except Exception as e:
        logger.error(f"Error in who_am_i: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error",
        )


@auth_router.post(
    "/logout",
    responses={200: {"description": "Logout successful"}},
)
async def logout_user(response: Response) -> dict:
    """
    Logs out the user by deleting the session cookie from the browser.
    Stateless logout – the session cookie is simply removed.
    """

    # take a copy of the cookie
    cookie_cfg = settings.cookie_settings.copy()
    # remove the max_age property
    cookie_cfg.pop("max_age", None)
    # now delete the cookie
    response.delete_cookie(key="session", **cookie_cfg)

    logger.info("User logged out successfully")
    return {"success": True, "message": "Logged out successfully"}
