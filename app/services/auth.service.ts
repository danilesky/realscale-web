import type { ApiClient } from '~/utils/api-client'
import type {
  ChangePasswordRequest,
  ChangePasswordResponse,
  LoginRequest,
  LoginResponse,
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
  constructor(private apiClient: ApiClient) {}

  async login(credentials: LoginRequest) {
    return this.apiClient.post<LoginResponse>('/auth/login', credentials)
  }

  async register(data: RegisterRequest) {
    return this.apiClient.post<LoginResponse>('/auth/register', data)
  }

  async logout() {
    await this.apiClient.post('/auth/logout')
  }

  async logoutAll() {
    await this.apiClient.post('/auth/logout-all')
  }

  async getCurrentUser() {
    return this.apiClient.get<User>('/auth/me')
  }

  async updateProfile(data: Partial<User>) {
    return this.apiClient.patch<User>('/auth/profile', data)
  }

  async changePassword(data: ChangePasswordRequest) {
    return this.apiClient.post<ChangePasswordResponse>('/auth/change-password', data)
  }

  async requestPasswordReset(email: string) {
    return this.apiClient.post<PasswordResetRequestResponse>('/auth/password-reset/request', { email })
  }

  async resetPassword(data: PasswordResetConfirmRequest) {
    return this.apiClient.post<PasswordResetConfirmResponse>('/auth/password-reset/confirm', data)
  }

  async verifyEmail(data: VerifyEmailRequest) {
    return this.apiClient.post<VerifyEmailResponse>('/auth/verify-email', data)
  }

  async resendVerificationEmail() {
    return this.apiClient.post<ResendVerificationResponse>('/auth/verify-email/resend')
  }
}
