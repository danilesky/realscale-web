export interface User {
  id: string
  email: string
  name: string
  role: string
  avatar?: string | null
  emailVerified?: boolean
  createdAt?: string
  updatedAt?: string
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
  user: User
  tokens: AuthTokens
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
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
  'UNKNOWN_ERROR',
] as const

export type AuthErrorCode = typeof AUTH_ERROR_CODES[number]

export interface AuthError {
  code: AuthErrorCode
  message: string
  details?: unknown
}
