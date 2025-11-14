from typing import Any, Optional

from pymongo import MongoClient
from pymongo.errors import ConnectionFailure

from settings import settings
from utils.logger import get_logger

logger = get_logger(__name__)


class MongoDB:
    """Mongo DB conection handler."""

    def __init__(self) -> None:
        self.mongo_client: Optional[MongoClient] = None
        self.db = None

    def _get_mongo_client(self) -> MongoClient:
        if self.mongo_client is None:
            self.mongo_client = MongoClient(settings.MONGO_URI.get_secret_value())

        return self.mongo_client

    def get_db(self):
        if self.db is None:
            try:
                client = self._get_mongo_client()
                self.db = client[settings.DB_NAME]

            except ConnectionFailure as e:
                raise e

        return self.db

    def insert_one(
        self,
        data: dict[str, Any],
        collection_name: str,
    ) -> Optional[str]:
        db = self.get_db()
        try:
            collection = db[collection_name]
            result = collection.insert_one(data)
            logger.info(f"one result inserted, id: {result.inserted_id}")
            logger.info("data updation to nongo db successful")
            return result.inserted_id
        except Exception as e:
            print(e)
            return None

    def find_all_results_by_service(
        self,
        user_id: str,
        service: str,
        collection_name: str,
    ) -> Optional[list]:
        """
        Find all documents for a user by service, sorted by newest first.

        Args:
            user_id: User identifier
            service: Service name (e.g., "pinterest")
            collection_name: Name of the collection

        Returns:
            List of documents with user_id, task_id, timestamp, original_query, or None on error
        """
        db = self.get_db()
        try:
            collection = db[collection_name]

            # Find all documents matching user_id and service, sorted by timestamp (newest first)
            results = list(
                collection.find(
                    {"user_id": user_id, "service": service},
                    projection={
                        "user_id": 1,
                        "task_id": 1,
                        "timestamp": 1,
                        "original_query": 1,
                        "service": 1,
                    },
                ).sort("timestamp", -1)
            )

            logger.info(
                f"Found {len(results)} documents for user {user_id} and service {service}"
            )
            return results

        except Exception as e:
            logger.error(
                f"Error finding documents for user {user_id} and service {service}: {e}",
                exc_info=True,
            )
            return None

    def find_all_results_by_user(
        self,
        user_id: str,
        collection_name: str,
    ) -> Optional[list]:
        """
        Find all documents for a user by service, sorted by newest first.

        Args:
            user_id: User identifier
            collection_name: Name of the collection

        Returns:
            List of documents with user_id, task_id, timestamp, original_query, or None on error
        """
        db = self.get_db()
        try:
            collection = db[collection_name]

            # Find all documents matching user_id and service, sorted by timestamp (newest first)
            results = list(
                collection.find(
                    {"user_id": user_id},
                    projection={
                        "user_id": 1,
                        "task_id": 1,
                        "timestamp": 1,
                        "original_query": 1,
                        "service": 1,
                    },
                ).sort("timestamp", -1)
            )

            logger.info(f"Found {len(results)} documents for user {user_id}")
            return results

        except Exception as e:
            logger.error(
                f"Error finding documents for user {user_id}: {e}",
                exc_info=True,
            )
            return None

    def find_result_by_task(
        self,
        user_id: str,
        task_id: str,
        collection_name: str,
    ) -> Optional[dict]:
        """
        Find a document by user_id and task_id.

        Args:
            user_id: User identifier
            task_id: Task identifier
            collection_name: Name of the collection

        Returns:
            Document with service, user_id, task_id, timestamp, original_query, external, or None if not found
        """
        db = self.get_db()
        try:
            collection = db[collection_name]

            # Find document matching user_id and task_id
            result = collection.find_one(
                {"user_id": user_id, "task_id": task_id},
                projection={
                    "service": 1,
                    "user_id": 1,
                    "task_id": 1,
                    "timestamp": 1,
                    "original_query": 1,
                    "external": 1,
                },
            )

            if result:
                logger.info(f"Found document for user {user_id} and task {task_id}")
            else:
                logger.info(f"No document found for user {user_id} and task {task_id}")

            return result

        except Exception as e:
            logger.error(
                f"Error finding document for user {user_id} and task {task_id}: {e}",
                exc_info=True,
            )
            return None


db = MongoDB()
logger.info("MongoDB created")
