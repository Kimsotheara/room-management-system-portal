<template>
  <div class="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="text-8xl font-bold text-primary-200 mb-4">{{ error?.statusCode }}</div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">
        {{ error?.statusCode === 404 ? 'Page Not Found' : 'Something went wrong' }}
      </h1>
      <p class="text-gray-500 mb-6">
        {{ error?.statusCode === 404
          ? "The page you're looking for doesn't exist."
          : error?.message || 'An unexpected error occurred.' }}
      </p>
      <button class="btn-primary" @click="handleError">
        Go to Dashboard
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  error: {
    statusCode: number
    message?: string
  }
}>()

const handleError = () => {
  clearError({ redirect: '/dashboard' })
}
</script>
