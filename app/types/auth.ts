export const AUTH_PROVIDERS = ['local', 'google'] as const
export type AuthProvider = typeof AUTH_PROVIDERS[number]

export interface User {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string | null
  provider: AuthProvider
  googleId: string | null
  createdAt: string
  updatedAt: string
}

export interface AuthTokens {
  accessToken: string
  expiresIn?: number
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface RefreshResponse {
  accessToken: string
  expiresIn?: number
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  message: string
  success: boolean
}

export interface PasswordResetRequestResponse {
  message: string
  success: boolean
}

export interface PasswordResetConfirmRequest {
  token: string
  newPassword: string
}

export interface PasswordResetConfirmResponse {
  message: string
  success: boolean
}

export interface VerifyEmailRequest {
  token: string
}

export interface VerifyEmailResponse {
  message: string
  success: boolean
  user?: User
}

export interface ResendVerificationResponse {
  message: string
  success: boolean
}

export interface LogoutResponse {
  message: string
  success: boolean
}

export const AUTH_STATUS = ['idle', 'loading', 'authenticated', 'unauthenticated'] as const
export type AuthStatus = typeof AUTH_STATUS[number]

export const AUTH_ERROR_CODES = [
  'INVALID_CREDENTIALS',
  'TOKEN_EXPIRED',
  'REFRESH_TOKEN_EXPIRED',
  'UNAUTHORIZED',
  'NETWORK_ERROR',
  'VALIDATION_ERROR',
  'EMAIL_ALREADY_EXISTS',
  'UNKNOWN_ERROR',
] as const

export type AuthErrorCode = typeof AUTH_ERROR_CODES[number]

export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: unknown
}
