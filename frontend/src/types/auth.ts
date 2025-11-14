// User-related types
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Session types (for NextAuth.js)
export interface SessionUser {
  id?: string;
  email?: string;
  name?: string;
  image?: string;
}

// Server Action response types
export interface AuthResponse {
  success: boolean;
  error?: string;
  message?: string;
}

export interface AuthResponseWithUser extends AuthResponse {
  user?: SessionUser;
}
