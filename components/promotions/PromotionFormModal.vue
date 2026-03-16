<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Promotion' : 'Add Promotion'"
    :subtitle="isEdit ? `Editing ${promotion?.name}` : 'Fill in the promotion details below'"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-4">

      <!-- Name -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Promotion Name <span class="text-red-500">*</span></label>
        <input
          v-model="form.name"
          type="text"
          placeholder="e.g. Summer Sale"
          class="block w-full rounded-xl border px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.name ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
          @input="errors.name = ''"
        />
        <p v-if="errors.name" class="mt-1 text-xs text-red-500">{{ errors.name }}</p>
      </div>

      <!-- Discount type + value -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Discount Type <span class="text-red-500">*</span></label>
          <select
            v-model="form.discountType"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.discountType ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @change="errors.discountType = ''"
          >
            <option value="">— Select type —</option>
            <option value="PERCENT">Percentage (%)</option>
            <option value="AMOUNT">Fixed Amount ($)</option>
          </select>
          <p v-if="errors.discountType" class="mt-1 text-xs text-red-500">{{ errors.discountType }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Discount Value <span class="text-red-500">*</span></label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">
              {{ form.discountType === 'PERCENT' ? '%' : '$' }}
            </span>
            <input
              v-model.number="form.discountValue"
              type="number"
              min="0"
              step="0.01"
              placeholder="0"
              class="block w-full rounded-xl border py-2.5 pl-8 pr-3.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
              :class="errors.discountValue ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
              @input="errors.discountValue = ''"
            />
          </div>
          <p v-if="errors.discountValue" class="mt-1 text-xs text-red-500">{{ errors.discountValue }}</p>
        </div>
      </div>

      <!-- Permanent checkbox -->
      <label class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:bg-gray-50" :class="permanent ? 'border-primary-200 bg-primary-50/40' : ''">
        <div class="relative flex-shrink-0">
          <input
            v-model="permanent"
            type="checkbox"
            class="sr-only"
          />
          <div
            class="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors"
            :class="permanent ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'"
          >
            <svg v-if="permanent" class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <div class="flex-1">
          <p class="text-sm font-medium text-gray-900">Permanent promotion</p>
          <p class="text-xs text-gray-500">No expiry date — promotion runs indefinitely</p>
        </div>
        <svg class="h-5 w-5 flex-shrink-0 text-primary-400" :class="permanent ? 'opacity-100' : 'opacity-0'" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </label>

      <!-- Date range -->
      <div class="grid grid-cols-1 gap-4" :class="!permanent ? 'sm:grid-cols-2' : ''">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">
            Effective Date <span class="text-red-500">*</span>
            <span v-if="permanent" class="ml-1.5 font-normal text-primary-500">(set to now)</span>
          </label>
          <input
            v-model="form.effectiveDate"
            type="datetime-local"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.effectiveDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @change="errors.effectiveDate = ''"
          />
          <p v-if="errors.effectiveDate" class="mt-1 text-xs text-red-500">{{ errors.effectiveDate }}</p>
        </div>

        <!-- Expiry date — hidden when permanent -->
        <div v-if="!permanent">
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Expiry Date <span class="text-red-500">*</span></label>
          <input
            v-model="form.expireDate"
            type="datetime-local"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.expireDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @change="errors.expireDate = ''"
          />
          <p v-if="errors.expireDate" class="mt-1 text-xs text-red-500">{{ errors.expireDate }}</p>
        </div>
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Promotion Active</p>
          <p class="text-xs text-gray-500">Inactive promotions won't be applied to new bookings</p>
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
        class="inline-flex min-w-[140px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="store.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ store.submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Add Promotion') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { PromotionResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  promotion?: PromotionResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store  = usePromotionsStore()
const isEdit = computed(() => !!props.promotion)

const apiError = ref<string | null>(null)
const permanent = ref(false)

const form = reactive({
  name:          '',
  discountType:  '',
  discountValue: 0,
  effectiveDate: '',
  expireDate:    '',
  isActive:      true,
})

const errors = reactive({
  name: '', discountType: '', discountValue: '', effectiveDate: '', expireDate: '',
})

// Returns current local datetime in "YYYY-MM-DDTHH:MM" format for datetime-local input
function nowLocalString() {
  const d   = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// Convert ISO string to datetime-local format ("YYYY-MM-DDTHH:MM")
function toLocalInput(iso: string | undefined | null) {
  if (!iso) return ''
  return iso.slice(0, 16)
}

// Convert datetime-local value to ISO string
function toISO(localStr: string) {
  if (!localStr) return undefined
  return new Date(localStr).toISOString()
}

// When permanent is toggled on → default effectiveDate to now, clear expiry error
watch(permanent, (val) => {
  if (val) {
    if (!form.effectiveDate) form.effectiveDate = nowLocalString()
    form.expireDate   = ''
    errors.expireDate = ''
  }
})

function resetForm() {
  apiError.value = null
  Object.keys(errors).forEach(k => ((errors as Record<string, string>)[k] = ''))

  if (props.promotion) {
    form.name          = props.promotion.name
    form.discountType  = props.promotion.discountType
    form.discountValue = props.promotion.discountType === 'PERCENT'
      ? props.promotion.discountValue * 100
      : props.promotion.discountValue
    form.effectiveDate = toLocalInput(props.promotion.effectiveDate)
    form.expireDate    = toLocalInput(props.promotion.expireDate)
    form.isActive      = props.promotion.isActive
    // Treat as permanent if no expiry date on the server record
    permanent.value    = !props.promotion.expireDate
  } else {
    form.name          = ''
    form.discountType  = ''
    form.discountValue = 0
    form.effectiveDate = nowLocalString()   // default effective date to now
    form.expireDate    = ''
    form.isActive      = true
    permanent.value    = false
  }
}

watch(() => props.modelValue, v => { if (v) resetForm() })

function validate() {
  let ok = true
  if (!form.name.trim())        { errors.name          = 'Name is required';           ok = false }
  if (!form.discountType)       { errors.discountType  = 'Discount type is required';  ok = false }
  if (form.discountValue < 0)   { errors.discountValue = 'Value must be 0 or greater'; ok = false }
  if (!form.effectiveDate)      { errors.effectiveDate = 'Effective date is required'; ok = false }
  if (!permanent.value) {
    if (!form.expireDate) {
      errors.expireDate = 'Expiry date is required'
      ok = false
    } else if (form.effectiveDate && form.expireDate <= form.effectiveDate) {
      errors.expireDate = 'Expiry must be after effective date'
      ok = false
    }
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    const payload = {
      name:          form.name         || undefined,
      discountType:  form.discountType || undefined,
      discountValue: form.discountType === 'PERCENT'
        ? form.discountValue / 100
        : form.discountValue,
      effectiveDate: toISO(form.effectiveDate),
      expireDate:    permanent.value ? undefined : toISO(form.expireDate),
    }
    if (isEdit.value && props.promotion) {
      await store.update(props.promotion.id, { ...payload, isActive: form.isActive })
    } else {
      await store.create(payload)
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
