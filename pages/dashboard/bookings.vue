<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Bookings</h1>
        <p class="text-sm text-gray-500 mt-1">Manage room reservations and schedules</p>
      </div>
      <button class="btn-primary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        New Booking
      </button>
    </div>

    <!-- Tabs -->
    <div class="border-b border-gray-200">
      <nav class="flex gap-6">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="py-3 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.value
            ? 'border-primary-500 text-primary-600'
            : 'border-transparent text-gray-500 hover:text-gray-700'"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span
            v-if="tab.count"
            class="ml-2 px-2 py-0.5 rounded-full text-xs"
            :class="activeTab === tab.value ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'"
          >{{ tab.count }}</span>
        </button>
      </nav>
    </div>

    <!-- Bookings table -->
    <div class="card overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-100 bg-gray-50">
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Room</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Booked By</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Duration</th>
            <th class="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
            <th class="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr
            v-for="booking in filteredBookings"
            :key="booking.id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="py-3.5 px-4">
              <p class="font-medium text-gray-900 text-sm">{{ booking.room }}</p>
              <p class="text-xs text-gray-400">Floor {{ booking.floor }}</p>
            </td>
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <div class="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-semibold">
                  {{ booking.user.split(' ').map((n: string) => n[0]).join('') }}
                </div>
                <span class="text-sm text-gray-700">{{ booking.user }}</span>
              </div>
            </td>
            <td class="py-3.5 px-4">
              <p class="text-sm text-gray-700">{{ booking.date }}</p>
              <p class="text-xs text-gray-400">{{ booking.time }}</p>
            </td>
            <td class="py-3.5 px-4 text-sm text-gray-600">{{ booking.duration }}</td>
            <td class="py-3.5 px-4">
              <span
                class="badge"
                :class="{
                  'badge-success': booking.status === 'confirmed',
                  'badge-info': booking.status === 'pending',
                  'badge-danger': booking.status === 'cancelled',
                  'badge-warning': booking.status === 'in-progress',
                }"
              >
                {{ booking.status }}
              </span>
            </td>
            <td class="py-3.5 px-4">
              <div class="flex justify-end gap-2">
                <button class="text-xs text-primary-600 hover:text-primary-700 font-medium">View</button>
                <button
                  v-if="booking.status !== 'cancelled'"
                  class="text-xs text-red-500 hover:text-red-600 font-medium"
                >Cancel</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const activeTab = ref('all')

const tabs = [
  { label: 'All Bookings', value: 'all', count: 38 },
  { label: 'Today', value: 'today', count: 12 },
  { label: 'Upcoming', value: 'upcoming', count: 24 },
  { label: 'Cancelled', value: 'cancelled', count: 2 },
]

const bookings = [
  { id: 1, room: 'Conference Room A', floor: 1, user: 'John Doe', date: 'Mar 9, 2026', time: '9:00 AM - 11:00 AM', duration: '2 hours', status: 'confirmed' },
  { id: 2, room: 'Board Room', floor: 5, user: 'Sarah Johnson', date: 'Mar 9, 2026', time: '11:00 AM - 12:00 PM', duration: '1 hour', status: 'in-progress' },
  { id: 3, room: 'Meeting Room 101', floor: 1, user: 'Mike Wilson', date: 'Mar 9, 2026', time: '2:00 PM - 4:00 PM', duration: '2 hours', status: 'pending' },
  { id: 4, room: 'Training Room 205', floor: 2, user: 'Emma Davis', date: 'Mar 10, 2026', time: '9:00 AM - 5:00 PM', duration: '8 hours', status: 'confirmed' },
  { id: 5, room: 'Executive Suite', floor: 6, user: 'Robert Brown', date: 'Mar 10, 2026', time: '10:00 AM - 12:00 PM', duration: '2 hours', status: 'confirmed' },
  { id: 6, room: 'Innovation Lab', floor: 4, user: 'Lisa Chen', date: 'Mar 11, 2026', time: '1:00 PM - 3:00 PM', duration: '2 hours', status: 'cancelled' },
]

const filteredBookings = computed(() => {
  if (activeTab.value === 'all') return bookings
  if (activeTab.value === 'cancelled') return bookings.filter(b => b.status === 'cancelled')
  return bookings.filter(b => b.status !== 'cancelled')
})
</script>
