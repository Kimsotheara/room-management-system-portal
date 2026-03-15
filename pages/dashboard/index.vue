<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex items-start justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-sm text-gray-500 mt-1">
          Welcome back, <span class="font-medium text-gray-700">{{ authStore.userDisplayName }}</span>! Here's what's happening today.
        </p>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-sm text-gray-400">{{ currentDate }}</span>
        <button class="btn-primary">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          New Booking
        </button>
      </div>
    </div>

    <!-- Stats grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <DashboardStatsCard
        title="Total Rooms"
        :value="stats.totalRooms"
        :change="8"
        icon='<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
        icon-bg="bg-blue-50"
        icon-color="text-blue-600"
      />
      <DashboardStatsCard
        title="Available Now"
        :value="stats.available"
        subtitle="3 rooms occupied"
        icon='<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>'
        icon-bg="bg-green-50"
        icon-color="text-green-600"
      />
      <DashboardStatsCard
        title="Today's Bookings"
        :value="stats.todayBookings"
        :change="12"
        icon='<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>'
        icon-bg="bg-purple-50"
        icon-color="text-purple-600"
      />
      <DashboardStatsCard
        title="Active Users"
        :value="stats.activeUsers"
        :change="-3"
        icon='<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>'
        icon-bg="bg-orange-50"
        icon-color="text-orange-600"
      />
    </div>

    <!-- Main content grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Activity feed - takes 2 cols -->
      <div class="lg:col-span-2">
        <DashboardActivityFeed />
      </div>

      <!-- Room availability -->
      <div class="lg:col-span-1">
        <DashboardQuickBooking />
      </div>
    </div>

    <!-- Quick stats row -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Booking trend -->
      <div class="card p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-1">This Week</h3>
        <p class="text-3xl font-bold text-primary-600">87%</p>
        <p class="text-sm text-gray-500 mt-1">Room utilization rate</p>
        <div class="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden">
          <div class="h-full bg-primary-600 rounded-full" style="width: 87%" />
        </div>
      </div>

      <!-- Peak hours -->
      <div class="card p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-3">Peak Hours</h3>
        <div class="space-y-2">
          <div v-for="hour in peakHours" :key="hour.time" class="flex items-center gap-3">
            <span class="text-xs text-gray-500 w-16">{{ hour.time }}</span>
            <div class="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full"
                :class="hour.value > 80 ? 'bg-red-400' : hour.value > 50 ? 'bg-yellow-400' : 'bg-green-400'"
                :style="{ width: `${hour.value}%` }"
              />
            </div>
            <span class="text-xs text-gray-400 w-8 text-right">{{ hour.value }}%</span>
          </div>
        </div>
      </div>

      <!-- User info card -->
      <div class="card p-6">
        <h3 class="text-base font-semibold text-gray-900 mb-3">Your Account</h3>
        <div class="flex items-center gap-3 mb-4">
          <div class="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold text-lg">
            {{ authStore.userInitials }}
          </div>
          <div>
            <p class="font-medium text-gray-900">{{ authStore.userDisplayName }}</p>
            <p class="text-sm text-gray-500">{{ authStore.user?.email }}</p>
          </div>
        </div>
        <div class="space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Roles</span>
            <div class="flex gap-1 flex-wrap justify-end">
              <span
                v-for="role in authStore.user?.roles"
                :key="role"
                class="badge badge-info"
              >{{ role }}</span>
            </div>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Status</span>
            <span class="badge badge-success">Active</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Permissions</span>
            <span class="text-gray-700 font-medium">{{ authStore.user?.permissionCodes?.length || 0 }}</span>
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

const authStore = useAuthStore()

const stats = reactive({
  totalRooms: 24,
  available: 21,
  todayBookings: 38,
  activeUsers: 156,
})

const peakHours = [
  { time: '9:00 AM', value: 95 },
  { time: '11:00 AM', value: 85 },
  { time: '2:00 PM', value: 70 },
  { time: '4:00 PM', value: 45 },
  { time: '6:00 PM', value: 20 },
]

const currentDate = computed(() => {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
})
</script>
