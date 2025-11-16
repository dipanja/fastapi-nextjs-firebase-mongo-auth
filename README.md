# Next.js 15 + FastAPI Authentication Template

A production-ready, reusable authentication template featuring Next.js 15, FastAPI, Firebase Authentication, and secure session-based cookie management.

---

## 🎯 What This Template Provides

This is a **complete, working authentication system** that you can clone and customize for your next project. It implements:

- ✅ **Firebase Authentication** (Email/Password + Google OAuth)
- ✅ **Session-based authentication** with HttpOnly cookies (14-day expiration)
- ✅ **Secure cookie forwarding** between Next.js and FastAPI
- ✅ **MongoDB integration** for user data storage
- ✅ **Protected routes** with middleware on both frontend and backend
- ✅ **Environment-aware configuration** (local/cloud deployment ready)
- ✅ **TypeScript** throughout the frontend
- ✅ **Clean separation** of concerns with proper project structure

---

## 🏗️ Architecture Overview

### Core Principle: Browser Never Talks to FastAPI Directly

```
┌─────────┐         ┌──────────────┐         ┌─────────────┐
│ Browser │ ←────→  │ Next.js API  │ ←────→  │   FastAPI   │
│         │         │   Routes     │         │   Backend   │
└─────────┘         └──────────────┘         └─────────────┘
     ↓                      ↓                        ↓
  Cookies              Forwards                  Verifies
  Stored               Cookies                   Session
```

**Why this architecture?**

- **Security**: HttpOnly cookies can't be accessed by JavaScript
- **Flexibility**: Easy to switch backends or add rate limiting
- **Simplicity**: Centralized cookie handling in one place
- **CORS Safety**: No complex cross-origin cookie issues

### Authentication Flow

#### 1. Login Flow

```
1. User enters credentials → Firebase Auth validates
2. Frontend gets Firebase ID token
3. Frontend calls /api/auth/set-cookie (Next.js)
4. Next.js forwards token to FastAPI /api/auth/users/init
5. FastAPI creates session cookie + stores user in MongoDB
6. Next.js forwards Set-Cookie header to browser
7. Browser stores session cookie (HttpOnly, 14 days)
```

#### 2. Session Verification

```
1. Frontend needs user info → Calls /api/auth/whoami (Next.js)
2. Next.js forwards session cookie to FastAPI /api/auth/who-am-i
3. FastAPI verifies cookie with Firebase Admin SDK
4. Returns user data to Next.js
5. Next.js returns data to frontend
```

#### 3. Logout Flow

```
1. User clicks logout → Calls /api/auth/logout (Next.js)
2. Next.js forwards to FastAPI /api/auth/logout
3. FastAPI deletes cookie (sets expiration to past)
4. Next.js forwards cookie deletion to browser
5. Firebase client signs out
```

---

## 📁 Project Structure

```
.
├── backend/
│   ├── api/
│   │   └── auth/
│   │       ├── route.py          # Auth endpoints (init, whoami, logout)
│   │       ├── schema.py         # Pydantic models
│   │       └── service.py        # Business logic (create/get user)
│   ├── utils/
│   │   ├── firebase/
│   │   │   └── firebase_manager.py    # Firebase Admin SDK wrapper
│   │   ├── middleware/
│   │   │   └── auth_middleware.py     # Session verification middleware
│   │   ├── mongo/
│   │   │   └── mongo_manager.py       # MongoDB connection manager
│   │   └── logger.py                  # Logging configuration
│   ├── app.py                    # FastAPI app initialization
│   ├── settings.py               # Environment-aware settings
│   ├── pyproject.toml            # Python dependencies (UV)
│   └── .env                      # Backend environment variables
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── api/auth/         # Next.js API routes (cookie forwarding)
    │   │   │   ├── set-cookie/route.ts    # Login handler
    │   │   │   ├── whoami/route.ts        # Session check
    │   │   │   └── logout/route.ts        # Logout handler
    │   │   ├── login/page.tsx    # Login page
    │   │   ├── signup/page.tsx   # Signup page
    │   │   └── dashboard/        # Protected pages
    │   ├── components/           # UI components
    │   ├── lib/
    │   │   ├── apiClient.ts      # ⭐ Cookie forwarding logic
    │   │   ├── authService.ts    # Firebase client auth
    │   │   ├── config.ts         # Environment configuration
    │   │   └── firebase.ts       # Firebase initialization
    │   ├── context/
    │   │   └── AuthContext.tsx   # Auth state management
    │   └── middleware.ts         # Route protection
    ├── package.json              # Node dependencies
    ├── next.config.ts            # Next.js configuration
    └── .env.local                # Frontend environment variables
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.11+
- **UV** (Python package manager)
- **MongoDB** (local or cloud)
- **Firebase Project** with Auth enabled

### 1. Clone the Template

```bash
# Copy this template to your new project
cp -r auth-template my-new-project
cd my-new-project
```

### 2. Setup Backend

```bash
cd backend

