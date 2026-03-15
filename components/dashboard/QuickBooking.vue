<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-900">Room Availability</h3>
      <NuxtLink to="/dashboard/rooms" class="text-xs font-medium text-primary-600 hover:text-primary-700">View all</NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-3">
      <div v-for="i in 5" :key="i" class="h-12 animate-pulse rounded-xl bg-gray-100" />
    </div>

    <!-- Empty -->
    <div v-else-if="!displayRooms.length" class="flex flex-col items-center justify-center py-10 text-center">
      <svg class="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-sm text-gray-400">No rooms yet</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-2.5">
      <div
        v-for="room in displayRooms"
        :key="room.roomId"
        class="flex items-center justify-between rounded-xl border border-gray-100 px-3 py-2.5 transition-colors hover:border-gray-200"
      >
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-800">
            {{ room.roomNumber ? `Room ${room.roomNumber}` : `Room #${room.roomId}` }}
          </p>
          <p class="truncate text-xs text-gray-400">{{ room.roomType?.typeName ?? '—' }}</p>
        </div>
        <RoomsRoomStatusBadge :status="room.roomStatus" class="ml-2 flex-shrink-0" />
      </div>

      <!-- More rooms hint -->
      <p v-if="roomsStore.items.length > 5" class="pt-1 text-center text-xs text-gray-400">
        +{{ roomsStore.items.length - 5 }} more rooms
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { RoomStatus } from '~/types/api'

const roomsStore = useRoomsStore()

const loading = computed(() => roomsStore.loading)

// Show available rooms first, then others — limit to 5
const displayRooms = computed(() => {
  const available = roomsStore.items.filter(r => r.roomStatus?.toUpperCase() === RoomStatus.AVAILABLE)
  const others    = roomsStore.items.filter(r => r.roomStatus?.toUpperCase() !== RoomStatus.AVAILABLE)
  return [...available, ...others].slice(0, 5)
})
</script>
