import { defineStore } from 'pinia'
import type {
  AuthError,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from '~/types/auth'
import { UserModel } from '~/models/user.model'

type AuthErrorCode = 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'EMAIL_ALREADY_EXISTS' | 'UNKNOWN_ERROR'

export const useUserStore = defineStore('user', () => {
  const { $authService, $tokenManager, $sessionManager, $sessionStatus, $sessionUser } = useNuxtApp()

  const isLoading = ref(false)
  const error = ref<AuthError | null>(null)

  const user = computed(() => $sessionUser.value ? UserModel.toModel($sessionUser.value) : null)
  const status = computed(() => $sessionStatus.value)
  const isAuthenticated = computed(() => $sessionStatus.value === 'authenticated' && !!$sessionUser.value)
  const isInitializing = computed(() => $sessionStatus.value === 'initializing' || $sessionStatus.value === 'restoring')

  function createAuthError(code: AuthErrorCode, fallbackMessage: string, err: any): AuthError {
    return {
      code,
      message: err.response?.data?.message || err.message || fallbackMessage,
      details: err.response?.data,
    }
  }

  async function withLoading<T>(action: () => Promise<T>) {
    isLoading.value = true
    error.value = null

    try {
      return await action()
    }
    finally {
      isLoading.value = false
    }
  }

  async function login(credentials: LoginRequest) {
    return withLoading(async () => {
      try {
        const response = await $authService.login(credentials)

        $tokenManager.setTokens({ accessToken: response.accessToken })
        $sessionManager.setAuthenticated(response.user)

        return response.user
      }
      catch (err: any) {
        const authError = createAuthError('INVALID_CREDENTIALS', 'Login failed', err)

        error.value = authError

        throw authError
      }
    })
  }

  async function register(data: RegisterRequest) {
    return withLoading(async () => {
      try {
        const response = await $authService.register(data)

        $tokenManager.setTokens({ accessToken: response.accessToken })
        $sessionManager.setAuthenticated(response.user)

        return response.user
      }
      catch (err: any) {
        const errorCode = err.status === 409 ? 'EMAIL_ALREADY_EXISTS' : 'VALIDATION_ERROR'
        const authError = createAuthError(errorCode, 'Registration failed', err)

        error.value = authError

        throw authError
      }
    })
  }

  async function logout() {
    await $sessionManager.logout()

    if (import.meta.client) {
      navigateTo('/auth/signin')
    }
  }

  async function logoutAll() {
    await $sessionManager.logoutAll()

    if (import.meta.client) {
      navigateTo('/auth/signin')
    }
  }

  async function updateProfile(data: Partial<Pick<UserModel, 'firstName' | 'lastName' | 'avatarUrl'>>) {
    if (!$sessionUser.value) {
      throw new Error('No user logged in')
    }

    const updatedUser = await $authService.updateProfile(data)

    $sessionManager.setAuthenticated(updatedUser)

    return updatedUser
  }

  async function changePassword(data: ChangePasswordRequest) {
    return $authService.changePassword(data)
  }

  async function requestPasswordReset(email: string) {
    return $authService.requestPasswordReset(email)
  }

  async function resetPassword(data: PasswordResetConfirmRequest) {
    return $authService.resetPassword(data)
  }

  async function verifyEmail(data: VerifyEmailRequest) {
    const response = await $authService.verifyEmail(data)

    if (response.user) {
      $sessionManager.setAuthenticated(response.user)
    }

    return response
  }

  async function resendVerificationEmail() {
    return $authService.resendVerificationEmail()
  }

  function initiateGoogleLogin() {
    const config = useRuntimeConfig()

    window.location.href = `${config.public.apiUrl}/auth/google`
  }

  function clearError() {
    error.value = null
  }

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading,
    isInitializing,
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
})
