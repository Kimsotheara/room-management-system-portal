<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Guest' : 'Add Guest'"
    :subtitle="isEdit ? `Editing ${guest?.firstName} ${guest?.lastName}` : 'Fill in the guest details below'"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-5">

      <!-- ── Profile image ─────────────────────────────────────────────── -->
      <div class="flex items-center gap-5">
        <!-- Avatar preview -->
        <div class="relative flex-shrink-0">
          <div class="h-20 w-20 overflow-hidden rounded-full bg-gray-100 ring-2 ring-gray-200">
            <!-- Pending new file preview -->
            <img
              v-if="pendingAvatar"
              :src="avatarPreview!"
              alt="Profile"
              class="h-full w-full object-cover"
            />
            <!-- Existing image via authenticated binary endpoint -->
            <GuestsGuestImage
              v-else-if="isEdit && guest?.guestId && !removingAvatar"
              :guest-id="guest.guestId"
              :initials="initials"
              :alt="`${guest.firstName} ${guest.lastName}`"
              class="h-full w-full"
            />
            <!-- Initials placeholder (create mode or removing) -->
            <div v-else class="flex h-full w-full items-center justify-center text-2xl font-semibold text-gray-400">
              {{ initials }}
            </div>
          </div>
          <!-- Remove button — edit mode with existing image, no pending -->
          <button
            v-if="isEdit && guest?.guestId && !pendingAvatar && !removingAvatar"
            type="button"
            class="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow"
            title="Remove photo"
            @click="removingAvatar = true"
          >
            <svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="flex-1">
          <p class="mb-1.5 text-sm font-medium text-gray-700">Profile Photo <span class="font-normal text-gray-400">(optional)</span></p>
          <label
            class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2 text-sm font-medium text-gray-600 transition hover:border-primary-300 hover:bg-primary-50/40 hover:text-primary-600"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {{ pendingAvatar ? 'Change Photo' : 'Upload Photo' }}
            <input type="file" accept="image/*" class="hidden" @change="onAvatarChange" />
          </label>
          <button
            v-if="pendingAvatar"
            type="button"
            class="ml-2 text-xs text-gray-400 hover:text-red-500"
            @click="clearPendingAvatar"
          >
            Remove
          </button>
          <p class="mt-1 text-xs text-gray-400">JPEG, PNG, WEBP — recommended 200×200px</p>
        </div>
      </div>

      <div class="border-t border-gray-100" />

      <!-- ── Name ──────────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">First Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.firstName"
            type="text"
            placeholder="e.g. John"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.firstName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @input="errors.firstName = ''"
          />
          <p v-if="errors.firstName" class="mt-1 text-xs text-red-500">{{ errors.firstName }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Last Name <span class="text-red-500">*</span></label>
          <input
            v-model="form.lastName"
            type="text"
            placeholder="e.g. Doe"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.lastName ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @input="errors.lastName = ''"
          />
          <p v-if="errors.lastName" class="mt-1 text-xs text-red-500">{{ errors.lastName }}</p>
        </div>
      </div>

      <!-- ── Contact ───────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="form.email"
            type="email"
            placeholder="john@example.com"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="+1 234 567 8900"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- ── Identity ──────────────────────────────────────────────────── -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Identity Type</label>
          <select
            v-model="form.identityType"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">— Select type —</option>
            <option value="PASSPORT">Passport</option>
            <option value="NATIONAL_ID">National ID</option>
            <option value="DRIVERS_LICENSE">Driver's License</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Identity Number</label>
          <input
            v-model="form.identityNumber"
            type="text"
            placeholder="e.g. A12345678"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- ── Nationality & Address ─────────────────────────────────────── -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Nationality</label>
        <UiNationalitySelect v-model="form.nationality" />
      </div>

      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Address</label>
        <textarea
          v-model="form.address"
          rows="2"
          placeholder="Street, City, Country"
          class="block w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- ── Active toggle (edit only) ─────────────────────────────────── -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Guest Active</p>
          <p class="text-xs text-gray-500">Inactive guests are hidden from new bookings</p>
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
        {{ store.submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Add Guest') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { GuestResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  guest?: GuestResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const store = useGuestsStore()
const { clearCache: clearImgCache } = useGuestImageSrc()

const isEdit   = computed(() => !!props.guest)
const apiError = ref<string | null>(null)

// ── Form state ───────────────────────────────────────────────────────────────
const form = reactive({
  firstName:      '',
  lastName:       '',
  email:          '',
  phoneNumber:    '',
  identityType:   '',
  identityNumber: '',
  nationality:    '',
  address:        '',
  isActive:       true,
})

const errors = reactive({ firstName: '', lastName: '' })

function resetForm() {
  apiError.value = null
  errors.firstName = ''
  errors.lastName  = ''
  clearPendingAvatar()
  removingAvatar.value = false

  if (props.guest) {
    form.firstName      = props.guest.firstName      || ''
    form.lastName       = props.guest.lastName       || ''
    form.email          = props.guest.email          || ''
    form.phoneNumber    = props.guest.phoneNumber    || ''
    form.identityType   = props.guest.identityType   || ''
    form.identityNumber = props.guest.identityNumber || ''
    form.nationality    = props.guest.nationality    || ''
    form.address        = props.guest.address        || ''
    form.isActive       = props.guest.isActive
  } else {
    form.firstName = form.lastName = form.email = form.phoneNumber = ''
    form.identityType = form.identityNumber = form.nationality = form.address = ''
    form.isActive = true
  }
}

watch(() => props.modelValue, v => { if (v) resetForm() })

// ── Avatar ───────────────────────────────────────────────────────────────────
const pendingAvatar  = ref<File | null>(null)
const avatarPreview  = ref<string | null>(null)
const removingAvatar = ref(false)

function onAvatarChange(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  if (avatarPreview.value?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview.value)
  pendingAvatar.value = file
  avatarPreview.value = URL.createObjectURL(file)
  removingAvatar.value = false
  input.value = ''
}

function clearPendingAvatar() {
  if (avatarPreview.value?.startsWith('blob:')) URL.revokeObjectURL(avatarPreview.value)
  pendingAvatar.value = null
  avatarPreview.value = null
}

// ── Computed helpers ─────────────────────────────────────────────────────────
const initials = computed(() => {
  const f = form.firstName?.charAt(0).toUpperCase() || ''
  const l = form.lastName?.charAt(0).toUpperCase()  || ''
  return f + l || '?'
})

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// ── Validation ───────────────────────────────────────────────────────────────
function validate() {
  let ok = true
  if (!form.firstName.trim()) { errors.firstName = 'First name is required'; ok = false }
  if (!form.lastName.trim())  { errors.lastName  = 'Last name is required';  ok = false }
  return ok
}

// ── Submit ───────────────────────────────────────────────────────────────────
async function handleSubmit() {
  if (!validate()) return
  apiError.value = null

  try {
    // Resolve profile image value
    let profileImage: string | undefined
    if (pendingAvatar.value) {
      profileImage = await fileToBase64(pendingAvatar.value)
    } else if (removingAvatar.value) {
      profileImage = ''   // signal removal
    }

    if (isEdit.value && props.guest) {
      await store.update(props.guest.guestId, {
        firstName:      form.firstName      || undefined,
        lastName:       form.lastName       || undefined,
        email:          form.email          || undefined,
        phoneNumber:    form.phoneNumber    || undefined,
        identityType:   form.identityType   || undefined,
        identityNumber: form.identityNumber || undefined,
        nationality:    form.nationality    || undefined,
        address:        form.address        || undefined,
        isActive:       form.isActive,
        ...(profileImage !== undefined ? { profileImage } : {}),
      })
      // Evict cached blob so the new image is loaded next time
      clearImgCache(props.guest.guestId)
    } else {
      await store.create({
        firstName:      form.firstName      || undefined,
        lastName:       form.lastName       || undefined,
        email:          form.email          || undefined,
        phoneNumber:    form.phoneNumber    || undefined,
        identityType:   form.identityType   || undefined,
        identityNumber: form.identityNumber || undefined,
        nationality:    form.nationality    || undefined,
        address:        form.address        || undefined,
        ...(profileImage ? { profileImage } : {}),
      })
    }

    clearPendingAvatar()
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
