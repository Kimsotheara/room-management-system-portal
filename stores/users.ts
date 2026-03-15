import { defineStore } from 'pinia'
import type {
  ApiResponse,
  PageAbleRequest,
  PageAbleResponse,
  UserResponse,
  UserFilterRequest,
  CreateUserRequest,
  UpdateUserRequest,
  AssignRoleRequest,
} from '~/types/api'

export const useUsersStore = defineStore('users', {
  state: () => ({
    items: [] as UserResponse[],
    totalPages: 0,
    totalElements: 0,
    loading: false,
    submitting: false,
    error: null as string | null,
  }),

  actions: {
    // POST /api/users/list/filter → ApiResponse<PageAbleResponse<UserResponse>>
    async fetchPage(params?: {
      filter?: UserFilterRequest
      pageNumber?: number   // 1-based
      size?: number
      sortProperty?: string
      sortDirection?: 'asc' | 'desc'
    }) {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const body: PageAbleRequest<UserFilterRequest> = {
          pageNumber: params?.pageNumber ?? 1,
          size: params?.size ?? 10,
          sortProperty: params?.sortProperty ?? 'userId',
          sortDirection: params?.sortDirection ?? 'desc',
          parameter: params?.filter ?? {},
        }
        const res = await apiFetch<ApiResponse<PageAbleResponse<UserResponse>>>(
          '/api/users/list/filter',
          { method: 'POST', body },
        )
        if (res.success && res.data) {
          this.items = res.data.list
          this.totalPages = res.data.totalPages
          this.totalElements = res.data.totalElements
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
        { method: 'DELETE' },
      )
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Remove role failed')
    },
  },
})
