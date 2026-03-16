import { defineStore } from 'pinia'
import type {
  ApiResponse,
  RoomResponse,
  CreateRoomRequest,
  UpdateRoomRequest,
  AddRoomImagesRequest,
} from '~/types/api'

export const useRoomsStore = defineStore('rooms', {
  state: () => ({
    items: [] as RoomResponse[],
    loading: false,
    submitting: false,
    error: null as string | null,
  }),

  actions: {
    // GET /api/rooms → ApiResponse<RoomResponse[]>
    async fetchAll() {
      const { apiFetch } = useApi()
      this.loading = true
      this.error = null
      try {
        const res = await apiFetch<ApiResponse<RoomResponse[]>>('/api/rooms')
        if (res.success && res.data) {
          this.items = res.data
        }
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load rooms'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreateRoomRequest): Promise<RoomResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoomResponse>>('/api/rooms', {
          method: 'POST',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateRoomRequest): Promise<RoomResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoomResponse>>(`/api/rooms/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/rooms/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },

    // POST /api/rooms/{id}/images — accepts { images: string[] } (Base64 list)
    async addImages(id: number, data: AddRoomImagesRequest): Promise<RoomResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<RoomResponse>>(`/api/rooms/${id}/images`, {
          method: 'POST',
          body: data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Add images failed')
      } finally {
        this.submitting = false
      }
    },

    async deleteImage(roomId: number, imageId: number): Promise<void> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        await apiFetch<ApiResponse<void>>(`/api/rooms/${roomId}/images/${imageId}`, {
          method: 'DELETE',
        })
      } finally {
        this.submitting = false
      }
    },
  },
})
