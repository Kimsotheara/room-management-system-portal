<template>
  <header class="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4">
    <div class="flex items-center justify-between gap-4">
      <!-- Left: Mobile menu + Breadcrumb -->
      <div class="flex items-center gap-4">
        <button
          class="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
          @click="$emit('toggle-sidebar')"
        >
          <svg class="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <!-- Breadcrumb -->
        <nav class="flex items-center gap-1 text-sm">
          <NuxtLink to="/dashboard" class="text-gray-400 hover:text-gray-600 transition-colors">
            Dashboard
          </NuxtLink>
          <span v-if="currentPageName !== 'Dashboard'" class="text-gray-300">/</span>
          <span v-if="currentPageName !== 'Dashboard'" class="text-gray-700 font-medium">
            {{ currentPageName }}
          </span>
        </nav>
      </div>

      <!-- Right: Actions -->
      <div class="flex items-center gap-3">
        <!-- Notifications -->
        <button class="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <!-- User avatar dropdown -->
        <div class="relative" ref="userMenuRef">
          <button
            class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            @click="userMenuOpen = !userMenuOpen"
          >
            <div class="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-semibold">
              {{ authStore.userInitials }}
            </div>
            <div class="hidden sm:block text-left">
              <p class="text-sm font-medium text-gray-700 leading-tight">{{ authStore.userDisplayName }}</p>
              <p class="text-xs text-gray-400">{{ authStore.user?.roles?.[0] || 'User' }}</p>
            </div>
            <svg class="w-4 h-4 text-gray-400 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          <!-- Dropdown menu -->
          <div
            v-if="userMenuOpen"
            class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50"
          >
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="text-sm font-medium text-gray-900">{{ authStore.userDisplayName }}</p>
              <p class="text-xs text-gray-500 truncate">{{ authStore.user?.email }}</p>
            </div>
            <NuxtLink
              to="/dashboard/settings"
              class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              @click="userMenuOpen = false"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </NuxtLink>
            <NuxtLink
              to="/dashboard/settings"
              class="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              @click="userMenuOpen = false"
            >
              <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings
            </NuxtLink>
            <div class="border-t border-gray-100 mt-1">
              <button
                class="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                @click="handleLogout"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineEmits<{
  'toggle-sidebar': []
}>()

const authStore = useAuthStore()
const route = useRoute()
const userMenuOpen = ref(false)
const userMenuRef = ref<HTMLElement | null>(null)

const pageNames: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/rooms': 'Rooms',
  '/dashboard/bookings': 'Bookings',
  '/dashboard/users': 'Users',
  '/dashboard/reports': 'Reports',
  '/dashboard/settings': 'Settings',
}

const currentPageName = computed(() => {
  return pageNames[route.path] || 'Dashboard'
})

// Close menu on outside click
onMounted(() => {
  document.addEventListener('click', (e) => {
    if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
      userMenuOpen.value = false
    }
  })
})

const handleLogout = async () => {
  userMenuOpen.value = false
  await authStore.logout()
}
</script>
