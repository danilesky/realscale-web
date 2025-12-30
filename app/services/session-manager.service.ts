import type { Ref } from 'vue'
import type { SessionStatus, RefreshResponse, User } from '~/types/auth'
import type { TokenManagerService } from './token-manager.service'
import type { AuthService } from './auth.service'

export class SessionManagerService {
  private tokenManager: TokenManagerService
  private authService: AuthService
  private apiUrl: string
  private refreshTimer: ReturnType<typeof setTimeout> | null = null
  private isRefreshing = false

  readonly status: Ref<SessionStatus>
  readonly user: Ref<User | null>

  private onSessionInvalidCallbacks: Array<() => void> = []

  constructor(
    tokenManager: TokenManagerService,
    authService: AuthService,
    apiUrl: string,
    status: Ref<SessionStatus>,
    user: Ref<User | null>,
  ) {
    this.tokenManager = tokenManager
    this.authService = authService
    this.apiUrl = apiUrl
    this.status = status
    this.user = user
  }

  get isAuthenticated() {
    return this.status.value === 'authenticated' && !!this.user.value
  }

  get isInitializing() {
    return this.status.value === 'initializing' || this.status.value === 'restoring'
  }

  onSessionInvalid(callback: () => void) {
    this.onSessionInvalidCallbacks.push(callback)

    return () => {
      const index = this.onSessionInvalidCallbacks.indexOf(callback)

      if (index > -1) {
        this.onSessionInvalidCallbacks.splice(index, 1)
      }
    }
  }

  async initialize() {
    if (!this.tokenManager.shouldAttemptRestore) {
      this.status.value = 'unauthenticated'

      return
    }

    this.status.value = 'restoring'

    const restored = await this.restoreSession()

    if (!restored) {
      this.status.value = 'unauthenticated'
    }
  }

  private async restoreSession() {
    if (this.tokenManager.hasAccessToken) {
      const fetched = await this.fetchUser()

      if (fetched) return true
    }

    const refreshed = await this.refreshTokens()

    if (!refreshed) {
      this.tokenManager.clearTokens()

      return false
    }

    return await this.fetchUser()
  }

  private async fetchUser() {
    try {
      const userData = await this.authService.getCurrentUser()

      this.setAuthenticated(userData)

      return true
    }
    catch {
      return false
    }
  }

  async refreshTokens() {
    if (this.isRefreshing) {
      return this.waitForRefresh()
    }

    this.isRefreshing = true

    try {
      const response = await fetch(`${this.apiUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (!response.ok) {
        return false
      }

      const data = await response.json() as RefreshResponse

      this.tokenManager.setTokens({
        accessToken: data.accessToken,
        expiresIn: data.expiresIn,
      })

      this.scheduleProactiveRefresh()

      return true
    }
    catch {
      return false
    }
    finally {
      this.isRefreshing = false
    }
  }

  private waitForRefresh() {
    return new Promise<boolean>((resolve) => {
      const checkInterval = setInterval(() => {
        if (!this.isRefreshing) {
          clearInterval(checkInterval)
          resolve(this.tokenManager.hasValidTokens)
        }
      }, 50)
    })
  }

  private scheduleProactiveRefresh() {
    this.clearRefreshTimer()

    const timeUntilExpiry = this.tokenManager.timeUntilExpiry

    if (timeUntilExpiry <= 0) return

    this.refreshTimer = setTimeout(async () => {
      if (this.status.value === 'authenticated') {
        const success = await this.refreshTokens()

        if (!success) {
          this.handleSessionInvalid()
        }
      }
    }, timeUntilExpiry)
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer)
      this.refreshTimer = null
    }
  }

  setAuthenticated(userData: User) {
    this.user.value = userData
    this.status.value = 'authenticated'
    this.scheduleProactiveRefresh()
  }

  handleSessionInvalid() {
    this.clearRefreshTimer()
    this.tokenManager.clearTokens()
    this.user.value = null
    this.status.value = 'unauthenticated'
    this.onSessionInvalidCallbacks.forEach(cb => cb())
  }

  async logout() {
    this.clearRefreshTimer()

    try {
      await this.authService.logout()
    }
    catch (err) {
      console.error('Logout API call failed:', err)
    }

    this.tokenManager.clearTokens()
    this.user.value = null
    this.status.value = 'unauthenticated'
  }

  async logoutAll() {
    this.clearRefreshTimer()

    try {
      await this.authService.logoutAll()
    }
    catch (err) {
      console.error('Logout all API call failed:', err)
    }

    this.tokenManager.clearTokens()
    this.user.value = null
    this.status.value = 'unauthenticated'
  }

  destroy() {
    this.clearRefreshTimer()
    this.onSessionInvalidCallbacks = []
  }
}
