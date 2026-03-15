<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Room' : 'Add Room'"
    :subtitle="isEdit ? `Editing Room ${room?.roomNumber}` : 'Fill in the details below'"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-5">
      <!-- ── Room details ─────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <!-- Room Number -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Room Number</label>
          <input
            v-model="form.roomNumber"
            type="text"
            placeholder="e.g. 101, A-201"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <!-- Room Status -->
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Status</label>
          <select
            v-model="form.roomStatus"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">— Not set —</option>
            <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
          </select>
        </div>
      </div>

      <!-- Room Type -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">
          Room Type <span class="text-red-500">*</span>
        </label>
        <select
          v-model="form.roomTypeId"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.roomTypeId ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
          @change="errors.roomTypeId = ''"
        >
          <option :value="null" disabled>Select a room type…</option>
          <option v-for="rt in roomTypesStore.items" :key="rt.roomTypeId" :value="rt.roomTypeId">
            {{ rt.typeName }} — {{ rt.bed }} bed{{ rt.bed !== 1 ? 's' : '' }}, {{ formatPrice(rt.price) }}
          </option>
        </select>
        <p v-if="errors.roomTypeId" class="mt-1 text-xs text-red-500">{{ errors.roomTypeId }}</p>
        <p v-if="roomTypesStore.loading" class="mt-1 text-xs text-gray-400">Loading room types…</p>
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Room Active</p>
          <p class="text-xs text-gray-500">Inactive rooms are hidden from bookings</p>
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

      <!-- ── Divider ──────────────────────────────────────────────────── -->
      <div class="border-t border-gray-100" />

      <!-- ── Photos section ──────────────────────────────────────────── -->
      <div>
        <p class="mb-3 text-sm font-medium text-gray-700">
          Photos
          <span class="ml-1 font-normal text-gray-400">(optional)</span>
        </p>

        <!-- Existing images — edit mode only -->
        <div v-if="isEdit && room?.images?.length" class="mb-4">
          <p class="mb-2 text-xs text-gray-500">Current photos — hover to delete</p>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-5">
            <div
              v-for="img in room.images"
              :key="img.imageId"
              class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img
                :src="`data:image/jpeg;base64,${img.imageData}`"
                :alt="`Photo ${img.imageId}`"
                class="h-full w-full object-cover transition group-hover:brightness-75"
              />
              <button
                type="button"
                class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
                :disabled="deletingId === img.imageId"
                @click="deleteExistingImage(img.imageId)"
              >
                <span class="flex h-8 w-8 items-center justify-center rounded-full bg-red-500 shadow">
                  <svg v-if="deletingId !== img.imageId" class="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <svg v-else class="h-4 w-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </div>

        <!-- Upload zone -->
        <label
          class="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-6 text-center transition-colors"
          :class="isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <svg class="h-8 w-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span class="text-sm text-gray-500">
            Drop photos here or <span class="text-primary-600 underline underline-offset-2">click to browse</span>
          </span>
          <span class="text-xs text-gray-400">JPEG, PNG, WEBP, GIF — multiple allowed</span>
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onFileChange"
          />
        </label>

        <!-- Pending previews -->
        <div v-if="pendingFiles.length" class="mt-3">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-xs text-gray-500">{{ pendingFiles.length }} photo{{ pendingFiles.length !== 1 ? 's' : '' }} ready to upload</p>
            <button type="button" class="text-xs text-gray-400 transition-colors hover:text-red-500" @click="clearPending">
              Clear all
            </button>
          </div>
          <div class="grid grid-cols-4 gap-2 sm:grid-cols-5">
            <div
              v-for="(pf, i) in pendingFiles"
              :key="i"
              class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img :src="pf.preview" :alt="pf.file.name" class="h-full w-full object-cover" />
              <button
                type="button"
                class="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
                @click.stop="removePending(i)"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        :disabled="isBusy"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="isBusy"
        class="inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="isBusy" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ submitLabel }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { RoomResponse } from '~/types/api'
import { useRoomStatus } from '~/composables/useRoomStatus'

