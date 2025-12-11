import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { AuthTokens } from '~/types/auth'

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

export function createApiClient() {
  const config = useRuntimeConfig()
  const { $tokenManager } = useNuxtApp()

  const apiBaseUrl = config.public.apiBaseUrl
  const apiTimeout = config.public.apiTimeout

  const client = axios.create({
    baseURL: apiBaseUrl,
    timeout: apiTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = $tokenManager.getAccessToken()

      if (token && !config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`
      }

      return config
    },
    (error) => {
      return Promise.reject(error)
    },
  )

  client.interceptors.response.use(
    (response) => {
      return response
    },
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

      if (!originalRequest) {
        return Promise.reject(error)
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve) => {
            subscribeTokenRefresh((token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`
              resolve(client(originalRequest))
            })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshToken = $tokenManager.getRefreshToken()

          if (!refreshToken) {
            $tokenManager.clearTokens()

            if (import.meta.client) {
              window.location.href = '/auth/signin'
            }

            return Promise.reject(error)
          }

          const response = await axios.post<{ tokens: AuthTokens }>(`${apiBaseUrl}/auth/refresh`, {
            refreshToken,
          })

          const { tokens } = response.data

          $tokenManager.setTokens(tokens)
          onTokenRefreshed(tokens.accessToken)

          originalRequest.headers.Authorization = `Bearer ${tokens.accessToken}`

          return client(originalRequest)
        }
        catch (refreshError) {
          $tokenManager.clearTokens()

          if (import.meta.client) {
            window.location.href = '/auth/signin'
          }

          return Promise.reject(refreshError)
        }
        finally {
          isRefreshing = false
        }
      }

      if (error.response?.status === 403) {
        if (import.meta.client) {
          console.error('Access forbidden: insufficient permissions')
        }
      }

      if (error.response?.status === 500) {
        if (import.meta.client) {
          console.error('Server error occurred')
        }
      }

      return Promise.reject(error)
    },
  )

  return client
}
