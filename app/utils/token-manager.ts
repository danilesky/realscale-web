import type { AuthTokens } from '~/types/auth'

const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const TOKEN_EXPIRY_KEY = 'auth_token_expiry'

const COOKIE_OPTIONS = {
  secure: true,
  sameSite: 'strict' as const,
  path: '/',
}

export class TokenManager {
  getAccessToken() {
    const cookie = useCookie(ACCESS_TOKEN_KEY)

    return cookie.value || null
  }

  getRefreshToken() {
    const cookie = useCookie(REFRESH_TOKEN_KEY, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
    })

    return cookie.value || null
  }

  getTokenExpiry() {
    const cookie = useCookie(TOKEN_EXPIRY_KEY)

    return cookie.value ? Number.parseInt(cookie.value, 10) : null
  }

  setTokens(tokens: AuthTokens) {
    const expiryTime = tokens.expiresIn ? Date.now() + tokens.expiresIn * 1000 : undefined
    const maxAge = tokens.expiresIn || 60 * 60 * 24 * 7

    const accessTokenCookie = useCookie(ACCESS_TOKEN_KEY, {
      ...COOKIE_OPTIONS,
      maxAge,
    })
    accessTokenCookie.value = tokens.accessToken

    const refreshTokenCookie = useCookie(REFRESH_TOKEN_KEY, {
      ...COOKIE_OPTIONS,
      httpOnly: false,
      maxAge: 60 * 60 * 24 * 30,
    })
    refreshTokenCookie.value = tokens.refreshToken

    if (expiryTime) {
      const expiryCookie = useCookie(TOKEN_EXPIRY_KEY, {
        ...COOKIE_OPTIONS,
        maxAge,
      })
      expiryCookie.value = expiryTime.toString()
    }
  }

  clearTokens() {
    const accessTokenCookie = useCookie(ACCESS_TOKEN_KEY)
    const refreshTokenCookie = useCookie(REFRESH_TOKEN_KEY)
    const expiryCookie = useCookie(TOKEN_EXPIRY_KEY)

    accessTokenCookie.value = null
    refreshTokenCookie.value = null
    expiryCookie.value = null
  }

  isTokenExpired() {
    const expiry = this.getTokenExpiry()

    if (!expiry) return true

    const bufferTime = 60 * 1000

    return Date.now() >= expiry - bufferTime
  }

  hasValidTokens() {
    return !!this.getAccessToken() && !!this.getRefreshToken() && !this.isTokenExpired()
  }
}