# Install UV if not already installed
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install dependencies
uv sync

# Copy environment template
cp .env.example .env
```

**Edit `backend/.env`** (see [BACKEND_SETUP.md](./BACKEND_SETUP.md) for details):

```bash
# Backend/Frontend configuration
BACKEND_RUNNING_ON=local           # local or cloud
FRONTEND_RUNNING_ON=local          # local or cloud

# Frontend URLs
FRONTEND_URL_LOCAL=http://localhost:3000
FRONTEND_URL_CLOUD=https://your-frontend.com

# Firebase (paste entire service account JSON)
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'

# MongoDB
MONGO_URI=mongodb://localhost:27017
DB_NAME=my_project_db

# Collections
USER_COLLECTION=users
RESULT_COLLECTION=results


# User settings
INITIAL_COIN=0
```

**Start backend:**

```bash
uv run uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### 3. Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
```

**Edit `frontend/.env.local`** (see [FRONTEND_SETUP.md](./FRONTEND_SETUP.md) for details):

```bash
# Backend configuration
NEXT_PUBLIC_BACKEND_RUNNING_ON=local    # local or cloud
NEXT_PUBLIC_FRONTEND_RUNNING_ON=local   # local or cloud

# Backend URLs
NEXT_PUBLIC_BACKEND_URL_LOCAL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL_CLOUD=https://your-backend.com

# Firebase config (get from Firebase Console → Project Settings)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123:web:abc
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Start frontend:**

```bash
npm run dev
```

Visit: **http://localhost:3000**

---

## 🔧 Customizing for Your Project

### Step 1: Rename Project

**Backend:**

- `backend/pyproject.toml`: Change `name = "backend"` to your project name
- `backend/app.py`: Update `title`, `description`, `version`

**Frontend:**

- `frontend/package.json`: Change `name` and `description`
- `frontend/src/app/layout.tsx`: Update title and metadata

### Step 2: Configure Firebase

1. Create new Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable Authentication methods:
   - Email/Password
   - Google
3. Get service account JSON:
   - Project Settings → Service Accounts
   - Generate new private key
   - Copy entire JSON content to `FIREBASE_SERVICE_ACCOUNT_JSON`
4. Get web app config:
   - Project Settings → General → Your apps
   - Copy config values to frontend `.env.local`

### Step 3: Setup MongoDB

**Option A: Local MongoDB (Docker)**

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

**Option B: MongoDB Atlas (Cloud)**

1. Create cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string
3. Update `MONGO_URI` in backend `.env`

### Step 4: Customize User Model

Edit `backend/api/auth/service.py` - modify `create_or_get_user()`:

```python
new_user = {
    "firebase_uid": firebase_uid,
    "email": email,
    "name": name,
    "profile_picture": picture,
    "coins": settings.INITIAL_COIN,
    # Add your custom fields here:
    "subscription_tier": "free",
    "preferences": {},
    "metadata": {},
    "created_at": datetime.now(UTC),
    "last_login": datetime.now(UTC),
}
```

Update `backend/api/auth/schema.py` - modify `UserResponse`:

```python
class UserResponse(BaseModel):
    firebase_uid: str
    email: str
    name: Optional[str]
    # Add your custom fields:
    subscription_tier: str = "free"
    preferences: dict = {}
```

---

## 🔐 Key Components Explained

### 1. Cookie Forwarding (⭐ Most Important)

**File: `frontend/src/lib/apiClient.ts`**

This is the **heart of the template**. It handles automatic cookie forwarding:

```typescript
export async function serverApiClient(
  request: Request,
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const backendBase = getBackendBaseUrl();
  const url = `${backendBase}${path}`;

  // Extract cookies from incoming browser request
  const cookieHeader = request.headers.get("cookie");

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options?.headers,
      // Forward cookies to FastAPI
      ...(cookieHeader && { cookie: cookieHeader }),
    },
  });

  return response;
}
```

**How to use in new API routes:**

```typescript
// Any new Next.js API route
export async function POST(request: Request) {
  // serverApiClient automatically forwards cookies!
  const response = await serverApiClient(request, "/api/your-new-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return NextResponse.json(await response.json());
}
```

### 2. Environment-Aware Configuration

**Backend: `settings.py`**

Automatically adjusts cookie security based on environment:

```python
@property
def cookie_settings(self) -> dict:
    is_local_backend = self.BACKEND_RUNNING_ON == "local"
    return {
        "httponly": True,
        "secure": not is_local_backend,      # False locally, True in cloud
        "samesite": "lax" if is_local_backend else "none",
        "max_age": 60 * 60 * 24 * 14,        # 14 days
    }
```

**Frontend: `config.ts`**

Dynamically selects backend URL:

```typescript
export const getBackendBaseUrl = (): string => {
  if (BACKEND_RUNNING_ON === "local") {
    return BACKEND_URL_LOCAL;
  }
  return BACKEND_URL_CLOUD;
};
```

