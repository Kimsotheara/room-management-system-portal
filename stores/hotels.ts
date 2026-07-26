import { defineStore } from 'pinia'
import type {
  ApiResponse,
  HotelResponse,
  CreateHotelRequest,
  UpdateHotelRequest,
} from '~/types/api'

export const useHotelsStore = defineStore('hotels', {
  state: () => ({
    items:      [] as HotelResponse[],
    loading:    false,
    submitting: false,
    error:      null as string | null,
  }),

  actions: {
    async fetchAll() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error   = null
      try {
        const res = await apiFetch<ApiResponse<HotelResponse[]>>('/api/hotels')
        if (res.success && res.data) this.items = res.data
      } catch (err: unknown) {
        this.error = getApiError(err, 'Failed to load hotels')
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateHotelRequest): Promise<HotelResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<HotelResponse>>('/api/hotels', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateHotelRequest): Promise<HotelResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<HotelResponse>>(`/api/hotels/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/hotels/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },
  },
})
