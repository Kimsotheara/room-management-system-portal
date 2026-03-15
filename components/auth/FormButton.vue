<template>
  <button
    :type="type"
    :disabled="loading || disabled"
    class="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 active:bg-primary-800 disabled:cursor-not-allowed disabled:opacity-60 sm:py-3"
  >
    <!-- Spinner -->
    <svg
      v-if="loading"
      class="h-4 w-4 animate-spin text-white/80"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>

    <!-- Leading icon (when not loading) -->
    <span v-else-if="$slots.icon" class="flex items-center">
      <slot name="icon" />
    </span>

    <span>{{ loading ? loadingLabel : label }}</span>
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string
  loadingLabel?: string
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button' | 'reset'
}>(), {
  loadingLabel: 'Please wait...',
  loading: false,
  disabled: false,
  type: 'submit',
})
</script>
