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

  function setError(authError: AuthError) {
    error.value = authError
    status.value = 'unauthenticated'
  }

  function setLoading(loading: boolean) {
    status.value = loading ? 'loading' : 'idle'
  }

  async function login(credentials: LoginRequest) {
    setLoading(true)
    error.value = null

    try {
      const response = await $authService.login(credentials)

      $tokenManager.setTokens(response.tokens)
      setUser(response.user)

      return response.user
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'INVALID_CREDENTIALS',
        message: err.response?.data?.message || 'Login failed',
        details: err,
      }

      setError(authError)

      throw authError
    }
    finally {
      setLoading(false)
    }
  }

  async function register(data: RegisterRequest) {
    setLoading(true)
    error.value = null

    try {
      const response = await $authService.register(data)

      $tokenManager.setTokens(response.tokens)
      setUser(response.user)

      return response.user
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: err.response?.data?.message || 'Registration failed',
        details: err,
      }

      setError(authError)

      throw authError
    }
    finally {
      setLoading(false)
    }
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
    const { $authService } = useNuxtApp()

    if (!$tokenManager.hasValidTokens()) {
      status.value = 'unauthenticated'

      return null
    }

    setLoading(true)

    try {
      const userData = await $authService.getCurrentUser()

      setUser(userData)

      return userData
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'UNAUTHORIZED',
        message: 'Failed to fetch user data',
        details: err,
      }

      setError(authError)
      $tokenManager.clearTokens()

      return null
    }
    finally {
      setLoading(false)
    }
  }

  async function updateProfile(data: Partial<User>) {
    if (!user.value) {
      throw new Error('No user logged in')
    }

    try {
      const updatedUser = await $authService.updateProfile(data)

      setUser(updatedUser)

      return updatedUser
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err.response?.data?.message || 'Failed to update profile',
        details: err,
      }

      throw authError
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    try {
      const response = await $authService.changePassword(data)

      return response
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: err.response?.data?.message || 'Failed to change password',
        details: err,
      }

      throw authError
    }
  }

  async function requestPasswordReset(email: string) {
    try {
      const response = await $authService.requestPasswordReset(email)

      return response
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err.response?.data?.message || 'Failed to request password reset',
        details: err,
      }

      throw authError
    }
  }

  async function resetPassword(data: PasswordResetConfirmRequest) {
    try {
      const response = await $authService.resetPassword(data)

      return response
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: err.response?.data?.message || 'Failed to reset password',
        details: err,
      }

      throw authError
    }
  }

  async function verifyEmail(data: VerifyEmailRequest) {
    try {
      const response = await $authService.verifyEmail(data)

      if (response.user) {
        setUser(response.user)
      }

      return response
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'VALIDATION_ERROR',
        message: err.response?.data?.message || 'Failed to verify email',
        details: err,
      }

      throw authError
    }
  }

  async function resendVerificationEmail() {
    try {
      const response = await $authService.resendVerificationEmail()

      return response
    }
    catch (err: any) {
      const authError: AuthError = {
        code: 'UNKNOWN_ERROR',
        message: err.response?.data?.message || 'Failed to resend verification email',
        details: err,
      }

      throw authError
    }
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
