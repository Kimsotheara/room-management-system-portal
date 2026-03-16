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
        <h1 class="text-2xl font-bold text-gray-900">Guests</h1>
        <p class="mt-1 text-sm text-gray-500">{{ store.totalElements }} total guests</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Guest
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
          placeholder="Search by name, email or phone…"
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
      <select
        v-model="filterIdentityType"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All ID Types</option>
        <option value="PASSPORT">Passport</option>
        <option value="NATIONAL_ID">National ID</option>
        <option value="DRIVERS_LICENSE">Driver's License</option>
        <option value="OTHER">Other</option>
      </select>
      <select
        v-model="pageSize"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option :value="10">10 / page</option>
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
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
      <div v-else-if="!store.items.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No guests found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterStatus || filterIdentityType ? 'Try adjusting your search or filters' : 'Add the first guest to get started' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[700px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Guest</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Contact</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Identity</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Nationality</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Joined</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="guest in store.items"
              :key="guest.guestId"
              class="transition-colors hover:bg-gray-50"
            >
              <!-- Guest avatar + name -->
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-primary-50">
                    <GuestsGuestImage
                      :guest-id="guest.guestId"
                      :initials="initials(guest)"
                      :alt="`${guest.firstName} ${guest.lastName}`"
                    />
                  </div>
                  <div>
                    <p class="text-sm font-semibold text-gray-900">{{ guest.firstName }} {{ guest.lastName }}</p>
                    <p v-if="guest.address" class="max-w-[160px] truncate text-xs text-gray-400">{{ guest.address }}</p>
                  </div>
                </div>
              </td>

              <!-- Contact -->
              <td class="px-5 py-4">
                <p class="text-sm text-gray-700">{{ guest.email || '—' }}</p>
                <p class="text-xs text-gray-400">{{ guest.phoneNumber || '' }}</p>
              </td>

              <!-- Identity -->
              <td class="px-5 py-4">
                <p class="text-sm text-gray-700">{{ formatIdentityType(guest.identityType) }}</p>
                <p class="font-mono text-xs text-gray-400">{{ guest.identityNumber || '—' }}</p>
              </td>

              <!-- Nationality -->
              <td class="px-5 py-4 text-sm text-gray-700">{{ guest.nationality || '—' }}</td>

              <!-- Status -->
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="guest.isActive
                    ? 'bg-green-50 text-green-700 ring-green-200'
                    : 'bg-gray-100 text-gray-500 ring-gray-200'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="guest.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ guest.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>

              <!-- Joined -->
              <td class="px-5 py-4 text-sm text-gray-400">{{ formatDate(guest.createdAt) }}</td>

              <!-- Actions -->
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit guest"
                    @click="openEdit(guest)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete guest"
                    @click="openDelete(guest)"
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
      <div v-if="store.totalPages > 1" class="border-t border-gray-100 px-5 py-4">
        <UiPagination
          :page="currentPage"
          :total-pages="store.totalPages"
          :total="store.totalElements"
          :page-size="pageSize"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modals -->
    <GuestsGuestFormModal v-model="showForm" :guest="selectedGuest" @saved="onSaved" />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Guest"
      :message="`Delete '${selectedGuest?.firstName} ${selectedGuest?.lastName}'?`"
      detail="This action cannot be undone."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { GuestResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useGuestsStore()

// ── Filters ──────────────────────────────────────────────────────────────────
const keyword            = ref('')
const filterStatus       = ref('')
const filterIdentityType = ref('')
const currentPage        = ref(0)
const pageSize           = ref(10)

// Debounce search input
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch(keyword, () => {
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => { currentPage.value = 0; loadPage() }, 400)
})

watch([filterStatus, filterIdentityType, pageSize], () => {
  currentPage.value = 0
  loadPage()
})

watch(currentPage, loadPage)

function buildFilter() {
  const q = keyword.value.trim()
  return {
    ...(q ? { firstName: q, lastName: q, email: q, phoneNumber: q } : {}),
    ...(filterStatus.value !== '' ? { isActive: filterStatus.value === 'true' } : {}),
    ...(filterIdentityType.value ? { identityType: filterIdentityType.value } : {}),
  }
}

async function loadPage() {
  await store.fetchPage({ page: currentPage.value, size: pageSize.value, filter: buildFilter() })
}

// ── Modal state ───────────────────────────────────────────────────────────────
const showForm      = ref(false)
const showDelete    = ref(false)
const selectedGuest = ref<GuestResponse | null>(null)

function openCreate() { selectedGuest.value = null; showForm.value = true }
function openEdit(g: GuestResponse) { selectedGuest.value = g; showForm.value = true }
function openDelete(g: GuestResponse) { selectedGuest.value = g; showDelete.value = true }

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
  showToast('success', selectedGuest.value ? 'Guest updated' : 'Guest added successfully')
  loadPage()
}

async function handleDelete() {
  if (!selectedGuest.value) return
  try {
    await store.remove(selectedGuest.value.guestId)
    showDelete.value = false
    showToast('success', `${selectedGuest.value.firstName} ${selectedGuest.value.lastName} deleted`)
    await loadPage()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    showToast('error', e?.data?.message || e?.message || 'Delete failed')
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function initials(g: GuestResponse) {
  return (g.firstName?.charAt(0) || '') + (g.lastName?.charAt(0) || '')
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

function formatIdentityType(type: string | undefined) {
  const map: Record<string, string> = {
    PASSPORT:        'Passport',
    NATIONAL_ID:     'National ID',
    DRIVERS_LICENSE: "Driver's License",
    OTHER:           'Other',
  }
  return type ? (map[type] ?? type) : '—'
}

onMounted(loadPage)
</script>
