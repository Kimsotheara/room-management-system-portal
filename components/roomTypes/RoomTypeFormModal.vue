<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Room Type' : 'Add Room Type'"
    :subtitle="isEdit ? `Editing ${roomType?.typeName}` : 'Fill in the details below'"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Type Name -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">
          Type Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.typeName"
          type="text"
          placeholder="e.g. Deluxe, Standard, Suite"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.typeName ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
          @input="errors.typeName = ''"
        />
        <p v-if="errors.typeName" class="mt-1 text-xs text-red-500">{{ errors.typeName }}</p>
      </div>

      <!-- Beds & Price -->
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">
            Beds <span class="text-red-500">*</span>
          </label>
          <input
            v-model.number="form.bed"
            type="number"
            min="1"
            placeholder="e.g. 2"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.bed ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
            @input="errors.bed = ''"
          />
          <p v-if="errors.bed" class="mt-1 text-xs text-red-500">{{ errors.bed }}</p>
        </div>

        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">
            Price / Night <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
            <input
              v-model.number="form.price"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              class="block w-full rounded-xl border border-gray-200 py-2.5 pl-7 pr-3.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
              :class="errors.price ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
              @input="errors.price = ''"
            />
          </div>
          <p v-if="errors.price" class="mt-1 text-xs text-red-500">{{ errors.price }}</p>
        </div>
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Room Type Active</p>
          <p class="text-xs text-gray-500">Inactive types cannot be assigned to rooms</p>
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
    </form>

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
        :disabled="store.submitting"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="store.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ store.submitting ? 'Saving…' : (isEdit ? 'Save Changes' : 'Create Type') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { RoomTypeResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  roomType?: RoomTypeResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store    = useRoomTypesStore()
const isEdit   = computed(() => !!props.roomType)
const apiError = ref<string | null>(null)

const form = reactive({
  typeName: '',
  bed: null as number | null,
  price: null as number | null,
  isActive: true,
})

const errors = reactive({ typeName: '', bed: '', price: '' })

function resetForm() {
  apiError.value = null
  Object.assign(errors, { typeName: '', bed: '', price: '' })
  if (props.roomType) {
    form.typeName = props.roomType.typeName || ''
    form.bed      = props.roomType.bed ?? null
    form.price    = props.roomType.price ?? null
    form.isActive = props.roomType.isActive
  } else {
    form.typeName = ''
    form.bed      = null
    form.price    = null
    form.isActive = true
  }
}

watch(() => props.modelValue, (v) => { if (v) resetForm() })

function validate() {
  let ok = true
  if (!form.typeName.trim()) { errors.typeName = 'Type name is required'; ok = false }
  if (!form.bed || form.bed < 1) { errors.bed = 'Beds must be at least 1'; ok = false }
  if (form.price === null || form.price < 0) { errors.price = 'Enter a valid price'; ok = false }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    if (isEdit.value && props.roomType) {
      await store.update(props.roomType.roomTypeId, {
        typeName: form.typeName,
        bed:      form.bed!,
        price:    form.price!,
        isActive: form.isActive,
      })
    } else {
      await store.create({
        typeName: form.typeName,
        bed:      form.bed!,
        price:    form.price!,
      })
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
