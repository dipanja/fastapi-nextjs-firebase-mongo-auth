# Frontend Setup Guide

Complete guide for setting up, configuring, and customizing the Next.js 15 frontend.

---

## 📋 Table of Contents

1. [Initial Setup](#initial-setup)
2. [Environment Configuration](#environment-configuration)
3. [Project Structure](#project-structure)
4. [Core Components](#core-components)
5. [Adding New Features](#adding-new-features)
6. [Authentication Flow](#authentication-flow)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Initial Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend running (see [BACKEND_SETUP.md](./BACKEND_SETUP.md))
- Firebase project configured

### Installation

```bash
cd frontend

# Install dependencies
npm install

# Or with yarn
yarn install
```

### Dependencies

The `package.json` includes:

```json
{
  "dependencies": {
    "firebase": "^12.5.0", // Firebase client SDK
    "next": "^15.5.6", // Next.js 15
    "react": "^19.0.0", // React 19
    "react-dom": "^19.0.0", // React DOM
    "react-icons": "^5.5.0", // Icon library
    "zod": "^4.1.12" // Schema validation
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4", // Tailwind CSS
    "@types/node": "^20", // TypeScript types
    "@types/react": "^19", // React types
    "@types/react-dom": "^19", // React DOM types
    "eslint": "^9", // Linting
    "eslint-config-next": "15.2.4", // Next.js ESLint config
    "tailwindcss": "^4", // Tailwind CSS
    "typescript": "^5" // TypeScript
  }
}
```

---

## Environment Configuration

### Create `.env.local` File

```bash
cp .env.example .env.local
```

### Required Environment Variables

```bash
# ==========================================
# Backend Configuration
# ==========================================
NEXT_PUBLIC_BACKEND_RUNNING_ON=local      # Options: "local" or "cloud"
NEXT_PUBLIC_FRONTEND_RUNNING_ON=local     # Options: "local" or "cloud"

# Backend URLs
NEXT_PUBLIC_BACKEND_URL_LOCAL=http://localhost:8000
NEXT_PUBLIC_BACKEND_URL_CLOUD=https://your-backend.railway.app

# ==========================================
# Firebase Configuration
# ==========================================
# Get these from Firebase Console → Project Settings → Your apps

NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyC...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abc123def456
NEXT_PUBLIC_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Environment Variable Details

#### `NEXT_PUBLIC_BACKEND_RUNNING_ON` and `NEXT_PUBLIC_FRONTEND_RUNNING_ON`

Controls which backend URL to use:

| Frontend | Backend | Active Backend URL | Use Case                     |
| -------- | ------- | ------------------ | ---------------------------- |
| local    | local   | localhost:8000     | Local development            |
| local    | cloud   | Cloud backend      | Test with production backend |
| cloud    | local   | localhost:8000     | Not recommended              |
| cloud    | cloud   | Cloud backend      | Production                   |

#### Firebase Configuration

**How to get Firebase config:**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Go to: **Project Settings** → **General**
4. Scroll to: **Your apps** → Select web app
5. Copy configuration values to `.env.local`

**Enable Authentication Methods:**

1. In Firebase Console → **Authentication** → **Sign-in method**
2. Enable:
   - **Email/Password**
   - **Google** (configure OAuth consent screen)

---

## Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── auth/
│   │   │       ├── set-cookie/route.ts      # Login endpoint
│   │   │       ├── whoami/route.ts          # Session check
│   │   │       └── logout/route.ts          # Logout endpoint
│   │   ├── dashboard/
│   │   │   ├── layout.tsx                   # Dashboard layout
│   │   │   ├── page.tsx                     # Dashboard home
│   │   │   ├── profile/page.tsx             # Profile page
│   │   │   └── settings/page.tsx            # Settings page
│   │   ├── login/
│   │   │   └── page.tsx                     # Login page
│   │   ├── signup/
│   │   │   └── page.tsx                     # Signup page
│   │   ├── layout.tsx                       # Root layout
│   │   ├── page.tsx                         # Home page (redirects)
│   │   └── globals.css                      # Global styles
│   │
│   ├── components/
│   │   ├── LoginForm.tsx                    # Login form
│   │   ├── SignupForm.tsx                   # Signup form
│   │   ├── Navbar.tsx                       # Navigation bar
│   │   ├── Sidebar.tsx                      # Sidebar
│   │   └── ui/                              # UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── Input.tsx
│   │
│   ├── lib/
│   │   ├── apiClient.ts                     # ⭐ Cookie forwarding logic
│   │   ├── authService.ts                   # Firebase auth methods
│   │   ├── config.ts                        # Environment config
│   │   └── firebase.ts                      # Firebase initialization
│   │
│   ├── context/
│   │   └── AuthContext.tsx                  # Auth state management
│   │
│   ├── middleware.ts                        # Route protection
│   │
│   └── types/                               # TypeScript types
│       ├── api.ts
│       ├── auth.ts
│       ├── forms.ts
│       └── schemas.ts
│
├── public/                                  # Static files
├── package.json                             # Dependencies
├── next.config.ts                           # Next.js config
├── tailwind.config.ts                       # Tailwind config
├── tsconfig.json                            # TypeScript config
└── .env.local                               # Environment variables
```

---

## Core Components

### 1. Configuration (`src/lib/config.ts`)

Dynamically selects backend URL:

```typescript
export type EnvType = "local" | "cloud";

const BACKEND_RUNNING_ON =
  (process.env.NEXT_PUBLIC_BACKEND_RUNNING_ON as EnvType) || "local";

const BACKEND_URL_LOCAL =
  process.env.NEXT_PUBLIC_BACKEND_URL_LOCAL || "http://localhost:8000";
const BACKEND_URL_CLOUD = process.env.NEXT_PUBLIC_BACKEND_URL_CLOUD!;

export const getBackendBaseUrl = (): string => {
  if (BACKEND_RUNNING_ON === "local") {
    return BACKEND_URL_LOCAL;
  }
  return BACKEND_URL_CLOUD;
};
```

**Usage:**

```typescript
import { getBackendBaseUrl } from "@/lib/config";

const backend = getBackendBaseUrl();
// Returns: "http://localhost:8000" or cloud URL
```

### 2. API Client (`src/lib/apiClient.ts`) ⭐

**The most important file** - handles cookie forwarding:

```typescript
/**
 * Server-side API client for Next.js API routes.
 * Automatically forwards cookies from browser to FastAPI.
 */
export async function serverApiClient(
  request: Request,
  path: string,
  options?: RequestInit,
): Promise<Response> {
  const backendBase = getBackendBaseUrl();
  const url = `${backendBase}${path}`;

  // Extract cookies from incoming request
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

**Why this is critical:**

- Browsers send cookies automatically to Next.js
- Next.js needs to forward cookies to FastAPI
- `serverApiClient` does this automatically
- Without it, session cookies won't reach FastAPI

**Usage in API routes:**

```typescript
// src/app/api/your-endpoint/route.ts
import { serverApiClient } from "@/lib/apiClient";

export async function POST(request: Request) {
  // serverApiClient automatically forwards cookies!
  const response = await serverApiClient(request, "/api/backend-endpoint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return NextResponse.json(await response.json());
}
```

### 3. Firebase Client (`src/lib/firebase.ts`)

Initializes Firebase client SDK:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
```

### 4. Auth Service (`src/lib/authService.ts`)

Handles Firebase authentication and cookie exchange:

```typescript
/**
 * Exchange Firebase ID token for FastAPI session cookie.
 */
async function exchangeSessionCookie(idToken: string): Promise<AuthResult> {
  const res = await fetch("/api/auth/set-cookie", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  const data = await res.json();

  if (!res.ok || !data.success) {
    return { success: false, error: data.error || "Login failed" };
  }

  return { success: true, data: data.data };
}

/**
 * Login with email/password.
 */
export async function loginWithEmail(
  email: string,
  password: string,
): Promise<AuthResult> {
  try {
    // Authenticate with Firebase
    const userCred = await signInWithEmailAndPassword(auth, email, password);

    // Get ID token
    const idToken = await userCred.user.getIdToken();

    // Exchange for session cookie
    return await exchangeSessionCookie(idToken);
  } catch (error: any) {
    // Handle Firebase errors
    const errorMessages: Record<string, string> = {
      "auth/invalid-credential": "Invalid email or password",
      "auth/user-not-found": "User not found",
      "auth/wrong-password": "Incorrect password",
      "auth/too-many-requests": "Too many attempts. Try again later",
    };
    return {
      success: false,
      error: errorMessages[error.code] || "Login failed",
    };
  }
}

/**
 * Login with Google OAuth.
 */
export async function loginWithGoogle(): Promise<AuthResult> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const idToken = await result.user.getIdToken();
    return await exchangeSessionCookie(idToken);
  } catch (error: any) {
    return { success: false, error: "Google sign-in failed" };
  }
}

/**
 * Logout user.
 */
export async function logout(): Promise<AuthResult> {
  try {
    // Call backend to delete session cookie
    const res = await fetch("/api/auth/logout", { method: "POST" });
    const data = await res.json();

    if (!res.ok || !data.success) {
      return { success: false, error: "Logout failed" };
    }

    // Sign out from Firebase
    await auth.signOut();
    return { success: true };
  } catch (error: any) {
    return { success: false, error: "Unexpected error during logout" };
  }
}
```

**Usage in components:**

```typescript
import { loginWithEmail, loginWithGoogle, logout } from "@/lib/authService";

// Email login
const result = await loginWithEmail(email, password);
if (result.success) {
  router.push("/dashboard");
} else {
  setError(result.error);
}

// Google login
const result = await loginWithGoogle();

// Logout
await logout();
router.push("/login");
```

### 5. Auth Context (`src/context/AuthContext.tsx`)

Manages authentication state across the app:

```typescript
interface User {
  email: string;
  name?: string;
  picture?: string;
  firebase_uid?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  refreshUser: () => Promise<void>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/whoami", { credentials: "include" });
      const data = await res.json();

      if (data.success) {
        setUser(data.data.user || data.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <AuthContextReact.Provider value={{ user, isLoading, refreshUser: fetchUser }}>
      {children}
    </AuthContextReact.Provider>
  );
}

export const useAuth = () => useContext(AuthContextReact);
```

**Usage in components:**

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';

export default function ProfilePage() {
  const { user, isLoading, refreshUser } = useAuth();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Not authenticated</div>;

  return (
    <div>
      <h1>Welcome, {user.name || user.email}!</h1>
      <button onClick={refreshUser}>Refresh User Data</button>
    </div>
  );
}
```

### 6. Middleware (`src/middleware.ts`)

Protects routes and handles redirects:

```typescript
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const backend = getBackendBaseUrl();
  const whoamiUrl = `${backend}/api/auth/who-am-i`;

  const protectedRoutes = ["/dashboard"];
  const authRoutes = ["/login", "/signup"];

  let isAuthenticated = false;

  // Check authentication via FastAPI
  try {
    const res = await fetch(whoamiUrl, {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      credentials: "include",
    });

    if (res.ok) isAuthenticated = true;
  } catch (error) {
    console.error("Auth check failed:", error);
  }

  // Redirect logic
  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(isAuthenticated ? "/dashboard" : "/login", request.url),
    );
  }

  // Protect dashboard routes
  if (protectedRoutes.some((r) => pathname.startsWith(r)) && !isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Redirect authenticated users away from auth pages
  if (authRoutes.includes(pathname) && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
};
```

**Customizing protected routes:**

```typescript
const protectedRoutes = [
  "/dashboard",
  "/profile",
  "/settings",
  "/admin", // Add new protected routes
];

const authRoutes = ["/login", "/signup"];

const publicRoutes = ["/about", "/pricing"]; // Always accessible
```

---

## Authentication Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         LOGIN FLOW                              │
└─────────────────────────────────────────────────────────────────┘

1. User submits credentials
   ↓
2. LoginForm calls authService.loginWithEmail()
   ↓
3. Firebase client authenticates user
   ↓
4. Get Firebase ID token
   ↓
5. authService calls /api/auth/set-cookie (Next.js API route)
   ↓
6. Next.js API route calls serverApiClient()
   ↓
7. serverApiClient forwards to FastAPI /api/auth/users/init
   ↓
8. FastAPI verifies token, creates session cookie, saves user to MongoDB
   ↓
9. FastAPI returns Set-Cookie header
   ↓
10. Next.js forwards Set-Cookie to browser
    ↓
11. Browser stores session cookie (HttpOnly)
    ↓
12. Redirect to /dashboard
```

### API Routes

#### `/api/auth/set-cookie` - Login

```typescript
// src/app/api/auth/set-cookie/route.ts
export async function POST(request: Request) {
  const { idToken } = await request.json();

  if (!idToken) {
    return NextResponse.json(
      { success: false, error: "Missing ID token" },
      { status: 400 },
    );
  }

  // Forward to FastAPI with Authorization header
  const res = await serverApiClient(request, "/api/auth/users/init", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    // Extract and forward Set-Cookie header
    const setCookieHeader = res.headers.get("set-cookie");
    const response = NextResponse.json({ success: true, data });

    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  }

  return NextResponse.json(
    { success: false, error: "Login failed" },
    { status: res.status },
  );
}
```

#### `/api/auth/whoami` - Session Check

```typescript
// src/app/api/auth/whoami/route.ts
export async function GET(request: Request) {
  // serverApiClient automatically forwards cookies
  const res = await serverApiClient(request, "/api/auth/who-am-i", {
    method: "GET",
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    return NextResponse.json({ success: true, data });
  }

  if (res.status === 401) {
    return NextResponse.json(
      { success: false, error: "Session expired" },
      { status: 401 },
    );
  }

  return NextResponse.json(
    { success: false, error: "Unable to verify session" },
    { status: res.status },
  );
}
```

#### `/api/auth/logout` - Logout

```typescript
// src/app/api/auth/logout/route.ts
export async function POST(request: Request) {
  const res = await serverApiClient(request, "/api/auth/logout", {
    method: "POST",
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    // Forward Set-Cookie header to delete cookie
    const setCookieHeader = res.headers.get("set-cookie");
    const response = NextResponse.json({ success: true, data });

    if (setCookieHeader) {
      response.headers.set("set-cookie", setCookieHeader);
    }

    return response;
  }

  return NextResponse.json(
    { success: false, error: "Logout failed" },
    { status: res.status },
  );
}
```

---

## Adding New Features

### Adding a New Page

**1. Create page file:** `src/app/your-page/page.tsx`

```typescript
'use client';

import { useAuth } from '@/context/AuthContext';

export default function YourPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Your New Page</h1>
      <p>Welcome, {user?.name}!</p>
    </div>
  );
}
```

**2. Protect the route (if needed):**

Add to `src/middleware.ts`:

```typescript
const protectedRoutes = [
  "/dashboard",
  "/your-page", // Add here
];
```

**3. Add navigation link:**

```typescript
// In Navbar or Sidebar
<Link href="/your-page">Your Page</Link>
```

### Adding a New API Route

**1. Create route file:** `src/app/api/your-endpoint/route.ts`

```typescript
import { NextResponse } from "next/server";
import { serverApiClient } from "@/lib/apiClient";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Forward to FastAPI with automatic cookie forwarding
    const response = await serverApiClient(
      request,
      "/api/your-fastapi-endpoint",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      },
    );

    const data = await response.json();

    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}
```

**2. Call from frontend:**

```typescript
const response = await fetch("/api/your-endpoint", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ data: "your data" }),
  credentials: "include", // Important: includes cookies
});

const result = await response.json();
```

### Adding Client-Side Data Fetching

Create a custom hook:

```typescript
// src/lib/hooks/useYourData.ts
import { useState, useEffect } from "react";

export function useYourData() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/your-endpoint", {
          credentials: "include",
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const result = await res.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  return { data, isLoading, error };
}
```

**Usage:**

```typescript
function YourComponent() {
  const { data, isLoading, error } = useYourData();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{JSON.stringify(data)}</div>;
}
```

---

## Deployment

### Environment Setup

**For production deployment**, update `.env.local`:

```bash
NEXT_PUBLIC_BACKEND_RUNNING_ON=cloud
NEXT_PUBLIC_FRONTEND_RUNNING_ON=cloud
NEXT_PUBLIC_BACKEND_URL_CLOUD=https://your-backend.railway.app

# Keep Firebase config the same
NEXT_PUBLIC_FIREBASE_API_KEY=...
# ... rest of Firebase config
```

### Vercel Deployment

**1. Connect GitHub repository to Vercel**

**2. Add environment variables in Vercel dashboard:**

- Go to: Project Settings → Environment Variables
- Add all variables from `.env.local`

**3. Deploy:**

```bash
# Vercel CLI
vercel

# Or push to main branch (auto-deploy)
git push origin main
```

**4. Verify deployment:**

- Check cookies are being set
- Test authentication flow
- Check middleware redirects

### Netlify Deployment

**1. Create `netlify.toml`:**

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

**2. Connect repository to Netlify**

**3. Add environment variables in Netlify dashboard**

**4. Deploy**

### Custom Server Deployment

**1. Build production bundle:**

```bash
npm run build
```

**2. Start production server:**

```bash
npm start
```

**3. Use PM2 for process management:**

```bash
npm install -g pm2
pm2 start npm --name "frontend" -- start
pm2 save
pm2 startup
```

---

## Troubleshooting

### Issue: Cookies Not Being Set

**Symptoms:**

- User logs in but gets logged out immediately
- Session cookie not visible in browser DevTools

**Solutions:**

1. **Check environment variables:**

   ```bash
   NEXT_PUBLIC_BACKEND_RUNNING_ON=cloud  # Must match deployment
   NEXT_PUBLIC_FRONTEND_RUNNING_ON=cloud
   ```

2. **Verify backend cookie settings:**
   - For cloud: `secure: true`, `samesite: none`
   - Backend must be on HTTPS

3. **Check browser console:**
   - Look for cookie-related errors
   - Check if `Set-Cookie` header is present in network tab

4. **Verify CORS:**
   - Backend `allowed_origins` must include frontend URL
   - Must be exact match (no trailing slashes)

### Issue: Authentication Redirects Not Working

**Symptoms:**

- Middleware doesn't redirect correctly
- Can access protected routes when logged out

**Solutions:**

1. **Check middleware matcher:**

   ```typescript
   export const config = {
     matcher: ["/", "/dashboard/:path*", "/login", "/signup"],
   };
   ```

2. **Verify backend is reachable:**

   ```typescript
   // In middleware.ts
   console.log("Checking auth at:", whoamiUrl);
   ```

3. **Check cookie forwarding:**
   ```typescript
   const cookieHeader = request.headers.get("cookie");
   console.log("Forwarding cookies:", cookieHeader);
   ```

### Issue: Firebase Initialization Errors

**Symptoms:**

- "Firebase app already initialized" error
- "Invalid API key" error

**Solutions:**

1. **Check environment variables are prefixed with `NEXT_PUBLIC_`:**

   ```bash
   # Correct
   NEXT_PUBLIC_FIREBASE_API_KEY=...

   # Wrong - won't be available in browser
   FIREBASE_API_KEY=...
   ```

2. **Verify Firebase config in console:**

   ```typescript
   console.log("Firebase config:", {
     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.slice(0, 10) + "...",
     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
   });
   ```

3. **Check Firebase console:**
   - Verify API key is valid
   - Check authentication methods are enabled

### Issue: TypeScript Errors

**Symptoms:**

- Build fails with type errors
- IDE shows type errors

**Solutions:**

1. **Define proper types:**

   ```typescript
   // src/types/auth.ts
   export interface User {
     firebase_uid: string;
     email: string;
     name?: string;
     picture?: string;
   }

   export interface AuthResult {
     success: boolean;
     error?: string;
     data?: any;
   }
   ```

2. **Use types in components:**

   ```typescript
   import type { User } from "@/types/auth";

   const [user, setUser] = useState<User | null>(null);
   ```

3. **Update `tsconfig.json` paths if needed:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./src/*"]
       }
     }
   }
   ```

### Issue: Next.js API Routes Not Found

**Symptoms:**

- 404 errors on `/api/auth/*` routes
- "API route not found" in logs

**Solutions:**

1. **Verify file structure:**

   ```
   src/app/api/auth/
   ├── set-cookie/
   │   └── route.ts       # Must be named 'route.ts'
   ├── whoami/
   │   └── route.ts
   └── logout/
       └── route.ts
   ```

2. **Check export names:**

   ```typescript
   // Must export named functions: GET, POST, etc.
   export async function POST(request: Request) { ... }
   export async function GET(request: Request) { ... }
   ```

3. **Restart dev server:**
   ```bash
   npm run dev
   ```

---

## Best Practices

### 1. Error Handling

```typescript
try {
  const result = await loginWithEmail(email, password);

  if (result.success) {
    router.push("/dashboard");
  } else {
    // Show user-friendly error
    setError(result.error || "Login failed");
  }
} catch (error) {
  // Handle unexpected errors
  setError("An unexpected error occurred");
  console.error("Login error:", error);
}
```

### 2. Loading States

```typescript
const [isLoading, setIsLoading] = useState(false);

async function handleLogin() {
  setIsLoading(true);
  setError(null);

  try {
    const result = await loginWithEmail(email, password);
    // Handle result
  } finally {
    setIsLoading(false);
  }
}

return (
  <button disabled={isLoading}>
    {isLoading ? 'Logging in...' : 'Login'}
  </button>
);
```

### 3. Type Safety

```typescript
// Define response types
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Use in API calls
const response = await fetch("/api/endpoint");
const result: ApiResponse<User> = await response.json();

if (result.success && result.data) {
  setUser(result.data); // TypeScript knows this is User type
}
```

### 4. Security

```typescript
// Always include credentials for authenticated requests
fetch("/api/endpoint", {
  credentials: "include", // Important!
});

// Validate user input
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  setError("Invalid email format");
  return;
}

// Don't store sensitive data in localStorage
// Use HttpOnly cookies (already implemented)
```

### 5. Performance

```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  // Component logic
});

// Use useCallback for event handlers
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

// Lazy load heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
});
```

---

## Next Steps

1. ✅ Set up frontend with `.env.local` configuration
2. ✅ Test authentication flow locally
3. ✅ Customize UI components and styling
4. ✅ Add your application-specific pages
5. ✅ Deploy to Vercel/Netlify

For backend setup, see [BACKEND_SETUP.md](./BACKEND_SETUP.md)

---

**Questions?** Check the main [PROJECT_TEMPLATE_README.md](./PROJECT_TEMPLATE_README.md) or review the inline code comments!
