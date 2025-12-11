export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  if (import.meta.server) {
    return
  }

  if (!isAuthenticated.value) {
    await fetchUser()
  }

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath },
    })
  }
})
