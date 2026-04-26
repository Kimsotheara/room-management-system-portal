import { defineStore } from 'pinia'
import type {
  ApiResponse,
  ReservationResponse,
  CreateReservationRequest,
  UpdateReservationRequest,
  PaymentRequest,
  PaymentResponse,
  InvoiceResponse,
  ServiceUsageResponse,
  AddServiceUsageRequest,
} from '~/types/api'

export const useReservationsStore = defineStore('reservations', {
  state: () => ({
    items:      [] as ReservationResponse[],
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
        const res = await apiFetch<ApiResponse<ReservationResponse[]>>('/api/reservations')
        if (res.success && res.data) this.items = res.data
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load reservations'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchById(id: number): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<ReservationResponse>>(`/api/reservations/${id}`)
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Reservation not found')
    },

    async create(data: CreateReservationRequest): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ReservationResponse>>('/api/reservations', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Create failed')
      } finally {
        this.submitting = false
      }
    },

    async update(id: number, data: UpdateReservationRequest): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ReservationResponse>>(`/api/reservations/${id}`, {
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
        await apiFetch<ApiResponse<void>>(`/api/reservations/${id}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },

    async checkIn(id: number): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ReservationResponse>>(
          `/api/reservations/${id}/check-in`,
          { method: 'POST' },
        )
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Check-in failed')
      } finally {
        this.submitting = false
      }
    },

    async checkOut(id: number): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ReservationResponse>>(
          `/api/reservations/${id}/check-out`,
          { method: 'POST' },
        )
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Check-out failed')
      } finally {
        this.submitting = false
      }
    },

    async cancel(id: number): Promise<ReservationResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ReservationResponse>>(
          `/api/reservations/${id}/cancel`,
          { method: 'POST' },
        )
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Cancel failed')
      } finally {
        this.submitting = false
      }
    },

    async addPayment(data: PaymentRequest): Promise<PaymentResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<PaymentResponse>>('/api/payments', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Payment failed')
      } finally {
        this.submitting = false
      }
    },

    async getPayments(reservationId: number): Promise<PaymentResponse[]> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<PaymentResponse[]>>(
        `/api/payments/reservation/${reservationId}`,
      )
      return res.data ?? []
    },

    async getInvoice(id: number): Promise<InvoiceResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<InvoiceResponse>>(`/api/reservations/${id}/invoice`)
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Invoice not found')
    },

    // ── Service Usages ────────────────────────────────────────────────────────
    async addServiceUsage(data: AddServiceUsageRequest): Promise<ServiceUsageResponse> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        const res = await apiFetch<ApiResponse<ServiceUsageResponse>>('/api/service-usages', {
          method: 'POST',
          body:   data,
        })
        if (res.success && res.data) return res.data
        throw new Error(res.message || 'Add service failed')
      } finally {
        this.submitting = false
      }
    },

    async removeServiceUsage(usageId: number): Promise<void> {
      const { apiFetch } = useApi()
      this.submitting = true
      try {
        await apiFetch<ApiResponse<void>>(`/api/service-usages/${usageId}`, { method: 'DELETE' })
      } finally {
        this.submitting = false
      }
    },
  },
})
