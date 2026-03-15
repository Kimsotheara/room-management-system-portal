<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
})

const authStore = useAuthStore()

// Redirect based on auth state
if (authStore.isAuthenticated) {
  navigateTo('/dashboard')
} else {
  navigateTo('/login')
}
</script>

<template>
  <div />
</template>
