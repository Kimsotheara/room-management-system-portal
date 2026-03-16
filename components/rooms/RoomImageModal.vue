<template>
  <UiModal
    :model-value="modelValue"
    :title="`Photos — Room ${room?.roomNumber ?? ''}`"
    :subtitle="room ? `${room.images?.length ?? 0} existing photo${room.images?.length !== 1 ? 's' : ''}` : ''"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="space-y-6">

      <!-- ── Existing images ─────────────────────────────────────────────── -->
      <div v-if="room?.images?.length">
        <p class="mb-3 text-sm font-medium text-gray-700">Current Photos</p>
        <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
          <div
            v-for="img in room.images"
            :key="img.imageId"
            class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
          >
            <RoomsRoomImage
              :room-id="room.roomId"
              :image-id="img.imageId"
              :alt="`Image ${img.imageId}`"
              class="transition group-hover:brightness-75"
            />
            <!-- Delete overlay -->
            <button
              class="absolute inset-0 flex items-center justify-center opacity-0 transition group-hover:opacity-100"
              :disabled="deletingId === img.imageId"
              @click="deleteImage(img.imageId)"
            >
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-red-500 shadow-lg">
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

      <!-- ── Upload zone ────────────────────────────────────────────────── -->
      <div>
        <p class="mb-3 text-sm font-medium text-gray-700">Add New Photos</p>

        <!-- Drop zone — label wraps input so click natively opens file picker -->
        <label
          class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors"
          :class="isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-200 bg-gray-50 hover:border-primary-300 hover:bg-primary-50/40'"
          @dragover.prevent="isDragging = true"
          @dragleave.prevent="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div class="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
            <svg class="h-6 w-6 text-primary-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-gray-700">
              Drop photos here or <span class="text-primary-600 underline underline-offset-2">click to browse</span>
            </p>
            <p class="mt-1 text-xs text-gray-400">JPEG, PNG, WEBP, GIF — multiple files allowed</p>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            class="hidden"
            @change="onFileChange"
          />
        </label>

        <!-- Preview pending files -->
        <div v-if="pendingFiles.length" class="mt-4">
          <div class="mb-2 flex items-center justify-between">
            <p class="text-sm font-medium text-gray-700">
              {{ pendingFiles.length }} photo{{ pendingFiles.length !== 1 ? 's' : '' }} selected
            </p>
            <button
              class="text-xs text-gray-400 hover:text-red-500 transition-colors"
              @click="pendingFiles = []"
            >
              Clear all
            </button>
          </div>
          <div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
            <div
              v-for="(pf, i) in pendingFiles"
              :key="i"
              class="group relative aspect-square overflow-hidden rounded-xl bg-gray-100"
            >
              <img :src="pf.preview" :alt="pf.file.name" class="h-full w-full object-cover" />
              <!-- Remove from pending -->
              <button
                class="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition hover:bg-red-500 group-hover:opacity-100"
                @click.stop="removePending(i)"
              >
                <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <!-- File name tooltip -->
              <div class="absolute inset-x-0 bottom-0 truncate bg-black/50 px-1.5 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100">
                {{ pf.file.name }}
              </div>
            </div>
          </div>
        </div>

        <!-- Error -->
        <p v-if="uploadError" class="mt-3 text-sm text-red-500">{{ uploadError }}</p>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
        @click="emit('update:modelValue', false)"
      >
        Close
      </button>
      <button
        v-if="pendingFiles.length"
        type="button"
        :disabled="uploading"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="uploadImages"
      >
        <svg v-if="uploading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        {{ uploading ? 'Uploading…' : `Upload ${pendingFiles.length} Photo${pendingFiles.length !== 1 ? 's' : ''}` }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { RoomResponse } from '~/types/api'

const { clearCache: clearImgCache } = useRoomImageSrc()

const props = defineProps<{
  modelValue: boolean
  room: RoomResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const store = useRoomsStore()

// ── State ──────────────────────────────────────────────────────────────────────
const isDragging = ref(false)
const uploading  = ref(false)
const deletingId = ref<number | null>(null)
const uploadError = ref<string | null>(null)

interface PendingFile { file: File; preview: string }
const pendingFiles = ref<PendingFile[]>([])

// Reset pending state when modal closes
watch(() => props.modelValue, (v) => {
  if (!v) {
    revokePreviews()
    pendingFiles.value = []
    uploadError.value = null
    isDragging.value = false
  }
})

// ── File handling ──────────────────────────────────────────────────────────────
function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files) addFiles(Array.from(input.files))
  input.value = ''   // allow re-selecting same file
}

function onDrop(e: DragEvent) {
  isDragging.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  addFiles(files)
}

function addFiles(files: File[]) {
  uploadError.value = null
  for (const file of files) {
    pendingFiles.value.push({ file, preview: URL.createObjectURL(file) })
  }
}

function removePending(i: number) {
  URL.revokeObjectURL(pendingFiles.value[i].preview)
  pendingFiles.value.splice(i, 1)
}

function revokePreviews() {
  pendingFiles.value.forEach(pf => URL.revokeObjectURL(pf.preview))
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Upload ─────────────────────────────────────────────────────────────────────
async function uploadImages() {
  if (!props.room || !pendingFiles.value.length) return
  uploading.value = true
  uploadError.value = null
  try {
    const base64List = await Promise.all(pendingFiles.value.map(pf => fileToBase64(pf.file)))
    await store.addImages(props.room.roomId, { images: base64List })
    revokePreviews()
    pendingFiles.value = []
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    uploadError.value = e?.data?.message || e?.message || 'Upload failed'
  } finally {
    uploading.value = false
  }
}

// ── Delete ─────────────────────────────────────────────────────────────────────
async function deleteImage(imageId: number) {
  if (!props.room) return
  deletingId.value = imageId
  try {
    await store.deleteImage(props.room.roomId, imageId)
    clearImgCache(props.room.roomId, imageId)
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    uploadError.value = e?.data?.message || e?.message || 'Delete failed'
  } finally {
    deletingId.value = null
  }
}
</script>
