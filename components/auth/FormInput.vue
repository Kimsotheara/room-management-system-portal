<template>
  <div class="w-full">
    <label
      :for="id"
      class="block text-sm font-medium text-gray-700 mb-1.5"
    >
      {{ label }}
    </label>

    <div class="relative">
      <!-- Leading icon -->
      <div
        v-if="$slots.icon"
        class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400"
      >
        <slot name="icon" />
      </div>

      <input
        :id="id"
        :value="modelValue"
        :type="currentType"
        v-bind="$attrs"
        class="block w-full rounded-xl border bg-white py-2.5 text-sm text-gray-900 placeholder-gray-400 shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent sm:py-3"
        :class="[
          $slots.icon ? 'pl-10' : 'pl-3.5',
          type === 'password' ? 'pr-11' : 'pr-3.5',
          error
            ? 'border-red-400 focus:ring-red-400'
            : 'border-gray-200 focus:ring-primary-500',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />

      <!-- Password toggle -->
      <button
        v-if="type === 'password'"
        type="button"
        class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
        tabindex="-1"
        @click="showPassword = !showPassword"
      >
        <!-- Eye open -->
        <svg v-if="!showPassword" class="h-4 w-4 sm:h-4.5 sm:w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <!-- Eye closed -->
        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
        </svg>
      </button>
    </div>

    <!-- Inline error -->
    <p v-if="error" class="mt-1.5 flex items-center gap-1 text-xs text-red-500">
      <svg class="h-3 w-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  id: string
  label: string
  type?: string
  modelValue: string
  error?: string
}>()

defineEmits<{ 'update:modelValue': [value: string] }>()

const showPassword = ref(false)

const currentType = computed(() => {
  if (props.type === 'password') return showPassword.value ? 'text' : 'password'
  return props.type ?? 'text'
})
</script>
