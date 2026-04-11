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
        <h1 class="text-2xl font-bold text-gray-900">Promotions</h1>
        <p class="mt-1 text-sm text-gray-500">{{ filteredItems.length }} of {{ store.items.length }} promotions</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Promotion
      </button>
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
          placeholder="Search by promotion name…"
          class="block w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        v-model="filterDiscountType"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Types</option>
        <option value="PERCENT">Percentage</option>
        <option value="AMOUNT">Fixed Amount</option>
      </select>
      <select
        v-model="filterStatus"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No promotions found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterStatus || filterDiscountType ? 'Try adjusting your search or filters' : 'Add the first promotion to get started' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Promotion</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Discount Type</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Discount Value</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Validity</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="promo in pagedItems"
              :key="promo.id"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-amber-50">
                    <svg class="h-4 w-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-900">{{ promo.name }}</p>
                </div>
              </td>

              <!-- Discount Type -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="promo.discountType === 'PERCENT'
                    ? 'bg-violet-50 text-violet-700 ring-violet-200'
                    : 'bg-amber-50 text-amber-700 ring-amber-200'"
                >
                  {{ formatDiscountType(promo.discountType) }}
                </span>
              </td>

              <!-- Discount Value -->
              <td class="px-5 py-4 text-sm font-semibold text-gray-900">{{ formatDiscount(promo) }}</td>

              <!-- Validity -->
              <td class="px-5 py-4">
                <p class="text-xs text-gray-700">{{ formatDate(promo.effectiveDate) }}</p>
                <p class="text-xs text-gray-400">→ {{ promo.expireDate ? formatDate(promo.expireDate) : 'No expiry' }}</p>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="promoStatusClass(promo)"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="promoStatusDotClass(promo)" />
                  {{ promoStatusLabel(promo) }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex flex-wrap items-center justify-end gap-1.5">
                  <button
                    class="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100"
                    @click="openRoomTypes(promo)"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                    </svg>
                    Room Types
                    <span v-if="promo.roomTypes?.length" class="rounded-full bg-violet-200 px-1.5 text-violet-800">
                      {{ promo.roomTypes.length }}
                    </span>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit promotion"
                    @click="openEdit(promo)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete promotion"
                    @click="openDelete(promo)"
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
    <PromotionsPromotionFormModal v-model="showForm" :promotion="selectedPromo" @saved="onSaved" />
    <PromotionsPromotionRoomTypesModal v-model="showRoomTypes" :promotion="selectedPromo" @saved="onRoomTypesSaved" />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Promotion"
      :message="`Delete '${selectedPromo?.name}'?`"
      detail="This action cannot be undone."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { PromotionResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = usePromotionsStore()

// ── Filters ───────────────────────────────────────────────────────────────────
const keyword            = ref('')
const filterStatus       = ref('')
const filterDiscountType = ref('')
const currentPage        = ref(0)
const pageSize           = ref(10)

const filteredItems = computed(() => {
  let items = store.items
  if (keyword.value.trim()) {
    const q = keyword.value.toLowerCase()
    items = items.filter(p => p.name.toLowerCase().includes(q))
  }
  if (filterStatus.value !== '') {
    const active = filterStatus.value === 'true'
    items = items.filter(p => p.isActive === active)
  }
  if (filterDiscountType.value) {
    items = items.filter(p => p.discountType === filterDiscountType.value)
  }
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const pagedItems = computed(() => {
  const from = currentPage.value * pageSize.value
  return filteredItems.value.slice(from, from + pageSize.value)
})

watch([keyword, filterStatus, filterDiscountType], () => { currentPage.value = 0 })

// ── Modal state ───────────────────────────────────────────────────────────────
const showForm      = ref(false)
const showDelete    = ref(false)
const showRoomTypes = ref(false)
const selectedPromo = ref<PromotionResponse | null>(null)

function openCreate()                     { selectedPromo.value = null; showForm.value = true }
function openEdit(p: PromotionResponse)   { selectedPromo.value = p;    showForm.value = true }
function openDelete(p: PromotionResponse) { selectedPromo.value = p;    showDelete.value = true }
function openRoomTypes(p: PromotionResponse) { selectedPromo.value = p; showRoomTypes.value = true }

// ── Toast ────────────────────────────────────────────────────────────────────
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(type: 'success' | 'error', message: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { type, message }
  toastTimer = setTimeout(() => { toast.value = null }, 3500)
}

// ── Handlers ─────────────────────────────────────────────────────────────────
function onSaved() {
  showToast('success', selectedPromo.value ? 'Promotion updated' : 'Promotion added successfully')
  store.fetchAll()
}

function onRoomTypesSaved() {
  showToast('success', 'Room types updated')
  store.fetchAll()
}

async function handleDelete() {
  if (!selectedPromo.value) return
  try {
    await store.remove(selectedPromo.value.id)
    showDelete.value = false
    showToast('success', `'${selectedPromo.value.name}' deleted`)
    await store.fetchAll()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    showToast('error', e?.data?.message || e?.message || 'Delete failed')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatDiscount(p: PromotionResponse) {
  if (p.discountType === 'PERCENT') return `${p.discountValue}%`
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p.discountValue)
}

function formatDiscountType(type: string) {
  return type === 'PERCENT' ? 'Percentage' : type === 'AMOUNT' ? 'Fixed Amount' : type
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function promoStatusLabel(p: PromotionResponse) {
  if (!p.isActive) return 'Inactive'
  const now   = Date.now()
  const start = new Date(p.effectiveDate).getTime()
  if (now < start) return 'Upcoming'
  if (!p.expireDate) return 'Active'   // permanent
  const end = new Date(p.expireDate).getTime()
  if (now > end) return 'Expired'
  return 'Active'
}

function promoStatusClass(p: PromotionResponse) {
  const label = promoStatusLabel(p)
  if (label === 'Active')   return 'bg-green-50 text-green-700 ring-green-200'
  if (label === 'Upcoming') return 'bg-blue-50 text-blue-700 ring-blue-200'
  if (label === 'Expired')  return 'bg-orange-50 text-orange-700 ring-orange-200'
  return 'bg-gray-100 text-gray-500 ring-gray-200'
}

function promoStatusDotClass(p: PromotionResponse) {
  const label = promoStatusLabel(p)
  if (label === 'Active')   return 'bg-green-500'
  if (label === 'Upcoming') return 'bg-blue-500'
  if (label === 'Expired')  return 'bg-orange-500'
  return 'bg-gray-400'
}

onMounted(() => store.fetchAll())
</script>
