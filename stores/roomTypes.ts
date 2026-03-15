import { defineStore } from 'pinia'
import type {
  ApiResponse,
  RoomTypeResponse,
  CreateRoomTypeRequest,
  UpdateRoomTypeRequest,
} from '~/types/api'

export const useRoomTypesStore = defineStore('roomTypes', {
  state: () => ({
    items: [] as RoomTypeResponse[],
    loading: false,
    submitting: false,
    error: null as string | null,
  }),

  actions: {
    async fetchAll() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const res = await apiFetch<ApiResponse<RoomTypeResponse[]>>('/api/room-types')
        if (res.success && res.data) {
          this.items = res.data
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load room types'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateRoomTypeRequest): Promise<RoomTypeResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoomTypeResponse>>('/api/room-types', {
          method: 'POST',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateRoomTypeRequest): Promise<RoomTypeResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoomTypeResponse>>(`/api/room-types/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/room-types/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },
  },
})
