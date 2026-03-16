<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Service' : 'Add Service'"
    :subtitle="isEdit ? `Editing ${service?.name}` : 'Fill in the service details below'"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-4">

      <!-- Name -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Service Name <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Room Cleaning"
          class="block w-full rounded-xl border px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
          @input="errors.name = ''"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
      </div>

      <!-- Price -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Price <span class="text-red-500">*</span></label>
        <div class="relative">
          <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
          <input
            v-model.number="form.price"
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            class="block w-full rounded-xl border py-2.5 pl-8 pr-3.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.price ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @input="errors.price = ''"
          />
        </div>
        <p v-if="errors.price" class="mt-1 text-xs text-red-500">{{ errors.price }}</p>
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Service Active</p>
          <p class="text-xs text-gray-500">Inactive services won't appear in new bookings</p>
        </div>
        <button
          type="button"
          class="relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          :class="form.isActive ? 'bg-primary-600' : 'bg-gray-200'"
          @click="form.isActive = !form.isActive"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200"
            :class="form.isActive ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
      </div>

    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        :disabled="store.submitting"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="store.submitting"
        class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="store.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ store.submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Add Service') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { ServiceResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  service?: ServiceResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store  = useServicesStore()
const isEdit = computed(() => !!props.service)

const apiError = ref<string | null>(null)

const form = reactive({
  name:     '',
  price:    0,
  isActive: true,
})

const errors = reactive({ name: '', price: '' })

function resetForm() {
  apiError.value = null
  errors.name = ''
  errors.price = ''
  if (props.service) {
    form.name     = props.service.name
    form.price    = props.service.price
    form.isActive = props.service.isActive
  } else {
    form.name     = ''
    form.price    = 0
    form.isActive = true
  }
}

watch(() => props.modelValue, v => { if (v) resetForm() })

function validate() {
  let ok = true
  if (!form.name.trim()) { errors.name = 'Service name is required'; ok = false }
  if (form.price < 0)    { errors.price = 'Price must be 0 or greater'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    if (isEdit.value && props.service) {
      await store.update(props.service.id, {
        name:     form.name     || undefined,
        price:    form.price,
        isActive: form.isActive,
      })
    } else {
      await store.create({ name: form.name || undefined, price: form.price })
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
