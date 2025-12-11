import { AuthService } from '~/services/auth.service'
import { createApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const apiClient = createApiClient()
  const authService = new AuthService(apiClient)

  return {
    provide: {
      apiClient,
      authService,
      tokenManager: new TokenManager(),
    },
  }
})
