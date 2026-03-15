<template>
  <div class="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
    <div class="mb-4 flex items-center justify-between">
      <h3 class="text-base font-semibold text-gray-900">Recent Rooms</h3>
      <NuxtLink to="/dashboard/rooms" class="text-xs font-medium text-primary-600 hover:text-primary-700">View all</NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="space-y-4">
      <div v-for="i in 5" :key="i" class="flex items-center gap-3">
        <div class="h-10 w-10 animate-pulse rounded-xl bg-gray-100" />
        <div class="flex-1 space-y-1.5">
          <div class="h-3.5 w-32 animate-pulse rounded bg-gray-100" />
          <div class="h-3 w-20 animate-pulse rounded bg-gray-100" />
        </div>
        <div class="h-5 w-16 animate-pulse rounded-full bg-gray-100" />
      </div>
    </div>

    <!-- Empty -->
    <div v-else-if="!recentRooms.length" class="flex flex-col items-center justify-center py-10 text-center">
      <svg class="mb-2 h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <p class="text-sm text-gray-400">No rooms yet</p>
    </div>

    <!-- List -->
    <div v-else class="space-y-3">
      <div
        v-for="room in recentRooms"
        :key="room.roomId"
        class="flex items-center gap-3"
      >
        <!-- Cover image or placeholder -->
        <div class="h-10 w-10 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
          <img
            v-if="room.images?.length"
            :src="`data:image/jpeg;base64,${room.images[0].imageData}`"
            :alt="`Room ${room.roomNumber}`"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <svg class="h-5 w-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-gray-800">
            {{ room.roomNumber ? `Room ${room.roomNumber}` : `Room #${room.roomId}` }}
          </p>
          <p class="truncate text-xs text-gray-400">
            {{ room.roomType?.typeName ?? '—' }} · {{ formatDate(room.createdAt) }}
          </p>
        </div>

        <!-- Status badge -->
        <RoomsRoomStatusBadge :status="room.roomStatus" class="flex-shrink-0" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const roomsStore = useRoomsStore()

const loading = computed(() => roomsStore.loading)

const recentRooms = computed(() =>
  [...roomsStore.items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6)
)

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
</script>
