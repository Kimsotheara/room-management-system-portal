<template>
  <div class="card p-6">
    <h3 class="text-base font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div class="space-y-4">
      <div
        v-for="(item, index) in activities"
        :key="index"
        class="flex items-start gap-3"
      >
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-sm"
          :class="item.iconBg"
        >
          <span v-html="item.icon" :class="item.iconColor" class="w-4 h-4" />
        </div>
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-800">
            <span class="font-medium">{{ item.user }}</span>
            {{ item.action }}
            <span class="font-medium text-primary-600">{{ item.target }}</span>
          </p>
          <p class="text-xs text-gray-400 mt-0.5">{{ item.time }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activities = [
  {
    user: 'Admin',
    action: 'booked',
    target: 'Conference Room A',
    time: '2 minutes ago',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
  },
  {
    user: 'John Doe',
    action: 'checked in to',
    target: 'Meeting Room 101',
    time: '15 minutes ago',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    iconBg: 'bg-green-100',
    iconColor: 'text-green-600',
  },
  {
    user: 'Jane Smith',
    action: 'cancelled booking for',
    target: 'Board Room',
    time: '1 hour ago',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>',
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
  },
  {
    user: 'System',
    action: 'added new room',
    target: 'Training Room 205',
    time: '3 hours ago',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>',
    iconBg: 'bg-purple-100',
    iconColor: 'text-purple-600',
  },
  {
    user: 'Mike Johnson',
    action: 'updated details for',
    target: 'Executive Suite',
    time: '5 hours ago',
    icon: '<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>',
    iconBg: 'bg-yellow-100',
    iconColor: 'text-yellow-600',
  },
]
</script>
