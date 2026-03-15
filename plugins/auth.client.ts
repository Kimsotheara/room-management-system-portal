export default defineNuxtPlugin(async () => {
  const authStore = useAuthStore()
  authStore.initFromStorage()

  // If we have tokens, try to fetch user profile
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.fetchCurrentUser()
  }
})
