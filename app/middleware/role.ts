export default defineNuxtRouteMiddleware((to) => {
  const { isAuthenticated, hasAnyRole } = useAuth()

  if (import.meta.server) {
    return
  }

  const requiredRoles = to.meta.roles as string[] | undefined

  if (!requiredRoles || requiredRoles.length === 0) {
    return
  }

  if (!isAuthenticated.value) {
    return navigateTo({
      path: '/auth/signin',
      query: { redirect: to.fullPath },
    })
  }

  if (!hasAnyRole(requiredRoles)) {
    return navigateTo('/')
  }
})
