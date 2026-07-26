<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Hotel' : 'Add Hotel'"
    :subtitle="isEdit ? `Editing ${hotel?.hotelName}` : 'Fill in the hotel details below'"
    size="sm"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-4">

      <!-- Hotel name -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Hotel Name <span class="text-red-500">*</span></label>
        <input
          v-model="form.hotelName"
          type="text"
          placeholder="e.g. Grand Plaza Hotel"
          class="block w-full rounded-xl border px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.hotelName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
          @input="errors.hotelName = ''"
        />
        <p v-if="errors.hotelName" class="mt-1 text-xs text-red-500">{{ errors.hotelName }}</p>
      </div>

      <!-- Contact -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Contact</label>
        <input
          v-model="form.contact"
          type="text"
          placeholder="e.g. +855 12 345 678"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Address -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
        <textarea
          v-model="form.address"
          rows="2"
          placeholder="Street, city, country"
          class="block w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Hotel Active</p>
          <p class="text-xs text-gray-500">Inactive hotels are hidden from operations</p>
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
        {{ store.submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Add Hotel') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { HotelResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  hotel?: HotelResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store  = useHotelsStore()
const isEdit = computed(() => !!props.hotel)

const apiError = ref<string | null>(null)

const form = reactive({
  hotelName: '',
  contact:   '',
  address:   '',
  isActive:  true,
})

const errors = reactive({ hotelName: '' })

function resetForm() {
  apiError.value    = null
  errors.hotelName  = ''
  if (props.hotel) {
    form.hotelName = props.hotel.hotelName
    form.contact   = props.hotel.contact ?? ''
    form.address   = props.hotel.address ?? ''
    form.isActive  = props.hotel.isActive
  } else {
    form.hotelName = ''
    form.contact   = ''
    form.address   = ''
    form.isActive  = true
  }
}

watch(() => props.modelValue, v => { if (v) resetForm() })

function validate() {
  if (!form.hotelName.trim()) { errors.hotelName = 'Hotel name is required'; return false }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    if (isEdit.value && props.hotel) {
      await store.update(props.hotel.hotelId, {
        hotelName: form.hotelName,
        contact:   form.contact || undefined,
        address:   form.address || undefined,
        isActive:  form.isActive,
      })
    } else {
      await store.create({
        hotelName: form.hotelName,
        contact:   form.contact || undefined,
        address:   form.address || undefined,
      })
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    apiError.value = getApiError(err, 'An error occurred')
  }
}
</script>
