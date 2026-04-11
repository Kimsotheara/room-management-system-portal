import { defineStore } from 'pinia'
import type {
  ApiResponse,
  PromotionResponse,
  CreatePromotionRequest,
  UpdatePromotionRequest,
  PromotionRoomTypeResponse,
  AssignPromotionRoomTypeRequest,
} from '~/types/api'

export const usePromotionsStore = defineStore('promotions', {
  state: () => ({
    items:      [] as PromotionResponse[],
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
        const res = await apiFetch<ApiResponse<PromotionResponse[]>>('/api/promotions')
        if (res.success && res.data) this.items = res.data
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load promotions'
        throw err
      } finally {
        this.loading = false
      }
    },

    async create(data: CreatePromotionRequest): Promise<PromotionResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<PromotionResponse>>('/api/promotions', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdatePromotionRequest): Promise<PromotionResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<PromotionResponse>>(`/api/promotions/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/promotions/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },

    // ── Promotion Room Types ─────────────────────────────────────────────────
    async getRoomTypes(promotionId: number): Promise<PromotionRoomTypeResponse[]> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<PromotionRoomTypeResponse[]>>(
        `/api/promotion-room-types/promotion/${promotionId}`,
      )
      return res.data ?? []
    },

    async assignRoomTypes(promotionId: number, roomTypeIds: number[]): Promise<void> {
      const { apiFetch } = useApi()
      await apiFetch(`/api/promotion-room-types`, {
        method: 'POST',
        body:   { promotionId, roomTypeIds } as AssignPromotionRoomTypeRequest,
      })
    },

    async removeRoomType(assignmentId: number): Promise<void> {
      const { apiFetch } = useApi()
      await apiFetch(`/api/promotion-room-types/${assignmentId}`, { method: 'DELETE' })
    },
  },
})
