<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Hotels</h1>
        <p class="mt-1 text-sm text-gray-500">{{ filteredItems.length }} of {{ store.items.length }} hotels</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        v-if="can(PERM.HOTEL.CREATE)" @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Hotel
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
          placeholder="Search by hotel name, contact or address…"
          class="block w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
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
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No hotels found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterStatus ? 'Try adjusting your search or filters' : 'Add the first hotel to get started' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[600px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Hotel</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Address</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="hotel in pagedItems"
              :key="hotel.hotelId"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50">
                    <svg class="h-4 w-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p class="text-sm font-medium text-gray-900">{{ hotel.hotelName }}</p>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-5 py-4 text-sm text-gray-600">{{ hotel.contact || '—' }}</td>

              <!-- Address -->
              <td class="px-5 py-4 text-sm text-gray-600">
                <span class="line-clamp-1 max-w-xs">{{ hotel.address || '—' }}</span>
              </td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="hotel.isActive
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-gray-100 text-gray-500 ring-gray-200'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="hotel.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ hotel.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit hotel"
                    v-if="can(PERM.HOTEL.UPDATE)" @click="openEdit(hotel)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete hotel"
                    v-if="can(PERM.HOTEL.DELETE)" @click="openDelete(hotel)"
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
    <HotelsHotelFormModal v-model="showForm" :hotel="selectedHotel" @saved="onSaved" />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Hotel"
      :message="`Delete '${selectedHotel?.hotelName}'?`"
      detail="This action cannot be undone."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { HotelResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth', permission: 'HOTEL_READ' })

const { can } = usePermissions()

const store = useHotelsStore()

// ── Filters ───────────────────────────────────────────────────────────────────
const keyword      = ref('')
const filterStatus = ref('')
const currentPage  = ref(0)
const pageSize     = ref(10)

const filteredItems = computed(() => {
  let items = store.items
  if (keyword.value.trim()) {
    const q = keyword.value.toLowerCase()
    items = items.filter(h =>
      h.hotelName.toLowerCase().includes(q) ||
      (h.contact ?? '').toLowerCase().includes(q) ||
      (h.address ?? '').toLowerCase().includes(q),
    )
  }
  if (filterStatus.value !== '') {
    const active = filterStatus.value === 'true'
    items = items.filter(h => h.isActive === active)
  }
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))
const pagedItems = computed(() => {
  const from = currentPage.value * pageSize.value
  return filteredItems.value.slice(from, from + pageSize.value)
})

watch([keyword, filterStatus], () => { currentPage.value = 0 })

// ── Modal state ───────────────────────────────────────────────────────────────
const showForm      = ref(false)
const showDelete    = ref(false)
const selectedHotel = ref<HotelResponse | null>(null)

function openCreate() { selectedHotel.value = null; showForm.value = true }
function openEdit(h: HotelResponse) { selectedHotel.value = h; showForm.value = true }
function openDelete(h: HotelResponse) { selectedHotel.value = h; showDelete.value = true }

const { showToast } = useToast()

// ── Handlers ─────────────────────────────────────────────────────────────────
function onSaved() {
  showToast('success', selectedHotel.value ? 'Hotel updated' : 'Hotel added successfully')
  store.fetchAll()
}

async function handleDelete() {
  if (!selectedHotel.value) return
  try {
    await store.remove(selectedHotel.value.hotelId)
    showDelete.value = false
    showToast('success', `'${selectedHotel.value.hotelName}' deleted`)
    await store.fetchAll()
  } catch (err: unknown) {
    showToast('error', getApiError(err, 'Delete failed'))
  }
}

onMounted(() => store.fetchAll())
</script>
