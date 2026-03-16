<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">
          Welcome back, <span class="font-medium text-gray-700">{{ authStore.userDisplayName }}</span>! Here's what's happening today.
        </p>
      </div>
      <span class="text-sm text-gray-400">{{ currentDate }}</span>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <!-- Total Rooms -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500">Total Rooms</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              <span v-if="loading" class="inline-block h-7 w-12 animate-pulse rounded-lg bg-gray-200" />
              <span v-else>{{ roomsStore.items.length }}</span>
            </p>
            <p class="mt-1 text-xs text-gray-400">{{ activeRooms }} active</p>
          </div>
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-blue-50">
            <svg class="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Available -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500">Available Now</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              <span v-if="loading" class="inline-block h-7 w-12 animate-pulse rounded-lg bg-gray-200" />
              <span v-else>{{ availableRooms }}</span>
            </p>
            <p class="mt-1 text-xs text-gray-400">{{ occupiedRooms }} occupied · {{ bookingRooms }} booking · {{ maintenanceRooms }} maintenance</p>
          </div>
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-green-50">
            <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Room Types -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500">Room Types</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              <span v-if="loading" class="inline-block h-7 w-12 animate-pulse rounded-lg bg-gray-200" />
              <span v-else>{{ roomTypesStore.items.length }}</span>
            </p>
            <p class="mt-1 text-xs text-gray-400">
              <span v-if="!loading && cheapestType">from {{ formatPrice(cheapestType.price) }}/night</span>
              <span v-else-if="loading" class="inline-block h-3 w-20 animate-pulse rounded bg-gray-200" />
            </p>
          </div>
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-purple-50">
            <svg class="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
            </svg>
          </div>
        </div>
      </div>

      <!-- Active Users -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
        <div class="flex items-start justify-between">
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-500">Active Users</p>
            <p class="mt-1 text-2xl font-bold text-gray-900">
              <span v-if="loading" class="inline-block h-7 w-12 animate-pulse rounded-lg bg-gray-200" />
              <span v-else>{{ activeUserCount }}</span>
            </p>
            <p class="mt-1 text-xs text-gray-400">system accounts</p>
          </div>
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <svg class="h-6 w-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">

      <!-- Recent rooms — 2 cols -->
      <div class="lg:col-span-2">
        <DashboardActivityFeed />
      </div>

      <!-- Room availability — 1 col -->
      <div class="lg:col-span-1">
        <DashboardQuickBooking />
      </div>
    </div>

    <!-- Bottom row -->
    <div class="grid grid-cols-1 gap-4 md:grid-cols-3">

      <!-- Room status breakdown -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-base font-semibold text-gray-900">Room Status</h3>
        <div v-if="loading" class="space-y-4">
          <div v-for="i in 3" :key="i" class="h-8 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div v-else-if="!roomsStore.items.length" class="py-4 text-center text-sm text-gray-400">No rooms yet</div>
        <div v-else class="space-y-4">
          <div v-for="s in statusBreakdown" :key="s.label">
            <div class="mb-1 flex items-center justify-between text-sm">
              <span class="flex items-center gap-2">
                <span class="h-2 w-2 rounded-full" :class="s.dot" />
                <span class="text-gray-700">{{ s.label }}</span>
              </span>
              <span class="font-medium text-gray-900">{{ s.count }}</span>
            </div>
            <div class="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                class="h-full rounded-full transition-all duration-700"
                :class="s.bar"
                :style="{ width: roomsStore.items.length ? `${(s.count / roomsStore.items.length) * 100}%` : '0%' }"
              />
            </div>
          </div>
          <p class="pt-1 text-right text-xs text-gray-400">
            {{ roomsStore.items.length > 0 ? Math.round((availableRooms / roomsStore.items.length) * 100) : 0 }}% availability rate
          </p>
        </div>
      </div>

      <!-- Room types summary -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-base font-semibold text-gray-900">Room Types</h3>
          <NuxtLink to="/dashboard/room-types" class="text-xs font-medium text-primary-600 hover:text-primary-700">View all</NuxtLink>
        </div>
        <div v-if="loading" class="space-y-3">
          <div v-for="i in 4" :key="i" class="h-10 animate-pulse rounded-lg bg-gray-100" />
        </div>
        <div v-else-if="!roomTypesStore.items.length" class="py-4 text-center text-sm text-gray-400">No room types yet</div>
        <div v-else class="space-y-2">
          <div
            v-for="rt in roomTypesStore.items.slice(0, 5)"
            :key="rt.roomTypeId"
            class="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2"
          >
            <div>
              <p class="text-sm font-medium text-gray-800">{{ rt.typeName }}</p>
              <p class="text-xs text-gray-400">{{ rt.bed }} bed{{ rt.bed !== 1 ? 's' : '' }}</p>
            </div>
            <span class="text-sm font-semibold text-primary-600">{{ formatPrice(rt.price) }}</span>
          </div>
          <p v-if="roomTypesStore.items.length > 5" class="pt-1 text-center text-xs text-gray-400">
            +{{ roomTypesStore.items.length - 5 }} more
          </p>
        </div>
      </div>

      <!-- Your account -->
      <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h3 class="mb-4 text-base font-semibold text-gray-900">Your Account</h3>
        <div class="mb-4 flex items-center gap-3">
          <div class="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-lg font-semibold text-white">
            {{ authStore.userInitials }}
          </div>
          <div class="min-w-0">
            <p class="truncate font-medium text-gray-900">{{ authStore.userDisplayName }}</p>
            <p class="truncate text-sm text-gray-500">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <div class="space-y-2.5">
          <div class="flex items-start justify-between text-sm">
            <span class="text-gray-500">Roles</span>
            <div class="flex flex-wrap justify-end gap-1">
              <span
                v-for="role in authStore.user?.roles"
                :key="role"
                class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
              >{{ role }}</span>
              <span v-if="!authStore.user?.roles?.length" class="text-gray-400">—</span>
            </div>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Status</span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-200">
              <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
              Active
            </span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-500">Permissions</span>
            <span class="font-medium text-gray-700">{{ authStore.user?.permissionCodes?.length || 0 }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RoomStatus } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const authStore      = useAuthStore()
