import { defineStore } from 'pinia'
import type {
  ApiResponse,
  RoleResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
} from '~/types/api'

export const useRolesStore = defineStore('roles', {
  state: () => ({
    items: [] as RoleResponse[],   // full list from API
    loading: false,
    submitting: false,
    error: null as string | null,
  }),

  actions: {
    // GET /api/roles → ApiResponse<RoleResponse[]>  (no server-side pagination)
    async fetchAll() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const res = await apiFetch<ApiResponse<RoleResponse[]>>('/api/roles')
        if (res.success && res.data) {
          this.items = res.data
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load roles'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateRoleRequest): Promise<RoleResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoleResponse>>('/api/roles', {
          method: 'POST',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateRoleRequest): Promise<RoleResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoleResponse>>(`/api/roles/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/roles/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },
  },
})
