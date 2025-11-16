# Backend Setup Guide

Complete guide for setting up, configuring, and customizing the FastAPI backend.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Adding New Features](#adding-new-features)
6. [Database Operations](#database-operations)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

- Python 3.11+
- UV (Python package manager)
- MongoDB (local or cloud)
- Firebase Project with service account

### Installation

```bash
cd backend

# Install UV if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Verify installation
uv run python --version
```

### Dependencies

The `pyproject.toml` includes:

```toml
[project]
name = "backend"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
    "email-validator>=2.3.0",      # Email validation
    "fastapi>=0.116.1",            # Web framework
    "firebase-admin>=7.1.0",       # Firebase Admin SDK
    "pydantic-settings>=2.11.0",   # Settings management
    "pymongo>=4.14.1",             # MongoDB driver
    "python-dotenv>=1.1.1",        # Environment variables
    "requests>=2.32.5",            # HTTP client
    "uvicorn>=0.35.0",             # ASGI server
    "watchfiles>=1.1.0",           # File watching for reload
    "websockets>=15.0.1",          # WebSocket support
]
```

**Note:** Some dependencies (anthropic, tavily, redis) are optional. Remove them from `pyproject.toml` if not needed.

---

## Environment Configuration

### Create `.env` File

```bash
cp .env.example .env
```

### Required Environment Variables

```bash
# ==========================================
# Backend/Frontend Environment
# ==========================================
BACKEND_RUNNING_ON=local           # Options: "local" or "cloud"
FRONTEND_RUNNING_ON=local          # Options: "local" or "cloud"

# Frontend URLs (for CORS configuration)
FRONTEND_URL_LOCAL=http://localhost:3000
FRONTEND_URL_CLOUD=https://your-frontend.vercel.app

# ==========================================
# Firebase Configuration
# ==========================================
# Paste the ENTIRE service account JSON here (single line, escaped quotes)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n","client_email":"firebase-adminsdk@your-project.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"..."}'

# ==========================================
# MongoDB Configuration
# ==========================================
MONGO_URI=mongodb://localhost:27017        # Local MongoDB
# MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net  # Atlas

DB_NAME=my_project_db                      # Database name

# Collection names
USER_COLLECTION=users                      # User collection
RESULT_COLLECTION=results                  # Results collection (customize)

# ==========================================
# Application Settings
# ==========================================
INITIAL_COIN=0                             # Initial coins for new users
```

### Environment Variable Details

#### `BACKEND_RUNNING_ON` and `FRONTEND_RUNNING_ON`

These control cookie security settings:

| Backend | Frontend | Cookie Secure | Cookie SameSite | Use Case                    |
| ------- | -------- | ------------- | --------------- | --------------------------- |
| local   | local    | False         | lax             | Local development           |
| local   | cloud    | False         | lax             | Testing with cloud frontend |
| cloud   | local    | True          | none            | Testing with cloud backend  |
| cloud   | cloud    | True          | none            | Production                  |

#### `FIREBASE_SERVICE_ACCOUNT_JSON`

**How to get this:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to: **Project Settings** → **Service Accounts**
4. Click: **Generate new private key**
5. Download JSON file
6. **Format for `.env`:**

```bash
# Convert JSON to single line and escape quotes
cat service-account.json | jq -c | sed 's/"/\\"/g'

# Then wrap in single quotes
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account",...}'
```

**Alternative: Use file path** (not recommended for production):

```bash
FIREBASE_SERVICE_ACCOUNT_JSON=/path/to/service-account.json
```

Then modify `firebase_manager.py`:

```python
# Instead of json.loads(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
cred = credentials.Certificate(settings.FIREBASE_SERVICE_ACCOUNT_JSON)
```

---

## Project Structure

```
backend/
├── api/
│   ├── auth/
│   │   ├── __init__.py
│   │   ├── route.py          # Auth endpoints
│   │   ├── schema.py         # Pydantic models
│   │   └── service.py        # Business logic
│   └── __init__.py
│
├── utils/
│   ├── firebase/
│   │   ├── __init__.py
│   │   └── firebase_manager.py    # Firebase Admin SDK
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── auth_middleware.py     # Session verification
│   ├── mongo/
│   │   ├── __init__.py
│   │   └── mongo_manager.py       # MongoDB connection
│   ├── __init__.py
│   └── logger.py                  # Logging configuration
│
├── app.py                     # FastAPI app initialization
├── settings.py                # Environment-aware settings
├── pyproject.toml             # Dependencies
├── uv.lock                    # Dependency lock file
├── .env                       # Environment variables
└── README.md                  # This file
```

---

## Core Components

### 1. Settings (`settings.py`)

Manages all configuration using Pydantic:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Explicit environment declarations
    BACKEND_RUNNING_ON: Literal["local", "cloud"] = "local"
    FRONTEND_RUNNING_ON: Literal["local", "cloud"] = "local"

    # Derived properties
    @property
    def allowed_origins(self) -> list[str]:
        """CORS origins based on frontend location"""
        if self.FRONTEND_RUNNING_ON == "local":
            return [self.FRONTEND_URL_LOCAL, ...]
        return [self.FRONTEND_URL_CLOUD]

    @property
    def cookie_settings(self) -> dict:
        """Cookie security based on backend location"""
        is_local = self.BACKEND_RUNNING_ON == "local"
        return {
            "httponly": True,
            "secure": not is_local,
            "samesite": "lax" if is_local else "none",
            "max_age": 60 * 60 * 24 * 14,  # 14 days
        }
```

**Adding new settings:**

```python
# In Settings class
NEW_FEATURE_ENABLED: bool = Field(default=False)
MAX_FILE_SIZE: int = Field(default=10_000_000)  # 10MB

@property
def feature_config(self) -> dict:
    return {
        "enabled": self.NEW_FEATURE_ENABLED,
        "max_size": self.MAX_FILE_SIZE,
    }
```

### 2. FastAPI App (`app.py`)

Main application setup:

```python
def create_app() -> FastAPI:
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

    # Add auth middleware (verifies session cookies)
    app.add_middleware(AuthMiddleware)

    # Register routers
    app.include_router(auth_router)

    return app
```

**Customizing:**

```python
# Change app metadata
app = FastAPI(
    title="My Project API",
    description="Your custom description",
    version="2.0.0",
    docs_url="/api/docs",           # Custom docs URL
    redoc_url="/api/redoc",         # Custom redoc URL
)

# Add custom middleware
from starlette.middleware.gzip import GZipMiddleware
app.add_middleware(GZipMiddleware, minimum_size=1000)
```

### 3. Firebase Manager (`utils/firebase/firebase_manager.py`)

Singleton pattern for Firebase operations:

```python
class FirebaseManager:
    _instance = None

    def __new__(cls):
        # Only one instance throughout app lifetime
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    async def verify_firebase_id_token(self, token: str) -> dict:
        """
        Verify Firebase ID token from login.
        Returns: {"uid": "...", "email": "...", "name": "...", "picture": "..."}
        """
        decoded_token = auth.verify_id_token(token)
        return {
            "uid": decoded_token.get("uid"),
            "email": decoded_token.get("email", ""),
            "name": decoded_token.get("name", ""),
            "picture": decoded_token.get("picture", ""),
        }

    async def verify_firebase_session_cookie(self, cookie: str) -> dict:
        """
        Verify session cookie for authenticated requests.
        Returns: Same format as verify_firebase_id_token
        """
        decoded_claims = auth.verify_session_cookie(cookie, check_revoked=True)
        return {...}

# Singleton instance
firebase_manager = FirebaseManager()
```

**Usage:**

```python
# In any route or service
from utils.firebase.firebase_manager import firebase_manager

user_info = await firebase_manager.verify_firebase_session_cookie(cookie)
```

### 4. Auth Middleware (`utils/middleware/auth_middleware.py`)

Automatically protects routes:

```python
PUBLIC_PATHS = {
    "/",                        # Health check
    "/api/auth/users/init",     # Login
    "/api/auth/logout",         # Logout
    "/docs",                    # API docs
    "/openapi.json",            # OpenAPI spec
}

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        path = request.url.path

        # Skip public routes
        if path in PUBLIC_PATHS or path.startswith("/docs"):
            return await call_next(request)

        # Extract and verify session cookie
        session_cookie = request.cookies.get("session")
        if not session_cookie:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Missing session cookie"}
            )

        try:
            user_info = await firebase_manager.verify_firebase_session_cookie(
                session_cookie
            )
            # Store user info in request state
            request.state.user = user_info
            return await call_next(request)
        except Exception:
            return JSONResponse(
                status_code=401,
                content={"success": False, "message": "Invalid session"}
            )
```

**Adding public routes:**

```python
PUBLIC_PATHS = {
    "/",
    "/api/auth/users/init",
    "/api/auth/logout",
    "/api/public/stats",        # New public route
    "/api/public/features",     # Another public route
}
```

**Accessing user info in routes:**

```python
@router.get("/api/protected-endpoint")
async def protected_endpoint(request: Request):
    # User info is available in request.state.user
    user = request.state.user
    user_email = user["email"]
    user_uid = user["uid"]

    return {"message": f"Hello {user_email}!"}
```

### 5. MongoDB Manager (`utils/mongo/mongo_manager.py`)

Connection manager with helper methods:

```python
class MongoDB:
    def __init__(self):
        self.mongo_client: Optional[MongoClient] = None
        self.db = None

    def get_db(self):
        """Get database instance (lazy initialization)"""
        if self.db is None:
            client = MongoClient(settings.MONGO_URI.get_secret_value())
            self.db = client[settings.DB_NAME]
        return self.db

    def insert_one(self, data: dict, collection_name: str) -> Optional[str]:
        """Insert single document"""
        db = self.get_db()
        collection = db[collection_name]
        result = collection.insert_one(data)
        return result.inserted_id

# Singleton instance
db = MongoDB()
```

**Usage:**

```python
from utils.mongo.mongo_manager import db

# Get database
database = db.get_db()
collection = database["users"]

# Or use helper methods
user_id = db.insert_one(user_data, "users")
```

### 6. Auth Service (`api/auth/service.py`)

Business logic for user operations:

```python
async def create_or_get_user(user_info: dict) -> dict:
    """
    Create new user or update existing user's last_login.

    Args:
        user_info: Dict with uid, email, name, picture from Firebase

    Returns:
        User document from MongoDB
    """
    firebase_uid = user_info["uid"]
    email = user_info["email"]

    db_instance = db.get_db()
    user_collection = db_instance[settings.USER_COLLECTION]

    existing_user = user_collection.find_one({"firebase_uid": firebase_uid})

    if existing_user:
        # Update last_login
        user_collection.update_one(
            {"firebase_uid": firebase_uid},
            {"$set": {"last_login": datetime.now(UTC)}}
        )
        return user_collection.find_one({"firebase_uid": firebase_uid})
    else:
        # Create new user
        new_user = {
            "firebase_uid": firebase_uid,
            "email": email,
            "name": user_info.get("name", ""),
            "profile_picture": user_info.get("picture", ""),
            "coins": settings.INITIAL_COIN,
            "created_at": datetime.now(UTC),
            "coin_updated_at": datetime.now(UTC),
            "last_login": datetime.now(UTC),
        }
        result = user_collection.insert_one(new_user)
        new_user["_id"] = result.inserted_id
        return new_user
```

**Customizing user model:**

```python
new_user = {
    "firebase_uid": firebase_uid,
    "email": email,
    "name": user_info.get("name", ""),
    "profile_picture": user_info.get("picture", ""),

    # Add your custom fields:
    "subscription_tier": "free",
    "subscription_expires": None,
    "preferences": {
        "theme": "light",
        "notifications": True,
    },
    "metadata": {
        "signup_source": "google_oauth",
        "country": "US",
    },
    "roles": ["user"],  # For RBAC
    "is_active": True,
    "is_verified": False,

    # Timestamps
    "created_at": datetime.now(UTC),
    "last_login": datetime.now(UTC),
    "updated_at": datetime.now(UTC),
}
```

### 7. Auth Routes (`api/auth/route.py`)

Three main endpoints:

#### `/api/auth/users/init` - Initialize User

```python
@auth_router.post("/users/init")
async def init_user(
    response: Response,
    authorization: str = Header(None),
):
    """
    1. Verify Firebase ID token
    2. Create session cookie
    3. Create/update user in MongoDB
    4. Set session cookie in response
    """
    id_token = authorization.split("Bearer ")[1]
    user_info = await firebase_manager.verify_firebase_id_token(id_token)

    # Create session cookie (14 days)
    expires_in = timedelta(days=14)
    session_cookie = auth.create_session_cookie(id_token, expires_in=expires_in)

    # Create/update user
    user_doc = await create_or_get_user(user_info)

    # Set cookie
    response.set_cookie(key="session", value=session_cookie, **settings.cookie_settings)

    return {"success": True, "user": format_user_response(user_doc)}
```

#### `/api/auth/who-am-i` - Get Current User

```python
@auth_router.get("/who-am-i")
async def who_am_i(request: Request):
    """
    Verify session cookie and return user info.
    """
    session_cookie = request.cookies.get("session")
    user_info = await firebase_manager.verify_firebase_session_cookie(session_cookie)

    return {
        "success": True,
        "firebase_uid": user_info["uid"],
        "email": user_info["email"],
        "name": user_info.get("name", ""),
        "picture": user_info.get("picture", ""),
    }
```

#### `/api/auth/logout` - Logout User

```python
@auth_router.post("/logout")
async def logout_user(response: Response):
    """
    Delete session cookie to log out user.
    """
    cookie_cfg = settings.cookie_settings.copy()
    cookie_cfg.pop("max_age", None)  # Remove max_age to delete
    response.delete_cookie(key="session", **cookie_cfg)

    return {"success": True, "message": "Logged out successfully"}
```

---

## Adding New Features

### Adding a New Endpoint

**1. Create route file:** `api/your_feature/route.py`

```python
from fastapi import APIRouter, Request
from api.your_feature.schema import YourFeatureResponse
from api.your_feature.service import process_feature

feature_router = APIRouter(prefix="/api/your-feature", tags=["your-feature"])

@feature_router.post("/process", response_model=YourFeatureResponse)
async def process_feature_endpoint(request: Request, data: dict):
    # User info available from middleware
    user = request.state.user
    user_uid = user["uid"]

    # Process feature
    result = await process_feature(user_uid, data)

    return {"success": True, "result": result}
```

**2. Create schema:** `api/your_feature/schema.py`

```python
from pydantic import BaseModel, Field

class YourFeatureRequest(BaseModel):
    input_data: str = Field(..., description="Input data")
    options: dict = Field(default={}, description="Processing options")

class YourFeatureResponse(BaseModel):
    success: bool
    result: dict
    message: str = "Processing completed"
```

**3. Create service:** `api/your_feature/service.py`

```python
from utils.mongo.mongo_manager import db

async def process_feature(user_uid: str, data: dict) -> dict:
    # Business logic here

    # Save to database
    db_instance = db.get_db()
    collection = db_instance["your_collection"]

    result = {
        "user_uid": user_uid,
        "processed_data": data,
        "timestamp": datetime.now(UTC),
    }

    collection.insert_one(result)

    return result
```

**4. Register router in `app.py`:**

```python
from api.your_feature.route import feature_router

app.include_router(feature_router)
```

### Making an Endpoint Public

Add to `PUBLIC_PATHS` in `auth_middleware.py`:

```python
PUBLIC_PATHS = {
    "/",
    "/api/auth/users/init",
    "/api/auth/logout",
    "/api/your-feature/public-endpoint",  # Add this
}
```

### Implementing Role-Based Access Control (RBAC)

**1. Add roles to user model:**

```python
# In api/auth/service.py - create_or_get_user()
new_user = {
    ...
    "roles": ["user"],  # Default role
    "permissions": [],
}
```

**2. Create role checking dependency:**

```python
# utils/middleware/rbac.py
from fastapi import HTTPException, Request

def require_role(required_role: str):
    async def role_checker(request: Request):
        user = request.state.user

        # Fetch user from database to get roles
        db_instance = db.get_db()
        user_doc = db_instance["users"].find_one({"firebase_uid": user["uid"]})

        if not user_doc or required_role not in user_doc.get("roles", []):
            raise HTTPException(status_code=403, detail="Insufficient permissions")

        return user

    return role_checker
```

**3. Use in routes:**

```python
from fastapi import Depends
from utils.middleware.rbac import require_role

@router.post("/admin-only")
async def admin_endpoint(user=Depends(require_role("admin"))):
    return {"message": "Admin access granted"}
```

---

## Database Operations

### Creating Indexes

```python
# In app.py or a startup script
@app.on_event("startup")
async def create_indexes():
    db_instance = db.get_db()

    # User collection indexes
    users = db_instance["users"]
    users.create_index("firebase_uid", unique=True)
    users.create_index("email", unique=True)
    users.create_index([("created_at", -1)])  # For sorting

    # Results collection indexes
    results = db_instance["results"]
    results.create_index([("user_id", 1), ("task_id", 1)], unique=True)
    results.create_index([("timestamp", -1)])
```

### Advanced Queries

```python
from utils.mongo.mongo_manager import db

db_instance = db.get_db()
collection = db_instance["users"]

# Find with filters
users = collection.find({"roles": "admin"})

# Find with projection
users = collection.find(
    {"is_active": True},
    {"email": 1, "name": 1, "_id": 0}
)

# Aggregation
pipeline = [
    {"$match": {"created_at": {"$gte": datetime(2024, 1, 1)}}},
    {"$group": {"_id": "$subscription_tier", "count": {"$sum": 1}}},
    {"$sort": {"count": -1}}
]
results = list(collection.aggregate(pipeline))
```

---

## Deployment

### Environment Setup

**For cloud deployment**, update `.env`:

```bash
BACKEND_RUNNING_ON=cloud
FRONTEND_RUNNING_ON=cloud
FRONTEND_URL_CLOUD=https://your-frontend.vercel.app

# Use cloud MongoDB
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net

# Update Redis if using
REDIS_URL=redis://your-redis-cloud.com:6379
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install UV
RUN pip install uv

# Copy dependency files
COPY pyproject.toml uv.lock ./

# Install dependencies
RUN uv sync --frozen

# Copy application code
COPY . .

# Expose port
EXPOSE 8000

# Run application
CMD ["uv", "run", "uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

Build and run:

```bash
docker build -t my-backend .
docker run -p 8000:8000 --env-file .env my-backend
```

### Railway/Render Deployment

**1. Add `Procfile`:**

```
web: uv run uvicorn app:app --host 0.0.0.0 --port $PORT
```

**2. Set environment variables in platform dashboard**

**3. Deploy:**

```bash
# Railway
railway up

# Render
# Connect GitHub repo in Render dashboard
```

### Health Checks

Add health check endpoint:

```python
@app.get("/health")
async def health_check():
    # Check database connection
    try:
        db.get_db().command("ping")
        db_status = "ok"
    except:
        db_status = "error"

    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now(UTC).isoformat(),
    }
```

---

## Troubleshooting

### Issue: Firebase Token Verification Fails

**Symptoms:**

- 401 errors on `/api/auth/users/init`
- "Invalid token" errors

**Solutions:**

1. Check Firebase service account JSON is correct
2. Verify system time is synchronized (Firebase tokens are time-sensitive)
3. Ensure token hasn't expired (Firebase ID tokens expire after 1 hour)
4. Check Firebase project ID matches

### Issue: MongoDB Connection Fails

**Symptoms:**

- Connection timeout errors
- "Authentication failed" errors

**Solutions:**

1. Verify MongoDB is running: `mongosh`
2. Check MONGO_URI format:
   - Local: `mongodb://localhost:27017`
   - Atlas: `mongodb+srv://user:password@cluster.mongodb.net`
3. For Atlas: Whitelist your IP address
4. Check username/password are URL-encoded

### Issue: Cookies Not Being Set

**Symptoms:**

- Session cookie not appearing in browser
- User not staying logged in

**Solutions:**

1. Check `BACKEND_RUNNING_ON` and `FRONTEND_RUNNING_ON` settings
2. Verify CORS origins include your frontend URL
3. For cloud deployment:
   - Ensure `secure: True` (HTTPS required)
   - Ensure `samesite: none`
4. Check browser console for cookie errors

### Issue: CORS Errors

**Symptoms:**

- "CORS policy" errors in browser console
- Preflight request failures

**Solutions:**

1. Add frontend URL to `allowed_origins` in `settings.py`
2. Ensure `allow_credentials=True` in CORS middleware
3. For cloud: Use exact domain (no wildcards with credentials)

### Debug Mode

Enable detailed logging:

```python
# utils/logger.py
import logging

logging.basicConfig(
    level=logging.DEBUG,  # Change to DEBUG
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
```

View logs:

```bash
uv run uvicorn app:app --reload --log-level debug
```

---

## Best Practices

1. **Environment Variables:**
   - Never commit `.env` to version control
   - Use `SecretStr` for sensitive data in `settings.py`
   - Validate all required env vars on startup

2. **Error Handling:**
   - Always use try-except in routes
   - Return meaningful error messages
   - Log errors with context

3. **Database:**
   - Create indexes for frequently queried fields
   - Use projections to limit returned data
   - Implement pagination for large datasets

4. **Security:**
   - Keep dependencies updated: `uv sync --upgrade`
   - Use HTTPS in production
   - Implement rate limiting
   - Validate all input data with Pydantic

5. **Testing:**
   - Write tests for business logic
   - Test authentication flows
   - Use pytest with FastAPI TestClient

---

## Next Steps

1. ✅ Set up backend with `.env` configuration
2. ✅ Test authentication endpoints
3. ✅ Create your first custom endpoint
4. ✅ Add database indexes
5. ✅ Deploy to cloud platform

For frontend setup, see [FRONTEND_SETUP](./frontend/FRONTEND_SETUP.md)

---

**Questions?** Check the main [PROJECT_README](./PROJECT_TEMPLATE_README.md) or review the code comments!
