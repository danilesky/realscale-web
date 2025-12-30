import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import type { RefreshResponse } from '~/types/auth'
import type { TokenManagerService } from '~/services/token-manager.service'

export function createApiClient(tokenManager: TokenManagerService) {
  let isRefreshing = false
  let refreshSubscribers: Array<(token: string) => void> = []

  function subscribeTokenRefresh(callback: (token: string) => void) {
    refreshSubscribers.push(callback)
  }

  function onTokenRefreshed(token: string) {
    refreshSubscribers.forEach(callback => callback(token))
    refreshSubscribers = []
  }

  const config = useRuntimeConfig()

  const apiUrl = config.public.apiUrl
  const apiTimeout = config.public.apiTimeout

  const client = axios.create({
    baseURL: apiUrl,
    timeout: apiTimeout,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  client.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = tokenManager.getAccessToken()

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
          const response = await axios.post<RefreshResponse>(
            `${apiUrl}/auth/refresh`,
            {},
            { withCredentials: true },
          )

          const { accessToken, expiresIn } = response.data

          tokenManager.setTokens({ accessToken, expiresIn })
          onTokenRefreshed(accessToken)

          originalRequest.headers.Authorization = `Bearer ${accessToken}`

          return client(originalRequest)
        }
        catch (refreshError) {
          tokenManager.clearTokens()

          if (import.meta.client) {
            navigateTo('/auth/signin')
          }

          return Promise.reject(refreshError)
        }
        finally {
          isRefreshing = false
        }
      }

      if (error.response?.status === 403) {
        console.error('Access forbidden: insufficient permissions')
      }

      if (error.response?.status === 500) {
        console.error('Server error occurred')
      }

      return Promise.reject(error)
    },
  )

  return client
}
