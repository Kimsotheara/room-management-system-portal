<template>
  <div class="min-h-screen bg-gray-50 flex">
    <!-- Sidebar -->
    <LayoutSidebar :is-open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0 lg:ml-64">
      <!-- Top navbar -->
      <LayoutNavbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />

      <!-- Page content -->
      <main class="flex-1 p-6 animate-fade-in">
        <slot />
      </main>
    </div>

    <!-- Mobile sidebar overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-black/50 z-20 lg:hidden"
      @click="sidebarOpen = false"
    />
  </div>
</template>

<script setup lang="ts">
const sidebarOpen = ref(false)
</script>