const roomsStore     = useRoomsStore()
const roomTypesStore = useRoomTypesStore()

const loading        = ref(true)
const activeUserCount = ref(0)

// ── Computed stats ───────────────────────────────────────────────────────────
const byStatus = (s: RoomStatus) => computed(() =>
  roomsStore.items.filter(r => r.roomStatus?.toUpperCase() === s).length
)

const availableRooms   = byStatus(RoomStatus.AVAILABLE)
const bookingRooms     = byStatus(RoomStatus.BOOKING)
const occupiedRooms    = byStatus(RoomStatus.OCCUPIED)
const maintenanceRooms = byStatus(RoomStatus.MAINTENANCE)
const cleaningRooms    = byStatus(RoomStatus.CLEANING)
const activeRooms      = computed(() => roomsStore.items.filter(r => r.isActive).length)
const cheapestType     = computed(() => [...roomTypesStore.items].sort((a, b) => a.price - b.price)[0] ?? null)

const statusBreakdown = computed(() => [
  { label: 'Available',   count: availableRooms.value,   dot: 'bg-green-500',  bar: 'bg-green-500' },
  { label: 'Booking',     count: bookingRooms.value,     dot: 'bg-blue-500',   bar: 'bg-blue-500' },
  { label: 'Occupied',    count: occupiedRooms.value,    dot: 'bg-red-500',    bar: 'bg-red-500' },
  { label: 'Maintenance', count: maintenanceRooms.value, dot: 'bg-amber-500',  bar: 'bg-amber-500' },
  { label: 'Cleaning',    count: cleaningRooms.value,    dot: 'bg-purple-500', bar: 'bg-purple-500' },
])

// ── Fetch ────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const { apiFetch } = useApi()
  await Promise.all([
    roomsStore.fetchAll(),
    roomTypesStore.fetchAll(),
    // fetch active user count via filter endpoint (size=1 for minimal payload)
    apiFetch('/api/users/list/filter', {
      method: 'POST',
      body: { pageNumber: 1, size: 1, parameter: { isActive: true } },
    }).then((res: any) => {
      activeUserCount.value = res?.data?.totalElements ?? 0
    }).catch(() => {}),
  ])
  loading.value = false
})

// ── Helpers ──────────────────────────────────────────────────────────────────
const currentDate = computed(() =>
  new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
)

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(price)
}
</script>
