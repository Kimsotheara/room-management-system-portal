export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const apiFetch = async <T>(
    endpoint: string,
    options: RequestInit & { method?: string; body?: unknown } = {}
  ): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (authStore.accessToken) {
      headers['Authorization'] = `Bearer ${authStore.accessToken}`
    }

    const fetchOptions: Parameters<typeof $fetch>[1] = {
      ...options,
      headers,
      baseURL: config.public.apiBaseUrl,
    }

    try {
      return await $fetch<T>(endpoint, fetchOptions)
    } catch (err: unknown) {
      const error = err as { status?: number }
      // If 401 and have refresh token, try to refresh
      if (error?.status === 401 && authStore.refreshToken) {
        const refreshed = await authStore.refreshAccessToken()
        if (refreshed && authStore.accessToken) {
          headers['Authorization'] = `Bearer ${authStore.accessToken}`
          return await $fetch<T>(endpoint, { ...fetchOptions, headers })
        }
      }
      throw err
    }
  }

  return { apiFetch }
}
