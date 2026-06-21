<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
        <p class="mt-1 text-sm text-gray-500">Revenue and reservation analytics</p>
      </div>
      <!-- Date range + Run -->
      <div class="flex flex-wrap items-center gap-2">
        <input
          v-model="from"
          type="date"
          class="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <span class="text-sm text-gray-400">to</span>
        <input
          v-model="to"
          type="date"
          class="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <button
          :disabled="loading"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-60"
          @click="fetchReports"
        >
          <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Run Report
        </button>
      </div>
    </div>

    <!-- Quick presets -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in presets"
        :key="preset.label"
        class="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm transition hover:bg-gray-50"
        @click="applyPreset(preset)"
      >{{ preset.label }}</button>
    </div>

    <!-- Error -->
    <AuthFormAlert :message="error" />

    <!-- Empty state -->
    <div
      v-if="!revenue && !reservationReport && !loading"
      class="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-200 py-16 text-center"
    >
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-900">Select a date range and run the report</p>
      <p class="mt-1 text-xs text-gray-400">Use a preset or pick custom from/to dates above</p>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-16">
      <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <template v-if="!loading && (revenue || reservationReport)">

      <!-- ── Revenue Report ────────────────────────────────────────────────── -->
      <section v-if="revenue">
        <h2 class="mb-4 text-base font-semibold text-gray-900">
          Revenue
          <span class="ml-2 text-sm font-normal text-gray-400">{{ fmtDateRange(revenue.from, revenue.to) }}</span>
        </h2>

        <!-- Summary cards -->
        <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs text-gray-400">Total Revenue</p>
            <p class="mt-1 text-xl font-bold text-gray-900">{{ fmtCurrency(revenue.totalRevenue) }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs text-gray-400">Room Charges</p>
            <p class="mt-1 text-xl font-bold text-gray-900">{{ fmtCurrency(revenue.totalRoomCharges) }}</p>
          </div>
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="text-xs text-gray-400">Service Charges</p>
            <p class="mt-1 text-xl font-bold text-gray-900">{{ fmtCurrency(revenue.totalServiceCharges) }}</p>
          </div>
          <div class="rounded-xl border border-green-100 bg-green-50 p-4">
            <p class="text-xs text-green-600">Collected</p>
            <p class="mt-1 text-xl font-bold text-green-700">{{ fmtCurrency(revenue.totalPaid) }}</p>
          </div>
          <div class="rounded-xl border p-4" :class="revenue.totalBalance > 0 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-white'">
            <p class="text-xs" :class="revenue.totalBalance > 0 ? 'text-red-500' : 'text-gray-400'">Outstanding</p>
            <p class="mt-1 text-xl font-bold" :class="revenue.totalBalance > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ fmtCurrency(revenue.totalBalance) }}
            </p>
          </div>
        </div>

        <!-- Collection rate + breakdown -->
        <div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <!-- Collection rate -->
          <div class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div class="mb-2 flex items-center justify-between text-sm">
              <span class="font-medium text-gray-700">Collection Rate</span>
              <span class="font-bold text-gray-900">{{ collectionRate }}%</span>
            </div>
            <div class="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="collectionRate >= 80 ? 'bg-green-500' : collectionRate >= 50 ? 'bg-amber-400' : 'bg-red-400'"
                :style="{ width: `${collectionRate}%` }"
              />
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-400">
              <span>{{ fmtCurrency(revenue.totalPaid) }} collected</span>
              <span>{{ fmtCurrency(revenue.totalBalance) }} outstanding</span>
            </div>
          </div>

          <!-- Revenue breakdown -->
          <div v-if="revenue.totalRevenue > 0" class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p class="mb-2 text-sm font-medium text-gray-700">Revenue Breakdown</p>
            <div class="flex h-5 overflow-hidden rounded-full">
              <div
                class="flex items-center justify-center bg-primary-500 text-xs font-medium text-white transition-all duration-700"
                :style="{ width: `${roomPct}%` }"
              />
              <div
                class="flex items-center justify-center bg-violet-400 text-xs font-medium text-white transition-all duration-700"
                :style="{ width: `${svcPct}%` }"
              />
            </div>
            <div class="mt-2 flex gap-4 text-xs text-gray-500">
              <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-primary-500" />Rooms {{ roomPct }}%</span>
              <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-violet-400" />Services {{ svcPct }}%</span>
            </div>
          </div>
        </div>

        <!-- Payment method table -->
        <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div class="border-b border-gray-100 px-5 py-3">
            <p class="text-sm font-semibold text-gray-700">By Payment Method</p>
          </div>
          <div v-if="revenue.byPaymentMethod.length === 0" class="py-8 text-center text-sm text-gray-400">
            No payments recorded in this period.
          </div>
          <table v-else class="w-full text-sm">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Method</th>
                <th class="px-5 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Transactions</th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Amount</th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Share</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="m in revenue.byPaymentMethod" :key="m.paymentMethod" class="hover:bg-gray-50">
                <td class="px-5 py-3">
                  <span class="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">{{ m.paymentMethod }}</span>
                </td>
                <td class="px-5 py-3 text-center text-gray-600">{{ m.count }}</td>
                <td class="px-5 py-3 text-right font-semibold text-gray-900">{{ fmtCurrency(m.amount) }}</td>
                <td class="px-5 py-3 text-right text-gray-500">
                  {{ revenue.totalPaid > 0 ? Math.round((m.amount / revenue.totalPaid) * 100) : 0 }}%
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-gray-200 bg-gray-50">
                <td class="px-5 py-3 text-sm font-semibold text-gray-700">Total</td>
                <td class="px-5 py-3 text-center text-sm font-semibold text-gray-700">
                  {{ revenue.byPaymentMethod.reduce((s, m) => s + m.count, 0) }}
                </td>
                <td class="px-5 py-3 text-right text-sm font-bold text-gray-900">{{ fmtCurrency(revenue.totalPaid) }}</td>
                <td class="px-5 py-3 text-right text-sm font-semibold text-gray-500">100%</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <!-- ── Reservation Report ──────────────────────────────────────────── -->
      <section v-if="reservationReport">
        <h2 class="mb-4 text-base font-semibold text-gray-900">
          Reservations
          <span class="ml-2 text-sm font-normal text-gray-400">{{ fmtDateRange(reservationReport.from, reservationReport.to) }}</span>
        </h2>

        <!-- Status cards -->
        <div class="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div class="rounded-xl border border-gray-200 bg-white p-4 text-center shadow-sm">
            <p class="text-xs text-gray-400">Total</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">{{ reservationReport.total }}</p>
          </div>
          <div class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-center">
            <p class="text-xs text-blue-500">Confirmed</p>
            <p class="mt-1 text-2xl font-bold text-blue-700">{{ reservationReport.confirmed }}</p>
          </div>
          <div class="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
            <p class="text-xs text-green-500">Checked In</p>
            <p class="mt-1 text-2xl font-bold text-green-700">{{ reservationReport.checkedIn }}</p>
          </div>
          <div class="rounded-xl border border-purple-100 bg-purple-50 p-4 text-center">
            <p class="text-xs text-purple-500">Checked Out</p>
            <p class="mt-1 text-2xl font-bold text-purple-700">{{ reservationReport.checkedOut }}</p>
          </div>
          <div class="rounded-xl border border-red-100 bg-red-50 p-4 text-center">
            <p class="text-xs text-red-400">Cancelled</p>
            <p class="mt-1 text-2xl font-bold text-red-600">{{ reservationReport.cancelled }}</p>
          </div>
        </div>

        <!-- Status bar -->
        <div v-if="reservationReport.total > 0" class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <p class="mb-3 text-sm font-medium text-gray-700">Status Distribution</p>
          <div class="flex h-6 overflow-hidden rounded-full">
            <div class="bg-blue-400 transition-all duration-700"   :style="{ width: `${pct(reservationReport.confirmed)}%` }" />
            <div class="bg-green-500 transition-all duration-700"  :style="{ width: `${pct(reservationReport.checkedIn)}%` }" />
            <div class="bg-purple-500 transition-all duration-700" :style="{ width: `${pct(reservationReport.checkedOut)}%` }" />
            <div class="bg-red-400 transition-all duration-700"    :style="{ width: `${pct(reservationReport.cancelled)}%` }" />
          </div>
          <div class="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-400" />Confirmed {{ pct(reservationReport.confirmed) }}%</span>
            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-green-500" />Checked In {{ pct(reservationReport.checkedIn) }}%</span>
            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-purple-500" />Checked Out {{ pct(reservationReport.checkedOut) }}%</span>
            <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-red-400" />Cancelled {{ pct(reservationReport.cancelled) }}%</span>
          </div>

          <div class="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <span class="text-gray-600">Completion rate</span>
              <span class="font-bold text-gray-900">
                {{ reservationReport.total > 0 ? Math.round((reservationReport.checkedOut / reservationReport.total) * 100) : 0 }}%
              </span>
            </div>
            <div class="flex items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-sm">
              <span class="text-gray-600">Cancellation rate</span>
              <span class="font-bold" :class="cancelRate > 20 ? 'text-red-600' : 'text-gray-900'">{{ cancelRate }}%</span>
            </div>
          </div>
        </div>
        <div v-else class="rounded-xl border border-dashed border-gray-200 py-8 text-center text-sm text-gray-400">
          No reservations found in this period.
        </div>
      </section>

    </template>

  </div>
</template>

<script setup lang="ts">
import type { RevenueReportResponse, ReservationReportResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useReportsStore()

// ── Date range ─────────────────────────────────────────────────────────────────
const todayStr      = new Date().toISOString().slice(0, 10)
const firstOfMonth  = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10)

const from = ref(firstOfMonth)
const to   = ref(todayStr)

const presets = computed(() => {
  const now   = new Date()
  const y     = now.getFullYear()
  const m     = now.getMonth()
  const lmStart = new Date(y, m - 1, 1).toISOString().slice(0, 10)
  const lmEnd   = new Date(y, m, 0).toISOString().slice(0, 10)
  const w7ago   = new Date(now); w7ago.setDate(now.getDate() - 6)
  return [
    { label: 'This Month',  from: firstOfMonth, to: todayStr },
    { label: 'Last Month',  from: lmStart, to: lmEnd },
    { label: 'Last 7 Days', from: w7ago.toISOString().slice(0, 10), to: todayStr },
    { label: 'This Year',   from: `${y}-01-01`, to: todayStr },
  ]
})

function applyPreset(p: { from: string; to: string }) {
  from.value = p.from
  to.value   = p.to
  fetchReports()
}

// ── Data ───────────────────────────────────────────────────────────────────────
const revenue           = ref<RevenueReportResponse | null>(null)
const reservationReport = ref<ReservationReportResponse | null>(null)
const loading           = ref(false)
const error             = ref<string | null>(null)

async function fetchReports() {
  if (!from.value || !to.value) return
  loading.value = true
  error.value   = null
  try {
    const [rev, res] = await Promise.all([
      store.fetchRevenue(from.value, to.value),
      store.fetchReservations(from.value, to.value),
    ])
    revenue.value           = rev
    reservationReport.value = res
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    error.value = e?.data?.message || e?.message || 'Failed to load reports'
  } finally {
    loading.value = false
  }
}

onMounted(() => fetchReports())

// ── Computed ───────────────────────────────────────────────────────────────────
const collectionRate = computed(() => {
  if (!revenue.value || revenue.value.totalRevenue === 0) return 0
  return Math.round((revenue.value.totalPaid / revenue.value.totalRevenue) * 100)
})

const roomPct = computed(() => {
  if (!revenue.value || revenue.value.totalRevenue === 0) return 0
  return Math.round((revenue.value.totalRoomCharges / revenue.value.totalRevenue) * 100)
})

const svcPct = computed(() => {
  if (!revenue.value || revenue.value.totalRevenue === 0) return 0
  return 100 - roomPct.value
})

const cancelRate = computed(() => {
  if (!reservationReport.value || reservationReport.value.total === 0) return 0
  return Math.round((reservationReport.value.cancelled / reservationReport.value.total) * 100)
})

function pct(n: number) {
  if (!reservationReport.value || reservationReport.value.total === 0) return 0
  return Math.round((n / reservationReport.value.total) * 100)
}

// ── Formatters ─────────────────────────────────────────────────────────────────
function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n ?? 0)
}

function fmtDateRange(f: string, t: string) {
  const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return `${fmt(f)} – ${fmt(t)}`
}
</script>
