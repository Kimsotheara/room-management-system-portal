export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // Initialize from storage on client side
  if (import.meta.client && !authStore.isAuthenticated) {
    authStore.initFromStorage()
  }

  const isAuthPage = to.path === '/login'

  if (!authStore.isAuthenticated && !isAuthPage) {
    return navigateTo('/login')
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (authStore.isAuthenticated && isAuthPage) {
    return navigateTo('/dashboard')
  }

  // If authenticated but no user data yet, fetch it
  if (authStore.isAuthenticated && !authStore.user && !isAuthPage) {
    await authStore.fetchCurrentUser()

    // If fetch failed, redirect to login
    if (!authStore.user) {
      return navigateTo('/login')
    }
  }

  // Route-level permission gate (admins bypass). Pages declare the required
  // code via definePageMeta({ permission: 'X_READ' }).
  const required = to.meta.permission as string | undefined
  if (required && authStore.user && !authStore.isAdmin && !authStore.hasPermission(required)) {
    return navigateTo('/dashboard')
  }
})
