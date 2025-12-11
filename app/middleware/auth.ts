export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated, fetchUser } = useAuth()

  if (!isAuthenticated.value) {
    // await fetchUser()
  }

  if (to.meta.auth === 'guest' && isAuthenticated.value) {
    return navigateTo('/app')
  }

  if (to.meta.auth === 'required' && !isAuthenticated.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { from: to.path },
    })
  }
})
