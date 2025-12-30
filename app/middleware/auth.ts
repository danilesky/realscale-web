export default defineNuxtRouteMiddleware((to) => {
  const { status } = useAuth()

  if (import.meta.server) {
    if (status.value === 'restoring') {
      return
    }

    if (to.meta.auth === 'required' && status.value === 'unauthenticated') {
      return navigateTo({
        path: '/auth/signin',
        query: { from: to.path },
      })
    }

    if (to.meta.auth === 'guest' && status.value === 'authenticated') {
      return navigateTo('/app')
    }
  }
})
