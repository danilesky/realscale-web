import type { AxiosInstance } from 'axios'
import type {
  AuthTokens,
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
  LogoutResponse,
  PasswordResetConfirmRequest,
  PasswordResetConfirmResponse,
  PasswordResetRequestResponse,
  RegisterRequest,
  ResendVerificationResponse,
  User,
  VerifyEmailRequest,
  VerifyEmailResponse,
} from '~/types/auth'

export class AuthService {
  constructor(private apiClient: AxiosInstance) {}

  async login(credentials: LoginRequest) {
    const response = await this.apiClient.post<LoginResponse>('/auth/login', credentials)

    return response.data
  }

  async register(data: RegisterRequest) {
    const response = await this.apiClient.post<LoginResponse>('/auth/register', data)

    return response.data
  }

  async logout() {
    const response = await this.apiClient.post<LogoutResponse>('/auth/logout')

    return response.data
  }

  async refreshToken(refreshToken: string) {
    const response = await this.apiClient.post<{ tokens: AuthTokens }>('/auth/refresh', {
      refreshToken,
    })

    return response.data.tokens
  }

  async getCurrentUser() {
    const response = await this.apiClient.get<User>('/auth/me')

    return response.data
  }

  async updateProfile(data: Partial<User>) {
    const response = await this.apiClient.patch<User>('/auth/profile', data)

    return response.data
  }

  async changePassword(data: ChangePasswordRequest) {
    const response = await this.apiClient.post<ChangePasswordResponse>('/auth/change-password', data)

    return response.data
  }

  async requestPasswordReset(email: string) {
    const response = await this.apiClient.post<PasswordResetRequestResponse>('/auth/password-reset/request', { email })

    return response.data
  }

  async resetPassword(data: PasswordResetConfirmRequest) {
    const response = await this.apiClient.post<PasswordResetConfirmResponse>('/auth/password-reset/confirm', data)

    return response.data
  }

  async verifyEmail(data: VerifyEmailRequest) {
    const response = await this.apiClient.post<VerifyEmailResponse>('/auth/verify-email', data)

    return response.data
  }

  async resendVerificationEmail() {
    const response = await this.apiClient.post<ResendVerificationResponse>('/auth/verify-email/resend')

    return response.data
  }
}
