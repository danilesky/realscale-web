export default defineNuxtRouteMiddleware(() => {
  const { isAuthenticated } = useAuth()

  if (import.meta.server) {
    return
  }

  if (isAuthenticated.value) {
    return navigateTo('/app')
  }
})
