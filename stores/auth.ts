import { defineStore } from 'pinia'
import type { CurrentUser, LoginRequest, LoginResponse } from '~/types/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null as string | null,
    refreshToken: null as string | null,
    user: null as CurrentUser | null,
    isAuthenticated: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    currentUser: (state) => state.user,
    hasPermission: (state) => (code: string) => {
      return state.user?.permissionCodes?.includes(code) ?? false
    },
    hasRole: (state) => (role: string) => {
      return state.user?.roles?.includes(role) ?? false
    },
    userDisplayName: (state) => {
      return state.user?.fullName || state.user?.username || 'User'
    },
    userInitials: (state) => {
      const name = state.user?.fullName || state.user?.username || 'U'
      return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    },
  },

  actions: {
    async login(credentials: LoginRequest) {
      const config = useRuntimeConfig()
      this.isLoading = true
      this.error = null

      try {
        const response = await $fetch<{ success: boolean; data: LoginResponse; message?: string }>(
          `${config.public.apiBaseUrl}/api/auth/login`,
          {
            method: 'POST',
            body: credentials,
          }
        )

        if (response.success && response.data) {
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken
          this.isAuthenticated = true

          // Store tokens in localStorage
          if (import.meta.client) {
            localStorage.setItem('access_token', response.data.accessToken)
            localStorage.setItem('refresh_token', response.data.refreshToken)
          }

          // Fetch full user profile
          await this.fetchCurrentUser()
          return { success: true }
        }

        throw new Error(response.message || 'Login failed')
      } catch (err: unknown) {
        const error = err as { data?: { message?: string }; message?: string }
        this.error = error?.data?.message || error?.message || 'Login failed. Please try again.'
        return { success: false, error: this.error }
      } finally {
        this.isLoading = false
      }
    },

    async fetchCurrentUser() {
      if (!this.accessToken) return

      const config = useRuntimeConfig()
      try {
        const response = await $fetch<{ success: boolean; data: CurrentUser }>(
          `${config.public.apiBaseUrl}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        )

        if (response.success && response.data) {
          this.user = response.data
          this.isAuthenticated = true
        }
      } catch {
        this.clearAuth()
      }
    },

    async refreshAccessToken() {
      if (!this.refreshToken) {
        this.clearAuth()
        return false
      }

      const config = useRuntimeConfig()
      try {
        const response = await $fetch<{ success: boolean; data: LoginResponse }>(
          `${config.public.apiBaseUrl}/api/auth/refresh`,
          {
            method: 'POST',
            body: { refreshToken: this.refreshToken },
          }
        )

        if (response.success && response.data) {
          this.accessToken = response.data.accessToken
          this.refreshToken = response.data.refreshToken

          if (import.meta.client) {
            localStorage.setItem('access_token', response.data.accessToken)
            localStorage.setItem('refresh_token', response.data.refreshToken)
          }
          return true
        }
      } catch {
        this.clearAuth()
      }
      return false
    },

    async logout() {
      const config = useRuntimeConfig()
      this.isLoading = true

      try {
        if (this.accessToken) {
          await $fetch(`${config.public.apiBaseUrl}/api/auth/logout`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          })
        }
      } catch {
        // Ignore logout errors
      } finally {
        this.clearAuth()
        this.isLoading = false
        navigateTo('/login')
      }
    },

    initFromStorage() {
      if (import.meta.client) {
        const accessToken = localStorage.getItem('access_token')
        const refreshToken = localStorage.getItem('refresh_token')

        if (accessToken && refreshToken) {
          this.accessToken = accessToken
          this.refreshToken = refreshToken
          this.isAuthenticated = true
        }
      }
    },

    clearAuth() {
      this.accessToken = null
      this.refreshToken = null
      this.user = null
      this.isAuthenticated = false

      if (import.meta.client) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
    },
  },
})
