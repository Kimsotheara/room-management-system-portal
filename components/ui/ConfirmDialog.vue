<template>
  <UiModal
    :model-value="modelValue"
    :title="title"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="flex gap-4">
      <div
        class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
        :class="variant === 'danger' ? 'bg-red-100' : 'bg-yellow-100'"
      >
        <svg
          class="h-5 w-5"
          :class="variant === 'danger' ? 'text-red-600' : 'text-yellow-600'"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <div>
        <p class="text-sm font-medium text-gray-900">{{ message }}</p>
        <p v-if="detail" class="mt-1 text-sm text-gray-500">{{ detail }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="loading"
        class="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        :class="variant === 'danger'
          ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
          : 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400'"
        @click="emit('confirm')"
      >
        <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ confirmLabel }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  modelValue: boolean
  title: string
  message: string
  detail?: string
  confirmLabel?: string
  variant?: 'danger' | 'warning'
  loading?: boolean
}>(), {
  confirmLabel: 'Delete',
  variant: 'danger',
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()
</script>
