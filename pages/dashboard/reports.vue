<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Reports</h1>
        <p class="text-sm text-gray-500 mt-1">Analytics and usage statistics</p>
      </div>
      <button class="btn-secondary">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Export Report
      </button>
    </div>

    <!-- Summary stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div v-for="stat in summaryStats" :key="stat.label" class="card p-5">
        <p class="text-sm text-gray-500">{{ stat.label }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ stat.value }}</p>
        <p class="text-xs mt-1" :class="stat.changePositive ? 'text-green-600' : 'text-red-600'">
          {{ stat.changePositive ? '↑' : '↓' }} {{ stat.change }} from last period
        </p>
      </div>
    </div>

    <!-- Charts placeholder -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div class="card p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Bookings Over Time</h3>
        <div class="h-48 flex items-end gap-2">
          <div
            v-for="(bar, i) in chartData"
            :key="i"
            class="flex-1 flex flex-col items-center gap-1"
          >
            <div
              class="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
              :style="{ height: `${bar.value}%` }"
            />
            <span class="text-xs text-gray-400">{{ bar.label }}</span>
          </div>
        </div>
      </div>

      <div class="card p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-4">Room Utilization</h3>
        <div class="space-y-3">
          <div v-for="room in roomUtilization" :key="room.name">
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-700 font-medium">{{ room.name }}</span>
              <span class="text-gray-500">{{ room.percent }}%</span>
            </div>
            <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all"
                :class="room.percent > 80 ? 'bg-red-400' : room.percent > 60 ? 'bg-yellow-400' : 'bg-green-400'"
                :style="{ width: `${room.percent}%` }"
              />
            </div>
          </div>
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

const summaryStats = [
  { label: 'Total Bookings', value: '1,248', change: '12%', changePositive: true },
  { label: 'Avg Utilization', value: '73%', change: '5%', changePositive: true },
  { label: 'Cancellations', value: '48', change: '3%', changePositive: false },
  { label: 'Revenue', value: '$24,680', change: '18%', changePositive: true },
]

const chartData = [
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 85 },
  { label: 'Wed', value: 90 },
  { label: 'Thu', value: 75 },
  { label: 'Fri', value: 95 },
  { label: 'Sat', value: 40 },
  { label: 'Sun', value: 25 },
]

const roomUtilization = [
  { name: 'Conference Room A', percent: 92 },
  { name: 'Board Room', percent: 78 },
  { name: 'Meeting Room 101', percent: 65 },
  { name: 'Training Room 205', percent: 45 },
  { name: 'Executive Suite', percent: 38 },
]
</script>
