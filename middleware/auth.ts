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
})
