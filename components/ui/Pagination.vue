<template>
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <!-- Count info -->
    <p class="text-sm text-gray-500">
      Showing
      <span class="font-medium text-gray-900">{{ from }}</span>–<span class="font-medium text-gray-900">{{ to }}</span>
      of <span class="font-medium text-gray-900">{{ total }}</span> results
    </p>

    <!-- Controls -->
    <div class="flex items-center gap-1">
      <!-- Prev -->
      <button
        :disabled="page <= 0"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('change', page - 1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- Page buttons -->
      <template v-for="p in visiblePages" :key="String(p) + Math.random()">
        <span v-if="p === '...'" class="flex h-8 w-6 items-center justify-center text-sm text-gray-400">…</span>
        <button
          v-else
          class="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition-colors"
          :class="p === page
            ? 'bg-primary-600 text-white shadow-sm'
            : 'border border-gray-200 text-gray-600 hover:bg-gray-50'"
          @click="emit('change', p as number)"
        >
          {{ (p as number) + 1 }}
        </button>
      </template>

      <!-- Next -->
      <button
        :disabled="page >= totalPages - 1"
        class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        @click="emit('change', page + 1)"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  page: number       // 0-indexed
  totalPages: number
  total: number
  pageSize: number
}>()

const emit = defineEmits<{ change: [page: number] }>()

const from = computed(() => props.total === 0 ? 0 : props.page * props.pageSize + 1)
const to   = computed(() => Math.min((props.page + 1) * props.pageSize, props.total))

const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const n = props.totalPages
  const c = props.page
  if (n <= 7) {
    for (let i = 0; i < n; i++) pages.push(i)
    return pages
  }
  pages.push(0)
  if (c > 2) pages.push('...')
  const start = Math.max(1, c - 1)
  const end   = Math.min(n - 2, c + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  if (c < n - 3) pages.push('...')
  pages.push(n - 1)
  return pages
})
</script>
