import { defineStore } from 'pinia'
import type {
  ApiResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
} from '~/types/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [] as UserResponse[],   // full list from API
    loading: false,
    submitting: false,
    error: null as string | null,
  }),

  actions: {
    // GET /api/users → ApiResponse<UserResponse[]>  (no server-side pagination)
    async fetchAll() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const res = await apiFetch<ApiResponse<UserResponse[]>>('/api/users')
        if (res.success && res.data) {
          this.items = res.data
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load users'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateUserRequest): Promise<UserResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<UserResponse>>('/api/users', {
          method: 'POST',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateUserRequest): Promise<UserResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<UserResponse>>(`/api/users/${id}`, {
          method: 'PUT',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Update failed')
      } finally {
        this.submitting = false
      }
    },

    async remove(id: number): Promise<void> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        await apiFetch<ApiResponse<void>>(`/api/users/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },

    async assignRole(userId: number, data: AssignRoleRequest): Promise<UserResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<UserResponse>>(`/api/users/${userId}/roles`, {
        method: 'POST',
        body: data,
      })
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Assign role failed')
    },

    async removeRole(userId: number, roleId: number): Promise<UserResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<UserResponse>>(
        `/api/users/${userId}/roles/${roleId}`,
        { method: 'DELETE' }
      )
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Remove role failed')
    },
  },
})
