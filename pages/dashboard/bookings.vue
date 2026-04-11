<template>
  <div class="space-y-6">

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="toast"
        class="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 sm:right-6 sm:top-6"
        :class="toast.type === 'success' ? 'bg-green-50 ring-green-200 text-green-800' : 'bg-red-50 ring-red-200 text-red-800'"
      >
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="toast.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bookings</h1>
        <p class="mt-1 text-sm text-gray-500">{{ filteredItems.length }} of {{ store.items.length }} reservations</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="showForm = true"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        New Booking
      </button>
    </div>

    <!-- Status tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex gap-1 overflow-x-auto">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="flex-shrink-0 border-b-2 px-4 py-3 text-sm font-medium transition-colors"
          :class="activeTab === tab.value
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tabCount(tab.value) > 0"
            class="ml-2 rounded-full px-2 py-0.5 text-xs"
            :class="activeTab === tab.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'"
          >{{ tabCount(tab.value) }}</span>
        </button>
      </nav>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="Search by guest name…"
          class="block w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        v-model="filterPayment"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Payments</option>
        <option value="UNPAID">Unpaid</option>
        <option value="PARTIAL">Partial</option>
        <option value="PAID">Paid</option>
      </select>
    </div>

    <!-- Table card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

      <!-- Loading -->
      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      <!-- Empty -->
      <div v-else-if="!pagedItems.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No reservations found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterPayment ? 'Try adjusting your search or filters' : 'Create the first reservation to get started' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[800px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">#</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Guest</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check-in</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Check-out</th>
              <th class="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wider text-gray-500">Nights</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Payment</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="res in pagedItems"
              :key="res.id"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- ID -->
              <td class="px-5 py-4 text-sm font-mono text-gray-500">#{{ res.id }}</td>

              <!-- Guest -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                    {{ initials(res.guestName) }}
                  </div>
                  <span class="text-sm font-medium text-gray-900">{{ res.guestName }}</span>
                </div>
              </td>

              <!-- Check-in -->
              <td class="px-5 py-4 text-sm text-gray-600">{{ fmtDate(res.checkInDate) }}</td>

              <!-- Check-out -->
              <td class="px-5 py-4 text-sm text-gray-600">{{ fmtDate(res.checkOutDate) }}</td>

              <!-- Nights -->
              <td class="px-5 py-4 text-center text-sm font-medium text-gray-700">{{ res.nights }}</td>

              <!-- Total -->
              <td class="px-5 py-4 text-right text-sm font-semibold text-gray-900">{{ fmtCurrency(res.totalAmount) }}</td>

              <!-- Payment Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="paymentClass(res.paymentStatus)"
                >{{ res.paymentStatus }}</span>
              </td>

              <!-- Reservation Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="statusClass(res.status)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="statusDot(res.status)" />
                  {{ res.status }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex flex-wrap items-center justify-end gap-1.5">
                  <!-- Services badge (CHECKED_IN) -->
                  <button
                    v-if="res.status === 'CHECKED_IN'"
                    class="inline-flex items-center gap-1 rounded-lg border border-green-200 bg-green-50 px-2.5 py-1.5 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
                    title="Manage services"
                    @click="openDetail(res.id, 'services')"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Services
                    <span v-if="res.serviceUsages?.length" class="rounded-full bg-green-200 px-1.5 text-green-800">{{ res.serviceUsages.length }}</span>
                  </button>
                  <!-- View -->
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="View details"
                    @click="openDetail(res.id)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <!-- Delete -->
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete reservation"
                    @click="openDelete(res)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="border-t border-gray-100 px-5 py-4">
        <UiPagination
          :page="currentPage"
          :total-pages="totalPages"
          :total="filteredItems.length"
          :page-size="pageSize"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modals -->
    <ReservationsReservationFormModal
      v-model="showForm"
      @saved="onCreated"
    />
    <ReservationsReservationDetailModal
      v-model="showDetail"
      :reservation-id="selectedId"
      :initial-tab="selectedTab"
      @updated="store.fetchAll()"
    />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Reservation"
      :message="`Delete reservation #${selectedRes?.id} for ${selectedRes?.guestName}?`"
      detail="This action cannot be undone."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { ReservationResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useReservationsStore()

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref('all')
const tabs = [
  { label: 'All',         value: 'all' },
  { label: 'Confirmed',   value: 'CONFIRMED' },
  { label: 'Checked In',  value: 'CHECKED_IN' },
  { label: 'Checked Out', value: 'CHECKED_OUT' },
  { label: 'Cancelled',   value: 'CANCELLED' },
]

function tabCount(value: string) {
  if (value === 'all') return store.items.length
  return store.items.filter(r => r.status === value).length
}

// ── Filters ───────────────────────────────────────────────────────────────────
const keyword       = ref('')
const filterPayment = ref('')
const currentPage   = ref(0)
const pageSize      = ref(10)

const filteredItems = computed(() => {
  let items = store.items
  if (activeTab.value !== 'all') {
    items = items.filter(r => r.status === activeTab.value)
  }
  if (keyword.value.trim()) {
    const q = keyword.value.toLowerCase()
    items = items.filter(r => r.guestName.toLowerCase().includes(q))
  }
  if (filterPayment.value) {
    items = items.filter(r => r.paymentStatus === filterPayment.value)
  }
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const pagedItems = computed(() => {
  const from = currentPage.value * pageSize.value
  return filteredItems.value.slice(from, from + pageSize.value)
})

watch([activeTab, keyword, filterPayment], () => { currentPage.value = 0 })

// ── Modal state ───────────────────────────────────────────────────────────────
const showForm      = ref(false)
const showDetail    = ref(false)
const showDelete    = ref(false)
const selectedId    = ref<number | null>(null)
const selectedTab   = ref<'overview' | 'services' | 'payment' | 'invoice'>('overview')
const selectedRes   = ref<ReservationResponse | null>(null)

function openDetail(id: number, tab: 'overview' | 'services' | 'payment' | 'invoice' = 'overview') {
  selectedId.value   = id
  selectedTab.value  = tab
  showDetail.value   = true
}

function openDelete(res: ReservationResponse) {
  selectedRes.value = res
  showDelete.value  = true
}

// ── Toast ─────────────────────────────────────────────────────────────────────
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(type: 'success' | 'error', message: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { type, message }
  toastTimer  = setTimeout(() => { toast.value = null }, 3500)
}

// ── Handlers ─────────────────────────────────────────────────────────────────
function onCreated() {
  showToast('success', 'Reservation created successfully')
  store.fetchAll()
}

async function handleDelete() {
  if (!selectedRes.value) return
  try {
    await store.remove(selectedRes.value.id)
    showDelete.value = false
    showToast('success', `Reservation #${selectedRes.value.id} deleted`)
    await store.fetchAll()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    showToast('error', e?.data?.message || e?.message || 'Delete failed')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function statusClass(s: string) {
  if (s === 'CONFIRMED')   return 'bg-blue-50   text-blue-700   ring-blue-200'
  if (s === 'CHECKED_IN')  return 'bg-green-50  text-green-700  ring-green-200'
  if (s === 'CHECKED_OUT') return 'bg-purple-50 text-purple-700 ring-purple-200'
  if (s === 'CANCELLED')   return 'bg-red-50    text-red-700    ring-red-200'
  return 'bg-gray-100 text-gray-600 ring-gray-200'
}

function statusDot(s: string) {
  if (s === 'CONFIRMED')   return 'bg-blue-500'
  if (s === 'CHECKED_IN')  return 'bg-green-500'
  if (s === 'CHECKED_OUT') return 'bg-purple-500'
  if (s === 'CANCELLED')   return 'bg-red-400'
  return 'bg-gray-400'
}

function paymentClass(s: string) {
  if (s === 'PAID')    return 'bg-green-50 text-green-700 ring-green-200'
  if (s === 'PARTIAL') return 'bg-amber-50 text-amber-700 ring-amber-200'
  return 'bg-red-50 text-red-700 ring-red-200'
}

onMounted(() => store.fetchAll())
</script>
