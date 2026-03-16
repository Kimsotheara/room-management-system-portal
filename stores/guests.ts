import { defineStore } from 'pinia'
import type {
  ApiResponse,
  PageAbleResponse,
  GuestResponse,
  CreateGuestRequest,
  UpdateGuestRequest,
  GuestFilterRequest,
} from '~/types/api'

export const useGuestsStore = defineStore('guests', {
  state: () => ({
    items:         [] as GuestResponse[],
    totalPages:    0,
    totalElements: 0,
    loading:       false,
    submitting:    false,
    error:         null as string | null,
  }),

  actions: {
    // POST /api/guests/list/filter — server-side filtering + pagination
    async fetchPage(params: {
      page:   number            // 0-indexed (UI convention)
      size:   number
      filter?: GuestFilterRequest
    }) {
      const { apiFetch } = useApi()
      this.loading = true
      this.error   = null
      try {
        const body = {
          pageNumber:    params.page + 1,  // API is 1-based
          size:          params.size,
          sortProperty:  'createdAt',
          sortDirection: 'desc',
          parameter:     params.filter ?? {},
        }
        const res = await apiFetch<ApiResponse<PageAbleResponse<GuestResponse>>>(
          '/api/guests/list/filter',
          { method: 'POST', body },
        )
        if (res.success && res.data) {
          this.items         = res.data.list
          this.totalPages    = res.data.totalPages
          this.totalElements = res.data.totalElements
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load guests'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateGuestRequest): Promise<GuestResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<GuestResponse>>('/api/guests', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateGuestRequest): Promise<GuestResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<GuestResponse>>(`/api/guests/${id}`, {
          method: 'PUT',
          body:   data,
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
        await apiFetch<ApiResponse<void>>(`/api/guests/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },
  },
})
