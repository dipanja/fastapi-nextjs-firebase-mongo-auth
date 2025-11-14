import firebase_admin
from firebase_admin import auth, credentials, json

from settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


class FirebaseTokenError(Exception):
    """Custom exception for Firebase token errors."""

    pass


class FirebaseManager:
    """Manages Firebase Admin SDK initialization and connection."""

    _instance = None

    def __new__(cls):
        """Singleton pattern - only one Firebase instance."""
        if cls._instance is None:
            cls._instance = super(FirebaseManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        """Initialize Firebase Admin SDK."""
        if self._initialized:
            return

        try:
            cred_dict = json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)

            cred = credentials.Certificate(cred_dict)
            firebase_admin.initialize_app(cred)
            self._initialized = True
            logger.info("Firebase Admin SDK initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize Firebase Admin SDK: {e}", exc_info=True)
            raise

    @staticmethod
    async def verify_firebase_id_token(token: str) -> dict:
        """
        Verify Firebase ID token and extract user information.

        Args:
            token: Firebase ID token from frontend

        Returns:
            Dictionary with user info:
            {
                "uid": "user_uid",
                "email": "user@example.com",
                "name": "User Name",
                "picture": "profile_picture_url"
            }

        Raises:
            FirebaseTokenError: If token is invalid or expired
        """
        # Pre-validate token format before calling Firebase
        if not token or not isinstance(token, str):
            logger.error("Token is missing or not a string")
            raise FirebaseTokenError("Token is required and must be a string")

        if token.count(".") != 2:
            logger.error("Token does not have valid JWT format (should have 3 parts)")
            raise FirebaseTokenError("Invalid token format")

        try:
            # Verify token using Firebase Admin SDK
            decoded_token = auth.verify_id_token(token)

            # Extract user information
            user_info = {
                "uid": decoded_token.get("uid"),
                "email": decoded_token.get("email", ""),
                "name": decoded_token.get("name", ""),
                "picture": decoded_token.get("picture", ""),
            }

            logger.info(f"Token verified successfully for user: {user_info['email']}")
            return user_info

        except auth.InvalidIdTokenError as e:
            # Token signature is invalid or token is expired
            logger.error(f"Invalid Firebase token: {e}")
            raise FirebaseTokenError(f"Invalid or expired token: {str(e)}")

        except ValueError as e:
            logger.error(f"Invalid Firebase token: {e}")
            raise FirebaseTokenError(f"Invalid Firebase token: {str(e)}")

        except Exception as e:
            logger.error(f"Error verifying Firebase token: {e}", exc_info=True)
            raise FirebaseTokenError(f"Token verification failed: {str(e)}")

    async def verify_firebase_session_cookie(self, cookie: str) -> dict:
        """
        Verify Firebase session cookie and extract user information.

        Args:
            cookie: Firebase session cookie

        Returns:
            Dictionary with user info (same format as verify_firebase_id_token):
            {
                "uid": "user_uid",
                "email": "user@example.com",
                "name": "User Name",
                "picture": "profile_picture_url"
            }

        Raises:
            FirebaseTokenError: If cookie is invalid or expired
        """
        try:
            decoded_claims = auth.verify_session_cookie(cookie, check_revoked=True)

            # Format to match verify_firebase_id_token output
            user_info = {
                "uid": decoded_claims.get("uid"),
                "email": decoded_claims.get("email", ""),
                "name": decoded_claims.get("name", ""),
                "picture": decoded_claims.get("picture", ""),
            }

            logger.info(
                f"Session cookie verified successfully for user: {user_info['email']}"
            )
            return user_info

        except Exception as e:
            logger.error(f"Session cookie verification failed: {e}")
            raise FirebaseTokenError(f"Invalid or expired session cookie: {str(e)}")


# Singleton instance
firebase_manager = FirebaseManager()
