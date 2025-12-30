export default defineNuxtPlugin(() => {
  const { $sessionManager, $tokenManager } = useNuxtApp()

  if (import.meta.server) {
    if ($tokenManager.shouldAttemptRestore) {
      $sessionManager.status.value = 'restoring'
    }
    else {
      $sessionManager.status.value = 'unauthenticated'
    }

    return
  }

  $sessionManager.onSessionInvalid(() => {
    navigateTo('/auth/signin')
  })

  onNuxtReady(async () => {
    await $sessionManager.initialize()

    const route = useRoute()

    if (route.meta.auth === 'required' && !$sessionManager.isAuthenticated) {
      navigateTo({
        path: '/auth/signin',
        query: { from: route.path },
      })
    }

    if (route.meta.auth === 'guest' && $sessionManager.isAuthenticated) {
      navigateTo('/app')
    }
  })
})
