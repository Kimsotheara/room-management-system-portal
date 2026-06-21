<template>
  <UiModal
    :model-value="modelValue"
    title="New Reservation"
    subtitle="Fill in the reservation details below"
    size="lg"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <div class="space-y-5">

      <!-- Guest -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Guest <span class="text-red-500">*</span></label>

        <!-- Selected guest chip -->
        <div
          v-if="selectedGuest"
          class="mb-2 flex items-center gap-3 rounded-xl border border-primary-200 bg-primary-50 px-3.5 py-2.5"
        >
          <div class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
            {{ selectedGuest.firstName[0] }}{{ selectedGuest.lastName[0] }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-primary-900">{{ selectedGuest.firstName }} {{ selectedGuest.lastName }}</p>
            <p class="truncate text-xs text-primary-600">{{ selectedGuest.email }} · {{ selectedGuest.phoneNumber }}</p>
          </div>
          <button
            type="button"
            class="flex-shrink-0 rounded-lg p-1 text-primary-400 transition hover:bg-primary-100 hover:text-primary-600"
            @click="clearGuest"
          >
            <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Search input (hidden once guest is selected) -->
        <div v-else class="relative">
          <svg class="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            v-model="guestSearch"
            type="text"
            placeholder="Search by name or email…"
            autocomplete="off"
            class="block w-full rounded-xl border py-2.5 pl-10 pr-3.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.guestId ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @focus="showGuestDropdown = true"
            @blur="onGuestBlur"
            @input="errors.guestId = ''"
          />

          <!-- Dropdown -->
          <div
            v-if="showGuestDropdown"
            class="absolute z-10 mt-1 w-full overflow-auto rounded-xl border border-gray-200 bg-white shadow-lg"
            style="max-height:220px"
          >
            <!-- Loading -->
            <div v-if="guestsStore.loading" class="flex items-center justify-center py-6">
              <svg class="h-5 w-5 animate-spin text-primary-400" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>

            <!-- No results -->
            <div
              v-else-if="filteredGuests.length === 0"
              class="px-3.5 py-4 text-center text-sm text-gray-400"
            >
              {{ guestSearch.trim() ? `No guests found for "${guestSearch}"` : 'No guests available' }}
            </div>

            <!-- Results -->
            <template v-else>
              <button
                v-for="g in filteredGuests"
                :key="g.guestId"
                type="button"
                class="flex w-full items-center gap-3 px-3.5 py-2.5 text-left text-sm transition hover:bg-primary-50"
                @mousedown.prevent="selectGuest(g)"
              >
                <div class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-semibold text-primary-700">
                  {{ g.firstName[0] }}{{ g.lastName[0] }}
                </div>
                <div class="min-w-0 flex-1">
                  <p class="truncate font-medium text-gray-900">{{ g.firstName }} {{ g.lastName }}</p>
                  <p class="truncate text-xs text-gray-400">{{ g.email }} · {{ g.phoneNumber }}</p>
                </div>
              </button>
            </template>
          </div>
        </div>

        <p v-if="errors.guestId" class="mt-1 text-xs text-red-500">{{ errors.guestId }}</p>
      </div>

      <!-- Date range -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Check-in Date <span class="text-red-500">*</span></label>
          <input
            v-model="form.checkInDate"
            type="datetime-local"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.checkInDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @change="errors.checkInDate = ''"
          />
          <p v-if="errors.checkInDate" class="mt-1 text-xs text-red-500">{{ errors.checkInDate }}</p>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium text-gray-700">Check-out Date <span class="text-red-500">*</span></label>
          <input
            v-model="form.checkOutDate"
            type="datetime-local"
            class="block w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
            :class="errors.checkOutDate ? 'border-red-400 focus:ring-red-400' : 'border-gray-200 focus:ring-primary-500'"
            @change="errors.checkOutDate = ''"
          />
          <p v-if="errors.checkOutDate" class="mt-1 text-xs text-red-500">{{ errors.checkOutDate }}</p>
        </div>
      </div>

      <!-- Rooms -->
      <div>
        <div class="mb-2 flex items-center justify-between">
          <label class="text-sm font-medium text-gray-700">Rooms</label>
          <button
            type="button"
            class="inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-primary-600 transition hover:bg-primary-50"
            @click="addRoomRow"
          >
            <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add Room
          </button>
        </div>

        <div v-if="roomRows.length === 0" class="rounded-xl border border-dashed border-gray-200 py-6 text-center text-sm text-gray-400">
          No rooms added. Click "Add Room" to attach rooms.
        </div>

        <div v-else class="space-y-2">
          <div
            v-for="(row, idx) in roomRows"
            :key="idx"
            class="grid grid-cols-1 gap-2 rounded-xl border border-gray-200 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <!-- Room select -->
            <select
              v-model="row.roomId"
              class="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              @change="row.promotionId = undefined"
            >
              <option :value="undefined">— Select room —</option>
              <option
                v-for="r in availableRooms"
                :key="r.roomId"
                :value="r.roomId"
              >
                {{ r.roomNumber }} — {{ r.roomType.typeName }}
              </option>
            </select>

            <!-- Promotion select -->
            <select
              v-model="row.promotionId"
              class="block w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option :value="undefined">No promotion</option>
              <option
                v-for="p in activePromotions"
                :key="p.id"
                :value="p.id"
              >
                {{ p.name }}
              </option>
            </select>

            <!-- Remove -->
            <button
              type="button"
              class="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500"
              @click="removeRoomRow(idx)"
            >
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div>
        <label class="mb-1.5 block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          v-model="form.notes"
          rows="3"
          placeholder="Optional notes…"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
        />
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
        class="inline-flex min-w-[160px] items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="store.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        {{ store.submitting ? 'Creating…' : 'Create Reservation' }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { GuestResponse, RoomResponse } from '~/types/api'

const props = defineProps<{ modelValue: boolean }>()
const emit  = defineEmits<{ 'update:modelValue': [value: boolean]; saved: [] }>()

const store          = useReservationsStore()
const guestsStore    = useGuestsStore()
const roomsStore     = useRoomsStore()
const promotionsStore = usePromotionsStore()

// ── Guest search ──────────────────────────────────────────────────────────────
const guestSearch        = ref('')
const showGuestDropdown  = ref(false)
const selectedGuest      = ref<GuestResponse | null>(null)

const filteredGuests = computed(() => {
  const q = guestSearch.value.toLowerCase().trim()
  if (!q) return guestsStore.items.slice(0, 10)
  return guestsStore.items.filter(g =>
    `${g.firstName} ${g.lastName}`.toLowerCase().includes(q) ||
    g.email.toLowerCase().includes(q),
  ).slice(0, 10)
})

function selectGuest(g: GuestResponse) {
  selectedGuest.value     = g
  guestSearch.value       = `${g.firstName} ${g.lastName}`
  showGuestDropdown.value = false
  errors.guestId          = ''
}

function clearGuest() {
  selectedGuest.value     = null
  guestSearch.value       = ''
  showGuestDropdown.value = false
  errors.guestId          = ''
}

function onGuestBlur() {
  setTimeout(() => { showGuestDropdown.value = false }, 150)
}

// ── Room rows ─────────────────────────────────────────────────────────────────
const roomRows = ref<{ roomId: number | undefined; promotionId: number | undefined }[]>([])

function addRoomRow()       { roomRows.value.push({ roomId: undefined, promotionId: undefined }) }
function removeRoomRow(idx: number) { roomRows.value.splice(idx, 1) }

const availableRooms = computed<RoomResponse[]>(() =>
  roomsStore.items.filter(r => r.isActive),
)

const activePromotions = computed(() =>
  promotionsStore.items.filter(p => p.isActive),
)

// ── Form ──────────────────────────────────────────────────────────────────────
const apiError = ref<string | null>(null)

const form = reactive({
  checkInDate:  '',
  checkOutDate: '',
  notes:        '',
})

const errors = reactive({ guestId: '', checkInDate: '', checkOutDate: '' })

function resetForm() {
  apiError.value      = null
  selectedGuest.value = null
  guestSearch.value   = ''
  roomRows.value      = []
  Object.keys(errors).forEach(k => ((errors as Record<string, string>)[k] = ''))
  form.checkInDate  = ''
  form.checkOutDate = ''
  form.notes        = ''
}

watch(() => props.modelValue, async (v) => {
  if (v) {
    resetForm()
    await Promise.all([
      guestsStore.fetchPage({ page: 0, size: 200, filter: {} }),
      roomsStore.fetchAll(),
      promotionsStore.fetchAll(),
    ])
  }
})

// ── Validation ────────────────────────────────────────────────────────────────
function validate() {
  let ok = true
  if (!selectedGuest.value) { errors.guestId     = 'Guest is required';             ok = false }
  if (!form.checkInDate)    { errors.checkInDate  = 'Check-in date is required';    ok = false }
  if (!form.checkOutDate)   { errors.checkOutDate = 'Check-out date is required';   ok = false }
  if (form.checkInDate && form.checkOutDate && form.checkOutDate <= form.checkInDate) {
    errors.checkOutDate = 'Check-out must be after check-in'
    ok = false
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    const rooms = roomRows.value
      .filter(r => r.roomId !== undefined)
      .map(r => ({ roomId: r.roomId!, promotionId: r.promotionId }))

    await store.create({
      guestId:      selectedGuest.value!.guestId,
      checkInDate:  new Date(form.checkInDate).toISOString(),
      checkOutDate: new Date(form.checkOutDate).toISOString(),
      rooms:        rooms.length > 0 ? rooms : undefined,
      notes:        form.notes || undefined,
    })
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
