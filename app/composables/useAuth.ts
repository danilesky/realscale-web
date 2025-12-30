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
  const { user, status, error, isAuthenticated, isLoading, isInitializing } = storeToRefs(userStore)

  async function login(credentials: LoginRequest) {
    return await userStore.login(credentials)
  }

  async function register(data: RegisterRequest) {
    return await userStore.register(data)
  }

  async function logout() {
    return await userStore.logout()
  }

  async function logoutAll() {
    return await userStore.logoutAll()
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

  function initiateGoogleLogin() {
    userStore.initiateGoogleLogin()
  }

  function clearError() {
    userStore.clearError()
  }

  return {
    user: readonly(user),
    status: readonly(status),
    error: readonly(error),
    isAuthenticated: readonly(isAuthenticated),
    isLoading: readonly(isLoading),
    isInitializing: readonly(isInitializing),
    login,
    register,
    logout,
    logoutAll,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    initiateGoogleLogin,
    clearError,
  }
}
