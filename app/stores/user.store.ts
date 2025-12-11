import { defineStore } from 'pinia'
import type {
  AuthError,
  AuthStatus,
  ChangePasswordRequest,
  LoginRequest,
  PasswordResetConfirmRequest,
  RegisterRequest,
  User,
  VerifyEmailRequest,
} from '~/types/auth'

type AuthErrorCode = 'INVALID_CREDENTIALS' | 'VALIDATION_ERROR' | 'UNAUTHORIZED' | 'UNKNOWN_ERROR'

export const useUserStore = defineStore('user', () => {
  const { $authService, $tokenManager } = useNuxtApp()

  const user = ref<User | null>(null)
  const status = ref<AuthStatus>('idle')
  const error = ref<AuthError | null>(null)

  const isAuthenticated = computed(() => status.value === 'authenticated' && !!user.value)
  const isLoading = computed(() => status.value === 'loading')
  const currentUser = computed(() => user.value)
  const userRole = computed(() => user.value?.role)

  function hasRole(role: string) {
    return user.value?.role === role
  }

  function hasAnyRole(roles: string[]) {
    return !!user.value?.role && roles.includes(user.value.role)
  }

  function setUser(newUser: User | null) {
    user.value = newUser
    status.value = newUser ? 'authenticated' : 'unauthenticated'
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

        $tokenManager.setTokens(response.tokens)
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

        $tokenManager.setTokens(response.tokens)
        setUser(response.user)

        return response.user
      }
      catch (err: any) {
        const authError = createAuthError('VALIDATION_ERROR', 'Registration failed', err)

        error.value = authError
        status.value = 'unauthenticated'

        throw authError
      }
    })
  }

  async function logout() {
    try {
      const response = await $authService.logout()

      return response
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

  async function updateProfile(data: Partial<User>) {
    if (!user.value) {
      throw new Error('No user logged in')
    }

    const updatedUser = await $authService.updateProfile(data)

    setUser(updatedUser)

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
      setUser(response.user)
    }

    return response
  }

  async function resendVerificationEmail() {
    return $authService.resendVerificationEmail()
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
    userRole,
    hasRole,
    hasAnyRole,
    login,
    register,
    logout,
    fetchCurrentUser,
    updateProfile,
    changePassword,
    requestPasswordReset,
    resetPassword,
    verifyEmail,
    resendVerificationEmail,
    clearError,
    reset,
  }
})
