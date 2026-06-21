import { defineStore } from 'pinia'
import type {
  ApiResponse,
  DashboardResponse,
  RevenueReportResponse,
  ReservationReportResponse,
} from '~/types/api'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    dashboard:    null as DashboardResponse | null,
    loading:      false,
    error:        null as string | null,
  }),

  actions: {
    async fetchDashboard(): Promise<DashboardResponse> {
      const { apiFetch } = useApi()
      this.loading = true
      this.error   = null
      try {
        const res = await apiFetch<ApiResponse<DashboardResponse>>('/api/reports/dashboard')
        if (res.success && res.data) {
          this.dashboard = res.data
          return res.data
        }
        throw new Error(res.message || 'Failed to load dashboard')
      } catch (err: unknown) {
        const e = err as { data?: { message?: string }; message?: string }
        this.error = e?.data?.message || e?.message || 'Failed to load dashboard'
        throw err
      } finally {
        this.loading = false
      }
    },

    async fetchRevenue(from: string, to: string): Promise<RevenueReportResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<RevenueReportResponse>>(
        `/api/reports/revenue?from=${from}&to=${to}`,
      )
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Failed to load revenue report')
    },

    async fetchReservations(from: string, to: string): Promise<ReservationReportResponse> {
      const { apiFetch } = useApi()
      const res = await apiFetch<ApiResponse<ReservationReportResponse>>(
        `/api/reports/reservations?from=${from}&to=${to}`,
      )
      if (res.success && res.data) return res.data
      throw new Error(res.message || 'Failed to load reservation report')
    },
  },
})
