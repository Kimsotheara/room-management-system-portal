<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-1 scale-95"
    enter-to-class="opacity-100 translate-y-0 scale-100"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0 scale-100"
    leave-to-class="opacity-0 -translate-y-1 scale-95"
  >
    <div
      v-if="message"
      role="alert"
      class="flex items-start gap-3 rounded-xl border p-3 text-sm sm:p-3.5"
      :class="styles.container"
    >
      <svg class="mt-0.5 h-4 w-4 flex-shrink-0" :class="styles.icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p :class="styles.text">{{ message }}</p>
    </div>
  </Transition>
</template>

<script setup lang="ts">
const props = defineProps<{
  message?: string | null
  type?: 'error' | 'warning' | 'info'
}>()

const styles = computed(() => {
  const map = {
    error:   { container: 'bg-red-50 border-red-200',    icon: 'text-red-500',    text: 'text-red-700'    },
    warning: { container: 'bg-yellow-50 border-yellow-200', icon: 'text-yellow-500', text: 'text-yellow-700' },
    info:    { container: 'bg-blue-50 border-blue-200',   icon: 'text-blue-500',   text: 'text-blue-700'   },
  }
  return map[props.type ?? 'error']
})
</script>
