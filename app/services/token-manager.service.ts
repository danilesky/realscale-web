import type { CookieRef } from 'nuxt/app'
import type { AuthTokens } from '~/types/auth'

const TOKEN_REFRESH_BUFFER_MS = 60 * 1000
const DEFAULT_TOKEN_EXPIRY_MS = 15 * 60 * 1000

export class TokenManagerService {
  private accessToken: CookieRef<string | null>
  private tokenExpiry: CookieRef<string | null>
  private hasSession: CookieRef<string | null>

  constructor(
    accessToken: CookieRef<string | null>,
    tokenExpiry: CookieRef<string | null>,
    hasSession: CookieRef<string | null>,
  ) {
    this.accessToken = accessToken
    this.tokenExpiry = tokenExpiry
    this.hasSession = hasSession
  }

  get hasAccessToken() {
    return !!this.accessToken.value
  }

  get isTokenExpired() {
    if (!this.tokenExpiry.value) return false

    return Date.now() >= Number(this.tokenExpiry.value) - TOKEN_REFRESH_BUFFER_MS
  }

  get hasValidTokens() {
    return this.hasAccessToken && !this.isTokenExpired
  }

  get shouldAttemptRestore() {
    return this.hasSession.value === 'true' || this.hasAccessToken
  }

  get timeUntilExpiry() {
    if (!this.tokenExpiry.value) return DEFAULT_TOKEN_EXPIRY_MS

    return Math.max(0, Number(this.tokenExpiry.value) - Date.now() - TOKEN_REFRESH_BUFFER_MS)
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken.value = tokens.accessToken
    this.hasSession.value = 'true'

    const expiryMs = tokens.expiresIn
      ? tokens.expiresIn * 1000
      : DEFAULT_TOKEN_EXPIRY_MS

    this.tokenExpiry.value = (Date.now() + expiryMs).toString()
  }

  clearTokens() {
    this.accessToken.value = null
    this.tokenExpiry.value = null
    this.hasSession.value = null
  }

  getAccessToken() {
    return this.accessToken.value || null
  }
}

export function createTokenManager() {
  const runtimeConfig = useRuntimeConfig()
  const isProduction = runtimeConfig.public.nodeEnv === 'production'

  const COOKIE_OPTIONS = {
    secure: isProduction,
    sameSite: 'lax' as const,
    path: '/',
  }

  const SESSION_COOKIE_OPTIONS = {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  }

  const accessToken = useCookie<string | null>('auth_access_token', COOKIE_OPTIONS)
  const tokenExpiry = useCookie<string | null>('auth_token_expiry', COOKIE_OPTIONS)
  const hasSession = useCookie<string | null>('auth_has_session', SESSION_COOKIE_OPTIONS)

  return new TokenManagerService(accessToken, tokenExpiry, hasSession)
}
