import { storeToRefs } from 'pinia'
import { useUserStore } from '~/stores/user.store'
import type {
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
  User,
  VerifyEmailRequest,
} from '~/types/auth'

export function useAuth() {
  const userStore = useUserStore()
  const { user, status, error, isAuthenticated, isLoading } = storeToRefs(userStore)

  async function login(credentials: LoginRequest) {
    return await userStore.login(credentials)
  }

  async function register(data: RegisterRequest) {
    return await userStore.register(data)
  }

  async function logout() {
    return await userStore.logout()
  }

  async function fetchUser() {
    return await userStore.fetchCurrentUser()
  }

  async function updateProfile(data: Partial<User>) {
    return await userStore.updateProfile(data)
  }

  async function changePassword(data: ChangePasswordRequest) {
    return await userStore.changePassword(data)
  }

  async function requestPasswordReset(email: string) {
    return await userStore.requestPasswordReset(email)
  }

  async function resetPassword(data: PasswordResetConfirmRequest) {
    return await userStore.resetPassword(data)
  }

  async function verifyEmail(data: VerifyEmailRequest) {
    return await userStore.verifyEmail(data)
  }

  async function resendVerificationEmail() {
    return await userStore.resendVerificationEmail()
  }

  function clearError() {
    userStore.clearError()
  }

  function hasRole(role: string) {
    return userStore.hasRole(role)
  }

  function hasAnyRole(roles: string[]) {
    return userStore.hasAnyRole(roles)
  }

  return {
    user: readonly(user),
    status: readonly(status),
    error: readonly(error),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    clearError,
    hasRole,
    hasAnyRole,
  }
}
