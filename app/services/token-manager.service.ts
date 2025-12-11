import type { CookieRef } from 'nuxt/app'
import type { AuthTokens } from '~/types/auth'

export class TokenManagerService {
  private accessToken: CookieRef<string | null>
  private refreshToken: CookieRef<string | null>
  private tokenExpiry: CookieRef<string | null>

  constructor(
    accessToken: CookieRef<string | null>,
    refreshToken: CookieRef<string | null>,
    tokenExpiry: CookieRef<string | null>,
  ) {
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.tokenExpiry = tokenExpiry
  }

  get isTokenExpired() {
    if (!this.tokenExpiry.value) return true

    const bufferTime = 60 * 1000

    return Date.now() >= Number(this.tokenExpiry.value) - bufferTime
  }

  get hasValidTokens() {
    return !!this.accessToken.value && !!this.refreshToken.value && !this.isTokenExpired
  }

  setTokens(tokens: AuthTokens) {
    this.accessToken.value = tokens.accessToken
    this.refreshToken.value = tokens.refreshToken

    if (tokens.expiresIn) {
      this.tokenExpiry.value = (Date.now() + tokens.expiresIn * 1000).toString()
    }
  }

  clearTokens() {
    this.accessToken.value = null
    this.refreshToken.value = null
    this.tokenExpiry.value = null
  }

  getAccessToken() {
    return this.accessToken.value || null
  }

  getRefreshToken() {
    return this.refreshToken.value || null
  }
}

export function createTokenManager() {
  const COOKIE_OPTIONS = {
    secure: true,
    sameSite: 'strict' as const,
    path: '/',
  }

  const accessToken = useCookie<string | null>('auth_access_token', COOKIE_OPTIONS)

  const refreshToken = useCookie<string | null>('auth_refresh_token', {
    ...COOKIE_OPTIONS,
    maxAge: 60 * 60 * 24 * 30,
  })

  const tokenExpiry = useCookie<string | null>('auth_token_expiry', COOKIE_OPTIONS)

  return new TokenManagerService(accessToken, refreshToken, tokenExpiry)
}
