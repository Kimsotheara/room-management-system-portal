<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Rooms</h1>
        <p class="text-sm text-gray-500 mt-1">Manage all rooms and their availability</p>
      </div>
      <button class="btn-primary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Room
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4 flex flex-wrap gap-3 items-center">
      <div class="relative flex-1 min-w-48">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="search"
          type="text"
          placeholder="Search rooms..."
          class="input-field pl-9"
        />
      </div>
      <select v-model="statusFilter" class="input-field w-auto">
        <option value="">All Status</option>
        <option value="available">Available</option>
        <option value="occupied">Occupied</option>
        <option value="maintenance">Maintenance</option>
      </select>
      <select v-model="capacityFilter" class="input-field w-auto">
        <option value="">All Capacities</option>
        <option value="small">Small (1-10)</option>
        <option value="medium">Medium (11-20)</option>
        <option value="large">Large (21+)</option>
      </select>
    </div>

    <!-- Rooms grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="card p-5 hover:shadow-md transition-shadow duration-200"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="font-semibold text-gray-900">{{ room.name }}</h3>
            <p class="text-sm text-gray-500">Floor {{ room.floor }}</p>
          </div>
          <span
            class="badge"
            :class="{
              'badge-success': room.status === 'available',
              'badge-danger': room.status === 'occupied',
              'badge-warning': room.status === 'maintenance',
            }"
          >
            {{ room.status }}
          </span>
        </div>

        <div class="grid grid-cols-2 gap-3 text-sm mb-4">
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {{ room.capacity }} people
          </div>
          <div class="flex items-center gap-2 text-gray-600">
            <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            {{ room.type }}
          </div>
        </div>

        <!-- Amenities -->
        <div class="flex flex-wrap gap-1.5 mb-4">
          <span
            v-for="amenity in room.amenities"
            :key="amenity"
            class="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
          >{{ amenity }}</span>
        </div>

        <div class="flex gap-2">
          <button
            class="btn-primary flex-1 py-1.5 text-sm"
            :disabled="room.status !== 'available'"
          >
            Book Now
          </button>
          <button class="btn-secondary py-1.5 px-3">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const search = ref('')
const statusFilter = ref('')
const capacityFilter = ref('')

const rooms = [
  { id: 1, name: 'Conference Room A', floor: 1, status: 'available', capacity: 20, type: 'Conference', amenities: ['Projector', 'Whiteboard', 'AC'] },
  { id: 2, name: 'Meeting Room 101', floor: 1, status: 'occupied', capacity: 8, type: 'Meeting', amenities: ['TV Screen', 'AC'] },
  { id: 3, name: 'Board Room', floor: 5, status: 'available', capacity: 15, type: 'Board', amenities: ['Projector', 'Video Call', 'AC', 'Catering'] },
  { id: 4, name: 'Training Room 205', floor: 2, status: 'maintenance', capacity: 30, type: 'Training', amenities: ['Projector', 'Whiteboard', 'AC', 'Sound System'] },
  { id: 5, name: 'Executive Suite', floor: 6, status: 'occupied', capacity: 10, type: 'Executive', amenities: ['TV Screen', 'Video Call', 'AC', 'Catering', 'Bar'] },
  { id: 6, name: 'Collaboration Hub', floor: 3, status: 'available', capacity: 12, type: 'Collaboration', amenities: ['Whiteboard', 'TV Screen', 'Standing Desks'] },
  { id: 7, name: 'Innovation Lab', floor: 4, status: 'available', capacity: 25, type: 'Workshop', amenities: ['Projector', 'Whiteboard', 'Maker Space'] },
  { id: 8, name: 'Quiet Zone A', floor: 2, status: 'available', capacity: 4, type: 'Focus', amenities: ['Noise Canceling', 'AC'] },
  { id: 9, name: 'Presentation Hall', floor: 1, status: 'available', capacity: 50, type: 'Hall', amenities: ['Stage', 'Sound System', 'Projector', 'AC'] },
]

const filteredRooms = computed(() => {
  return rooms.filter((room) => {
    const matchSearch = !search.value || room.name.toLowerCase().includes(search.value.toLowerCase())
    const matchStatus = !statusFilter.value || room.status === statusFilter.value
    const matchCapacity = !capacityFilter.value || (
      capacityFilter.value === 'small' ? room.capacity <= 10 :
      capacityFilter.value === 'medium' ? room.capacity > 10 && room.capacity <= 20 :
      room.capacity > 20
    )
    return matchSearch && matchStatus && matchCapacity
  })
})
</script>
