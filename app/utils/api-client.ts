import type { RefreshResponse } from '~/types/auth'
import type { TokenManagerService } from '~/services/token-manager.service'

export interface RequestConfig {
  headers?: Record<string, string>
  signal?: AbortSignal
  _retry?: boolean
  skipAuth?: boolean
}

export interface ApiClient {
  get<T>(url: string, config?: RequestConfig): Promise<T>
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>
  delete<T>(url: string, config?: RequestConfig): Promise<T>
  onAuthFailure(callback: () => void): () => void
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown,
  ) {
    super(`${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

export function createApiClient(tokenManager: TokenManagerService): ApiClient {
  let isRefreshing = false
  let refreshSubscribers: Array<(token: string) => void> = []
  const authFailureCallbacks: Array<() => void> = []

  function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback)
  }

  function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
  }

  function notifyAuthFailure() {
    authFailureCallbacks.forEach(cb => cb())
  }

  const config = useRuntimeConfig()
  const apiUrl = config.public.apiUrl
  const apiTimeout = config.public.apiTimeout as number

  async function request<T>(
    method: string,
    url: string,
    data?: unknown,
    requestConfig: RequestConfig = {},
  ): Promise<T> {
    const token = tokenManager.getAccessToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...requestConfig.headers,
    }

    if (token && !headers.Authorization && !requestConfig.skipAuth) {
      headers.Authorization = `Bearer ${token}`
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), apiTimeout)

    const fetchOptions: RequestInit = {
      method,
      headers,
      credentials: 'include',
      signal: requestConfig.signal ?? controller.signal,
    }

    if (data && method !== 'GET' && method !== 'HEAD') {
      fetchOptions.body = JSON.stringify(data)
    }

    try {
      const response = await fetch(`${apiUrl}${url}`, fetchOptions)

      clearTimeout(timeoutId)

      if (response.ok) {
        const contentType = response.headers.get('content-type')

        if (contentType?.includes('application/json')) {
          return await response.json()
        }

        return undefined as T
      }

      if (response.status === 401 && !requestConfig._retry) {
        if (isRefreshing) {
          return new Promise<T>((resolve, reject) => {
            subscribeTokenRefresh(async (newToken: string) => {
              try {
                const result = await request<T>(method, url, data, {
                  ...requestConfig,
                  headers: { ...headers, Authorization: `Bearer ${newToken}` },
                  _retry: true,
                })

                resolve(result)
              }
              catch (error) {
                reject(error)
              }
            })
          })
        }

        isRefreshing = true

        try {
          const refreshResponse = await fetch(`${apiUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })

          if (!refreshResponse.ok) {
            throw new ApiError(refreshResponse.status, refreshResponse.statusText)
          }

          const { accessToken, expiresIn } = await refreshResponse.json() as RefreshResponse

          tokenManager.setTokens({ accessToken, expiresIn })
          onTokenRefreshed(accessToken)

          return await request<T>(method, url, data, {
            ...requestConfig,
            headers: { ...headers, Authorization: `Bearer ${accessToken}` },
            _retry: true,
          })
        }
        catch {
          tokenManager.clearTokens()
          notifyAuthFailure()

          throw new ApiError(401, 'Unauthorized')
        }
        finally {
          isRefreshing = false
        }
      }

      if (response.status === 403) {
        console.error('Access forbidden: insufficient permissions')
      }

      if (response.status === 500) {
        console.error('Server error occurred')
      }

      let errorData: unknown

      try {
        errorData = await response.json()
      }
      catch {
        errorData = undefined
      }

      throw new ApiError(response.status, response.statusText, errorData)
    }
    catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof ApiError) {
        throw error
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new ApiError(0, 'Request timeout')
      }

      throw error
    }
  }

  return {
    get: <T>(url: string, config?: RequestConfig) => request<T>('GET', url, undefined, config),
    post: <T>(url: string, data?: unknown, config?: RequestConfig) => request<T>('POST', url, data, config),
    put: <T>(url: string, data?: unknown, config?: RequestConfig) => request<T>('PUT', url, data, config),
    patch: <T>(url: string, data?: unknown, config?: RequestConfig) => request<T>('PATCH', url, data, config),
    delete: <T>(url: string, config?: RequestConfig) => request<T>('DELETE', url, undefined, config),
    onAuthFailure(callback: () => void) {
      authFailureCallbacks.push(callback)

      return () => {
        const index = authFailureCallbacks.indexOf(callback)

        if (index > -1) {
          authFailureCallbacks.splice(index, 1)
        }
      }
    },
  }
}
