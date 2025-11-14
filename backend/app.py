"""
Main FastAPI application.

Organizes all routes by functionality:
- auth: User authentication and initialization
- analysis: Task creation and progress tracking (WebSocket)
- results: Retrieve task results
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.auth.route import auth_router
from settings import settings
from utils.logger import get_logger
from utils.middleware.auth_middleware import AuthMiddleware

logger = get_logger(__name__)


def create_app() -> FastAPI:
    """
    Create and configure FastAPI application.

    Returns:
        FastAPI: Configured FastAPI application
    """
    app = FastAPI(
        title="Analysis API",
        description="FastAPI backend for analysis tasks",
        version="1.0.0",
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.add_middleware(AuthMiddleware)

    # Register routers
    app.include_router(auth_router)

    # Health check endpoint
    @app.get("/")
    def health_check():
        """Health check endpoint."""
        return {"status": "All is well"}

    logger.info("Application initialized successfully")
    return app


# Create app instance
app = create_app()


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        ws_ping_timeout=60,
        ws_ping_interval=20,
        timeout_keep_alive=75,
    )
