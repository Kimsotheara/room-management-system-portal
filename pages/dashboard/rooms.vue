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
        <h1 class="text-2xl font-bold text-gray-900">Rooms</h1>
        <p class="mt-1 text-sm text-gray-500">{{ filteredRooms.length }} of {{ store.items.length }} rooms</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Room
      </button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center">
      <div class="relative min-w-48 flex-1">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search by room number…"
          class="block w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        v-model="statusFilter"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Status</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select
        v-model="activeFilter"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Rooms</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <!-- Empty -->
    <div v-else-if="!filteredRooms.length" class="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white py-20 text-center shadow-sm">
      <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
        <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p class="text-sm font-medium text-gray-900">No rooms found</p>
      <p class="mt-1 text-sm text-gray-500">
        {{ search || statusFilter || activeFilter ? 'Try adjusting your search or filters' : 'No rooms available' }}
      </p>
    </div>

    <!-- Rooms grid -->
    <div v-else class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      <div
        v-for="room in filteredRooms"
        :key="room.roomId"
        class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
        :class="!room.isActive ? 'opacity-60' : ''"
      >
        <!-- Cover image / placeholder -->
        <div class="relative h-48 cursor-pointer" @click="openImages(room)">
          <template v-if="room.images?.length">
            <RoomsRoomImage
              :room-id="room.roomId"
              :image-id="room.images[0].imageId"
              :alt="`Room ${room.roomNumber}`"
              class="transition hover:brightness-90"
            />
            <!-- Image count badge -->
            <span
              v-if="room.images.length > 1"
              class="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white backdrop-blur-sm"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {{ room.images.length }}
            </span>
          </template>
          <template v-else>
            <!-- No image placeholder -->
            <div class="flex h-full flex-col items-center justify-center gap-2 bg-gray-100 text-gray-300 transition hover:text-gray-400">
              <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span class="text-xs">Click to add photos</span>
            </div>
          </template>

          <!-- Status badge overlay -->
          <div class="absolute left-3 top-3 backdrop-blur-sm">
            <RoomsRoomStatusBadge :status="room.roomStatus" overlay />
          </div>
        </div>

        <!-- Card body -->
        <div class="p-4">
          <div class="mb-3 flex items-start justify-between gap-2">
            <div>
              <h3 class="font-semibold text-gray-900">Room {{ room.roomNumber }}</h3>
              <p class="text-sm text-gray-500">{{ room.roomType?.typeName || '—' }}</p>
            </div>
            <span
              v-if="!room.isActive"
              class="flex-shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500 ring-1 ring-inset ring-gray-200"
            >
              Inactive
            </span>
          </div>

          <!-- Room type details -->
          <div class="mb-4 grid grid-cols-2 gap-2 text-sm">
            <div class="flex items-center gap-1.5 text-gray-600">
              <svg class="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
              </svg>
              <span>{{ room.roomType?.bed ?? '—' }} bed{{ room.roomType?.bed !== 1 ? 's' : '' }}</span>
            </div>
            <div class="flex items-center gap-1.5 text-gray-600">
              <svg class="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{{ room.roomType?.price != null ? formatPrice(room.roomType.price) : '—' }}</span>
            </div>
          </div>

          <!-- Action buttons -->
          <div class="flex gap-2">
            <!-- Edit -->
            <button
              class="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
              @click="openEdit(room)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <!-- Photos -->
            <button
              class="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
              title="Manage photos"
              @click="openImages(room)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <!-- Count dot -->
              <span
                v-if="room.images?.length"
                class="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary-600 text-[10px] font-bold text-white"
              >
                {{ room.images.length > 9 ? '9+' : room.images.length }}
              </span>
            </button>
            <!-- Delete -->
            <button
              class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-gray-200 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
              title="Delete room"
              @click="openDelete(room)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <RoomsRoomFormModal v-model="showForm" :room="selectedRoom" @saved="onSaved" />

    <RoomsRoomImageModal
      v-model="showImages"
      :room="imageRoom"
      @updated="onImagesUpdated"
    />

    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Room"
      :message="`Delete Room '${selectedRoom?.roomNumber}'?`"
      detail="This action cannot be undone."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { RoomResponse } from '~/types/api'
import { useRoomStatus } from '~/composables/useRoomStatus'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useRoomsStore()
const { statusOptions } = useRoomStatus()

// Filters
const search       = ref('')
const statusFilter = ref('')
const activeFilter = ref('')

const filteredRooms = computed(() => {
  return store.items.filter((room) => {
    const matchSearch = !search.value ||
      room.roomNumber.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value ||
      room.roomStatus?.toUpperCase() === statusFilter.value
    const matchActive = !activeFilter.value ||
      String(room.isActive) === activeFilter.value
    return matchSearch && matchStatus && matchActive
  })
})

// Modal state
const showForm    = ref(false)
const showImages  = ref(false)
const showDelete  = ref(false)
const selectedRoom = ref<RoomResponse | null>(null)
const imageRoom    = ref<RoomResponse | null>(null)

function openCreate() { selectedRoom.value = null; showForm.value = true }
function openEdit(room: RoomResponse) { selectedRoom.value = room; showForm.value = true }
function openDelete(room: RoomResponse) { selectedRoom.value = room; showDelete.value = true }
function openImages(room: RoomResponse) { imageRoom.value = room; showImages.value = true }

async function onSaved() {
  showToast('success', selectedRoom.value ? 'Room updated' : 'Room created successfully')
  await store.fetchAll()
}

async function onImagesUpdated() {
  await store.fetchAll()
  // keep modal open with refreshed data
  if (imageRoom.value) {
    imageRoom.value = store.items.find(r => r.roomId === imageRoom.value!.roomId) ?? imageRoom.value
  }
}

async function handleDelete() {
  if (!selectedRoom.value) return
  try {
    await store.remove(selectedRoom.value.roomId)
    showDelete.value = false
    showToast('success', `Room ${selectedRoom.value.roomNumber} deleted`)
    await store.fetchAll()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    showToast('error', e?.data?.message || e?.message || 'Delete failed')
  }
}

// Toast
const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(type: 'success' | 'error', message: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { type, message }
  toastTimer = setTimeout(() => { toast.value = null }, 3500)
}

// Helpers
function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}

onMounted(() => store.fetchAll())
</script>
