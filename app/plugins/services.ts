import { AuthService } from '~/services/auth.service'
import { createTokenManager } from '~/services/token-manager.service'
import { createApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const tokenManager = createTokenManager()
  const apiClient = createApiClient(tokenManager)
  const authService = new AuthService(apiClient)

  return {
    provide: {
      apiClient,
      authService,
      tokenManager,
    },
  }
})