### 3. Firebase Manager (Singleton Pattern)

**File: `backend/utils/firebase/firebase_manager.py`**

Handles all Firebase operations:

```python
class FirebaseManager:
    _instance = None

    def __new__(cls):
        # Singleton - only one Firebase instance
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    async def verify_firebase_id_token(self, token: str) -> dict:
        """Verify Firebase ID token from login"""

    async def verify_firebase_session_cookie(self, cookie: str) -> dict:
        """Verify session cookie for authenticated requests"""
```

### 4. Auth Middleware

**Backend: `utils/middleware/auth_middleware.py`**

Automatically protects FastAPI routes:

```python
PUBLIC_PATHS = {
    "/",
    "/api/auth/users/init",
    "/api/auth/logout",
}

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip public routes
        if request.url.path in PUBLIC_PATHS:
            return await call_next(request)

        # Verify session cookie
        session_cookie = request.cookies.get("session")
        user_info = await firebase_manager.verify_firebase_session_cookie(
            session_cookie
        )

        # Store user info in request
        request.state.user = user_info
        return await call_next(request)
```

**Frontend: `src/middleware.ts`**

Protects Next.js routes:

```typescript
export async function middleware(request: NextRequest) {
  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/signup"];

  // Check authentication via FastAPI
  const isAuthenticated = await checkAuth(request);

  // Redirect logic
  if (isProtected && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

---

## 📚 Detailed Documentation

For comprehensive setup and customization guides:

- **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** - Backend configuration, deployment, adding endpoints
- **[FRONTEND_SETUP.md](./FRONTEND_SETUP.md)** - Frontend configuration, deployment, adding pages

---

## 🌐 Deployment

### Local Development

```bash
# Backend
cd backend && uv run uvicorn app:app --reload

# Frontend
cd frontend && npm run dev
```

### Production Deployment

**1. Update environment variables:**

Backend `.env`:

```bash
BACKEND_RUNNING_ON=cloud
FRONTEND_RUNNING_ON=cloud
FRONTEND_URL_CLOUD=https://your-frontend.com
```

Frontend `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_RUNNING_ON=cloud
NEXT_PUBLIC_FRONTEND_RUNNING_ON=cloud
NEXT_PUBLIC_BACKEND_URL_CLOUD=https://your-backend.com
```

**2. Deploy:**

- **Backend**: Deploy to Railway, Render, or any platform supporting Python
- **Frontend**: Deploy to Vercel, Netlify, or any platform supporting Next.js

**3. Cookie configuration automatically adjusts to:**

- `secure: true` (HTTPS only)
- `samesite: none` (cross-origin cookies)

---

## 🧪 Testing the Setup

### 1. Test Backend Health

```bash
curl http://localhost:8000/
# Expected: {"status": "All is well"}
```

### 2. Test Authentication Flow

```bash
# Get Firebase ID token from frontend, then:
curl -X POST http://localhost:8000/api/auth/users/init \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Should return user data and Set-Cookie header
```

### 3. Test Session Verification

```bash
curl http://localhost:8000/api/auth/who-am-i \
  -H "Cookie: session=YOUR_SESSION_COOKIE"

# Should return user info
```

---

## 🔍 Troubleshooting

### Issue: Cookies not being set

**Check:**

1. `BACKEND_RUNNING_ON` and `FRONTEND_RUNNING_ON` match your setup
2. CORS origins in backend `settings.py` include your frontend URL
3. Browser console for cookie errors

### Issue: Session expired immediately

**Check:**

1. Firebase service account JSON is valid
2. System time is synchronized (Firebase tokens are time-sensitive)
3. Cookie `max_age` in `settings.py`

### Issue: 401 Unauthorized on protected routes

**Check:**

1. Session cookie exists in browser
2. Cookie is being forwarded in Next.js API routes
3. Firebase Admin SDK initialized correctly
4. MongoDB connection is working

---

## 📖 Next Steps

1. **Customize user model** - Add fields specific to your application
2. **Add protected endpoints** - Follow patterns in existing routes
3. **Implement role-based access** - Extend `auth_middleware.py`
4. **Add email verification** - Use Firebase email verification
5. **Implement password reset** - Use Firebase password reset flow
6. **Add rate limiting** - Protect your API from abuse
7. **Set up monitoring** - Add logging and error tracking

---

## 🤝 Contributing

This is a template project. Feel free to:

- Fork and customize for your needs
- Report issues or improvements
- Share your implementations

---

## 📄 License

This template is provided as-is for educational and commercial use.

---

## 🙏 Acknowledgments

Built with:

- [Next.js 15](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Firebase](https://firebase.google.com/)
- [MongoDB](https://www.mongodb.com/)
- [UV](https://github.com/astral-sh/uv)

---

**Ready to build?** Start with the [BACKEND_SETUP.md](./backend/BACKEND_SETUP.md) or [FRONTEND_SETUP.md](./frontend/FRONTEND_SETUP.md) guide! 🚀
