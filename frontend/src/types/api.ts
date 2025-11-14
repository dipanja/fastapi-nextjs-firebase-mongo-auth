// API request/response types for future backend integration
export interface AuthRequest {
  email: string;
  password: string;
}

export interface SignupRequest extends AuthRequest {
  confirmPassword: string;
  acceptTerms: boolean;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}
