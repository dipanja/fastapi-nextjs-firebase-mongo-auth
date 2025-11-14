# utils/middleware/auth_middleware.py
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from utils.firebase.firebase_manager import firebase_manager
from utils.logger import get_logger

logger = get_logger(__name__)

# Define routes that don't require authentication
PUBLIC_PATHS = {
    "/",  # health check
    "/api/auth/users/init",
    "/api/auth/logout",
    # "/api/auth/who-am-i",  # optional: keep public for testing
}


class AuthMiddleware(BaseHTTPMiddleware):
    """Middleware to verify Firebase session cookie for protected routes."""

    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip authentication for public routes
        if (
            path in PUBLIC_PATHS
            or path.startswith("/docs")
            or path.startswith("/openapi")
        ):
            return await call_next(request)

        # Extract session cookie
        session_cookie = request.cookies.get("session")
        if not session_cookie:
            logger.debug(f"No session cookie on path: {path}")
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Missing session cookie"},
            )

        try:
            # Verify session cookie using Firebase
            user_info = await firebase_manager.verify_firebase_session_cookie(
                session_cookie
            )
            request.state.user = user_info  # store verified user info

            logger.debug(f"Authenticated user {user_info.get('email')} for {path}")
            response = await call_next(request)
            return response

        except Exception as e:
            logger.warning(f"Invalid or expired session cookie: {e}")
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Invalid or expired session"},
            )
