from datetime import UTC, datetime

from settings import settings
from utils.firebase.firebase_manager import firebase_manager
from utils.logger import get_logger
from utils.mongo.mongo_manager import db

logger = get_logger(__name__)


class AuthError(Exception):
    """Custom exception for auth service errors."""

    pass


async def create_or_get_user(user_info: dict) -> dict:
    """
    Verify Firebase token and create/get user from MongoDB.

    Flow:
    1. Verify Firebase session cookie and extract user info
    2. Check if user exists in MongoDB
    3. If new user → Create with initial data
    4. If existing user → Update last_login
    5. Return user data

    Args:
        token: Firebase ID token

    Returns:
        User document from MongoDB

    Raises:
        FirebaseTokenError: If token verification fails (let it bubble up)
        AuthError: If MongoDB operations fail
    """

    # Extract data
    firebase_uid = user_info["uid"]
    email = user_info["email"]
    name = user_info.get("name", "")
    picture = user_info.get("picture", "")

    logger.info(f"Token verified for user: {email}")

    try:
        # Step 2 & 3 & 4: Check if user exists and create/update
        db_instance = db.get_db()
        user_collection = db_instance[settings.USER_COLLECTION]

        existing_user = user_collection.find_one({"firebase_uid": firebase_uid})

        if existing_user:
            # User exists - update last_login
            logger.info(f"User exists: {email}. Updating last_login...")
            user_collection.update_one(
                {"firebase_uid": firebase_uid},
                {
                    "$set": {
                        "last_login": datetime.now(UTC),
                    }
                },
            )
            # Fetch updated user
            updated_user = user_collection.find_one({"firebase_uid": firebase_uid})
            logger.info(f"User {email} updated successfully")
            return updated_user

        else:
            # New user - create
            logger.info(f"Creating new user: {email}...")
            new_user = {
                "firebase_uid": firebase_uid,
                "email": email,
                "name": name,
                "profile_picture": picture,
                "coins": settings.INITIAL_COIN,
                "created_at": datetime.now(UTC),
                "coin_updated_at": datetime.now(UTC),
                "last_login": datetime.now(UTC),
            }
            result = user_collection.insert_one(new_user)
            new_user["_id"] = result.inserted_id
            logger.info(
                f"New user created successfully: {email} (ID: {result.inserted_id})"
            )
            return new_user

    except Exception as e:
        # Only catch MongoDB and other unexpected errors here
        logger.error(f"Error in user creation/update: {e}", exc_info=True)
        raise AuthError(f"User creation failed: {str(e)}")


def format_user_response(user_doc: dict) -> dict:
    """
    Format MongoDB user document for API response.

    Converts MongoDB ObjectId to string and removes internal fields.

    Args:
        user_doc: User document from MongoDB

    Returns:
        Formatted user dictionary
    """
    return {
        "firebase_uid": user_doc.get("firebase_uid"),
        "email": user_doc.get("email"),
        "name": user_doc.get("name"),
        "profile_picture": user_doc.get("profile_picture"),
        "coins": user_doc.get("coins", 0),
        "is_admin": user_doc.get("is_admin", False),
        "created_at": user_doc.get("created_at"),
        "coin_updated_at": user_doc.get("coin_updated_at"),
        "last_login": user_doc.get("last_login"),
    }
