<template>
  <div class="card p-6">
    <h3 class="text-base font-semibold text-gray-900 mb-4">Room Availability</h3>
    <div class="space-y-3">
      <div
        v-for="room in rooms"
        :key="room.id"
        class="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-2.5 h-2.5 rounded-full flex-shrink-0"
            :class="room.available ? 'bg-green-400' : 'bg-red-400'"
          />
          <div>
            <p class="text-sm font-medium text-gray-800">{{ room.name }}</p>
            <p class="text-xs text-gray-400">Capacity: {{ room.capacity }} people</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <span
            class="badge"
            :class="room.available ? 'badge-success' : 'badge-danger'"
          >
            {{ room.available ? 'Available' : 'Occupied' }}
          </span>
          <button
            v-if="room.available"
            class="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Book
          </button>
        </div>
      </div>
    </div>
    <NuxtLink
      to="/dashboard/rooms"
      class="flex items-center justify-center gap-2 mt-4 text-sm text-primary-600 hover:text-primary-700 font-medium"
    >
      View all rooms
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
      </svg>
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
const rooms = [
  { id: 1, name: 'Conference Room A', capacity: 20, available: true },
  { id: 2, name: 'Meeting Room 101', capacity: 8, available: false },
  { id: 3, name: 'Board Room', capacity: 15, available: true },
  { id: 4, name: 'Training Room 205', capacity: 30, available: true },
  { id: 5, name: 'Executive Suite', capacity: 10, available: false },
]
</script>
