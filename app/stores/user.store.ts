import { defineStore } from 'pinia'
import type {
  AuthError,
  AuthStatus,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
  VerifyEmailRequest,
} from '~/types/auth'
import { UserModel } from '~/models/user.model'

type AuthErrorCode = 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'EMAIL_ALREADY_EXISTS' | 'UNKNOWN_ERROR'

export const useUserStore = defineStore('user', () => {
  const { $authService, $tokenManager } = useNuxtApp()

  const user = ref<UserModel | null>(null)
  const status = ref<AuthStatus>('idle')
  const error = ref<AuthError | null>(null)

  const isAuthenticated = computed(() => status.value === 'authenticated' && !!user.value)
  const isLoading = computed(() => status.value === 'loading')
  const currentUser = computed(() => user.value)

  function setUser(userData: object | null) {
    user.value = userData ? UserModel.toModel(userData) : null
    status.value = userData ? 'authenticated' : 'unauthenticated'
    error.value = null
  }

  function createAuthError(code: AuthErrorCode, fallbackMessage: string, err: any): AuthError {
    return {
      code,
      message: err.response?.data?.message || fallbackMessage,
      details: err,
    }
  }

  async function withLoading<T>(action: () => Promise<T>) {
    status.value = 'loading'
    error.value = null

    try {
      return await action()
    }
    finally {
      if (status.value === 'loading') {
        status.value = 'idle'
      }
    }
  }

  async function login(credentials: LoginRequest) {
    return withLoading(async () => {
      try {
        const response = await $authService.login(credentials)

        $tokenManager.setTokens({ accessToken: response.accessToken })
        setUser(response.user)

        return response.user
      }
      catch (err: any) {
        const authError = createAuthError('INVALID_CREDENTIALS', 'Login failed', err)

        error.value = authError
        status.value = 'unauthenticated'

        throw authError
      }
    })
  }

  async function register(data: RegisterRequest) {
    return withLoading(async () => {
      try {
        const response = await $authService.register(data)

        $tokenManager.setTokens({ accessToken: response.accessToken })
        setUser(response.user)

        return response.user
      }
      catch (err: any) {
        const errorCode = err.response?.status === 409 ? 'EMAIL_ALREADY_EXISTS' : 'VALIDATION_ERROR'
        const authError = createAuthError(errorCode, 'Registration failed', err)

        error.value = authError
        status.value = 'unauthenticated'

        throw authError
      }
    })
  }

  async function logout() {
    try {
      await $authService.logout()
    }
    catch (err) {
      console.error('Logout failed:', err)
    }
    finally {
      $tokenManager.clearTokens()
      setUser(null)
      error.value = null

      if (import.meta.client) {
        navigateTo('/auth/signin')
      }
    }
  }

  async function logoutAll() {
    try {
      await $authService.logoutAll()
    }
    catch (err) {
      console.error('Logout all failed:', err)
    }
    finally {
      $tokenManager.clearTokens()
      setUser(null)
      error.value = null

      if (import.meta.client) {
        navigateTo('/auth/signin')
      }
    }
  }

  async function fetchCurrentUser() {
    if (!$tokenManager.hasValidTokens) {
      status.value = 'unauthenticated'

      return null
    }

    return withLoading(async () => {
      try {
        const userData = await $authService.getCurrentUser()

        setUser(userData)

        return userData
      }
      catch (err: any) {
        const authError = createAuthError('UNAUTHORIZED', 'Failed to fetch user data', err)

        error.value = authError
        status.value = 'unauthenticated'
        $tokenManager.clearTokens()

        return null
      }
    })
  }

  async function updateProfile(data: Partial<Pick<UserModel, 'firstName' | 'lastName' | 'avatarUrl'>>) {
    if (!user.value) {
      throw new Error('No user logged in')
    }

    const updatedUser = await $authService.updateProfile(data)

    setUser(updatedUser)

    return user.value
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
      setUser(response.user)
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

  function reset() {
    user.value = null
    status.value = 'idle'
    error.value = null
  }

  return {
    user,
    status,
    error,
    isAuthenticated,
    isLoading,
    currentUser,
    login,
    register,
    logout,
    logoutAll,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    initiateGoogleLogin,
    clearError,
    reset,
  }
})
