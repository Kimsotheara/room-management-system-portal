<template>
  <div class="card p-6 hover:shadow-md transition-shadow duration-200">
    <div class="flex items-start justify-between">
      <div class="flex-1">
        <p class="text-sm font-medium text-gray-500">{{ title }}</p>
        <p class="text-2xl font-bold text-gray-900 mt-1">{{ value }}</p>
        <div v-if="change !== undefined" class="flex items-center gap-1 mt-2">
          <span
            class="text-xs font-medium"
            :class="change >= 0 ? 'text-green-600' : 'text-red-600'"
          >
            <svg
              class="w-3 h-3 inline-block"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                :d="change >= 0 ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'"
              />
            </svg>
            {{ Math.abs(change) }}%
          </span>
          <span class="text-xs text-gray-400">vs last month</span>
        </div>
        <p v-if="subtitle" class="text-xs text-gray-400 mt-1">{{ subtitle }}</p>
      </div>
      <div
        class="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
        :class="iconBg"
      >
        <span class="w-6 h-6" :class="iconColor" v-html="icon" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  icon: string
  iconBg?: string
  iconColor?: string
  change?: number
  subtitle?: string
}>()
</script>
