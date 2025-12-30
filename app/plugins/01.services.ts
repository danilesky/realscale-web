import type { SessionStatus, User } from '~/types/auth'
import { AuthService } from '~/services/auth.service'
import { SessionManagerService } from '~/services/session-manager.service'
import { createTokenManager } from '~/services/token-manager.service'
import { createApiClient } from '~/utils/api-client'

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  const sessionStatus = useState<SessionStatus>('session-status', () => 'initializing')
  const sessionUser = useState<User | null>('session-user', () => null)

  const tokenManager = createTokenManager()
  const apiClient = createApiClient(tokenManager)
  const authService = new AuthService(apiClient)

  const sessionManager = new SessionManagerService(
    tokenManager,
    authService,
    config.public.apiUrl as string,
    sessionStatus,
    sessionUser,
  )

  apiClient.onAuthFailure(() => {
    sessionManager.handleSessionInvalid()
  })

  return {
    provide: {
      apiClient,
      authService,
      tokenManager,
      sessionManager,
      sessionStatus,
      sessionUser,
    },
  }
})