const { statusOptions } = useRoomStatus()

const props = defineProps<{
  modelValue: boolean
  room?: RoomResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const roomsStore     = useRoomsStore()
const roomTypesStore = useRoomTypesStore()

const isEdit   = computed(() => !!props.room)
const apiError = ref<string | null>(null)

// ── Room form ───────────────────────────────────────────────────────────────
const form = reactive({
  roomNumber: '',
  roomTypeId: null as number | null,
  roomStatus: '',
  isActive: true,
})
const errors = reactive({ roomTypeId: '' })

function resetForm() {
  apiError.value = null
  errors.roomTypeId = ''
  clearPending()
  if (props.room) {
    form.roomNumber = props.room.roomNumber || ''
    form.roomTypeId = props.room.roomType?.roomTypeId ?? null
    form.roomStatus = props.room.roomStatus || ''
    form.isActive   = props.room.isActive
  } else {
    form.roomNumber = ''
    form.roomTypeId = null
    form.roomStatus = ''
    form.isActive   = true
  }
}

watch(() => props.modelValue, (v) => {
  if (v) {
    resetForm()
    if (!roomTypesStore.items.length) roomTypesStore.fetchAll()
  }
})

function validate() {
  if (!form.roomTypeId) {
    errors.roomTypeId = 'Room type is required'
    return false
  }
  return true
}

// ── Images ──────────────────────────────────────────────────────────────────
interface PendingFile { file: File; preview: string }
const pendingFiles = ref<PendingFile[]>([])
const isDragging   = ref(false)
const deletingId   = ref<number | null>(null)
const step         = ref<'room' | 'images' | null>(null)

const isBusy = computed(() => step.value !== null)

const submitLabel = computed(() => {
  if (step.value === 'room')   return isEdit.value ? 'Saving room…' : 'Creating room…'
  if (step.value === 'images') return 'Uploading photos…'
  const base = isEdit.value ? 'Save Changes' : 'Create Room'
  return pendingFiles.value.length ? `${base} + ${pendingFiles.value.length} Photo${pendingFiles.value.length !== 1 ? 's' : ''}` : base
})

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  input.value = ''
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  addFiles(files)
}

function addFiles(files: File[]) {
  for (const file of files) {
    pendingFiles.value.push({ file, preview: URL.createObjectURL(file) })
  }
}

function removePending(i: number) {
  URL.revokeObjectURL(pendingFiles.value[i].preview)
  pendingFiles.value.splice(i, 1)
}

function clearPending() {
  pendingFiles.value.forEach(pf => URL.revokeObjectURL(pf.preview))
  pendingFiles.value = []
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function deleteExistingImage(imageId: number) {
  if (!props.room) return
  deletingId.value = imageId
  try {
    await roomsStore.deleteImage(props.room.roomId, imageId)
    emit('saved')   // refresh parent list so updated image count shows
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'Delete failed'
  } finally {
    deletingId.value = null
  }
}

// ── Submit ──────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return
  apiError.value = null

  try {
    // Step 1: save room
    step.value = 'room'
    let roomId: number

    if (isEdit.value && props.room) {
      const updated = await roomsStore.update(props.room.roomId, {
        roomNumber: form.roomNumber || undefined,
        roomTypeId: form.roomTypeId!,
        roomStatus: form.roomStatus || undefined,
        isActive:   form.isActive,
      })
      roomId = updated.roomId
    } else {
      const created = await roomsStore.create({
        roomNumber: form.roomNumber || undefined,
        roomTypeId: form.roomTypeId!,
        roomStatus: form.roomStatus || undefined,
      })
      roomId = created.roomId
    }

    // Step 2: upload pending images (if any)
    if (pendingFiles.value.length) {
      step.value = 'images'
      const base64List = await Promise.all(pendingFiles.value.map(pf => fileToBase64(pf.file)))
      await roomsStore.addImages(roomId, { images: base64List })
      clearPending()
    }

    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  } finally {
    step.value = null
  }
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price)
}
</script>
