<template>
  <UiModal
    :model-value="modelValue"
    :title="`Room Types — ${promotion?.name}`"
    subtitle="Select which room types this promotion applies to"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-4" />

    <!-- Loading -->
    <div v-if="loading" class="flex items-center justify-center py-10">
      <svg class="h-7 w-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <div v-else class="space-y-2">
      <p v-if="roomTypesStore.items.length === 0" class="py-6 text-center text-sm text-gray-400">
        No room types found.
      </p>

      <label
        v-for="rt in roomTypesStore.items"
        :key="rt.roomTypeId"
        class="flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-gray-50"
        :class="checkedIds.has(rt.roomTypeId) ? 'border-primary-200 bg-primary-50/40' : 'border-gray-200'"
      >
        <!-- Checkbox -->
        <div class="relative flex-shrink-0">
          <input
            type="checkbox"
            class="sr-only"
            :checked="checkedIds.has(rt.roomTypeId)"
            @change="toggleRoomType(rt.roomTypeId)"
          />
          <div
            class="flex h-5 w-5 items-center justify-center rounded border-2 transition-colors"
            :class="checkedIds.has(rt.roomTypeId) ? 'border-primary-600 bg-primary-600' : 'border-gray-300 bg-white'"
          >
            <svg v-if="checkedIds.has(rt.roomTypeId)" class="h-3 w-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-gray-900">{{ rt.typeName }}</p>
          <p class="text-xs text-gray-500">{{ rt.bed }} bed{{ rt.bed !== 1 ? 's' : '' }} · ${{ rt.price.toLocaleString() }}/night</p>
        </div>

        <!-- Active badge -->
        <span
          class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium"
          :class="rt.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
        >
          {{ rt.isActive ? 'Active' : 'Inactive' }}
        </span>
      </label>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        :disabled="saving"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="saving || loading"
        class="inline-flex min-w-[120px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSave"
      >
        <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ saving ? 'Saving…' : 'Save' }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { PromotionResponse, PromotionRoomTypeResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  promotion:  PromotionResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const promotionsStore = usePromotionsStore()
const roomTypesStore  = useRoomTypesStore()

const loading   = ref(false)
const saving    = ref(false)
const apiError  = ref<string | null>(null)

// Map roomTypeId → assignment id (from API)
const assignmentMap = ref<Map<number, number>>(new Map())
// Currently checked room type ids
const checkedIds    = ref<Set<number>>(new Set())

function toggleRoomType(id: number) {
  const next = new Set(checkedIds.value)
  if (next.has(id)) next.delete(id)
  else              next.add(id)
  checkedIds.value = next
}

watch(() => props.modelValue, async (v) => {
  if (!v || !props.promotion) return
  apiError.value = null
  loading.value  = true
  try {
    await roomTypesStore.fetchAll()
    const assigned: PromotionRoomTypeResponse[] =
      await promotionsStore.getRoomTypes(props.promotion.id)

    const aMap = new Map<number, number>()
    const ids  = new Set<number>()
    for (const a of assigned) {
      aMap.set(a.roomTypeId, a.id)
      ids.add(a.roomTypeId)
    }
    assignmentMap.value = aMap
    checkedIds.value    = ids
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'Failed to load room types'
  } finally {
    loading.value = false
  }
})

async function handleSave() {
  if (!props.promotion) return
  apiError.value = null
  saving.value   = true
  try {
    // Newly added room type ids (checked but not in original assignments)
    const toAdd: number[] = []
    for (const id of checkedIds.value) {
      if (!assignmentMap.value.has(id)) toAdd.push(id)
    }

    // Removed room type ids (in original assignments but now unchecked)
    const toRemove: number[] = []
    for (const [roomTypeId, assignId] of assignmentMap.value) {
      if (!checkedIds.value.has(roomTypeId)) toRemove.push(assignId)
    }

    await Promise.all([
      toAdd.length    ? promotionsStore.assignRoomTypes(props.promotion.id, toAdd) : undefined,
      ...toRemove.map(aid => promotionsStore.removeRoomType(aid)),
    ])

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>
