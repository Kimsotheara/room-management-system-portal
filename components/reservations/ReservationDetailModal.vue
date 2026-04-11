<template>
  <UiModal
    :model-value="modelValue"
    :title="`Reservation #${reservationId}`"
    :subtitle="reservation ? `${reservation.guestName} · ${fmtDate(reservation.checkInDate)} → ${fmtDate(reservation.checkOutDate)}` : ''"
    size="xl"
    :close-on-backdrop="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- Loading skeleton -->
    <div v-if="loadingDetail" class="flex items-center justify-center py-16">
      <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
    </div>

    <template v-else-if="reservation">
      <!-- Status bar -->
      <div class="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
        <span
          class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="statusClass(reservation.status)"
        >
          <span class="h-1.5 w-1.5 rounded-full" :class="statusDot(reservation.status)" />
          {{ reservation.status }}
        </span>
        <span
          class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
          :class="paymentClass(reservation.paymentStatus)"
        >
          {{ reservation.paymentStatus }}
        </span>
        <div class="ml-auto flex flex-wrap gap-2">
          <button
            v-if="reservation.status === 'CONFIRMED'"
            :disabled="store.submitting"
            class="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
            @click="doAction('checkIn')"
          >Check In</button>
          <button
            v-if="reservation.status === 'CHECKED_IN'"
            :disabled="store.submitting"
            class="rounded-lg bg-purple-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-purple-700 disabled:opacity-50"
            @click="doAction('checkOut')"
          >Check Out</button>
          <button
            v-if="reservation.status === 'CONFIRMED' || reservation.status === 'CHECKED_IN'"
            :disabled="store.submitting"
            class="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600 disabled:opacity-50"
            @click="doAction('cancel')"
          >Cancel</button>
        </div>
      </div>

      <!-- Action error -->
      <AuthFormAlert :message="actionError" class="mb-4" />

      <!-- Tabs -->
      <div class="mb-5 border-b border-gray-200">
        <nav class="flex gap-5">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex items-center gap-1.5 border-b-2 pb-3 text-sm font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-primary-500 text-primary-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'"
            @click="onTabChange(tab.key)"
          >
            {{ tab.label }}
            <span
              v-if="tab.key === 'services' && reservation.serviceUsages.length > 0"
              class="rounded-full px-1.5 py-0.5 text-xs"
              :class="activeTab === 'services' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-500'"
            >{{ reservation.serviceUsages.length }}</span>
          </button>
        </nav>
      </div>

      <!-- ── Overview tab ──────────────────────────────────────────────────── -->
      <div v-if="activeTab === 'overview'">
        <!-- Summary cards -->
        <div class="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div class="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p class="text-xs text-gray-400">Nights</p>
            <p class="mt-0.5 text-xl font-bold text-gray-900">{{ reservation.nights }}</p>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p class="text-xs text-gray-400">Total</p>
            <p class="mt-0.5 text-xl font-bold text-gray-900">{{ fmtCurrency(reservation.totalAmount) }}</p>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p class="text-xs text-gray-400">Paid</p>
            <p class="mt-0.5 text-xl font-bold text-green-600">{{ fmtCurrency(reservation.paidAmount) }}</p>
          </div>
          <div class="rounded-xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <p class="text-xs text-gray-400">Balance</p>
            <p class="mt-0.5 text-xl font-bold" :class="reservation.balanceAmount > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ fmtCurrency(reservation.balanceAmount) }}
            </p>
          </div>
        </div>

        <!-- Notes -->
        <div v-if="reservation.notes" class="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <span class="font-medium">Notes: </span>{{ reservation.notes }}
        </div>

        <!-- Rooms table -->
        <div class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full min-w-[560px]">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Room</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Type</th>
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Promotion</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Base</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Discount</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Final</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="r in reservation.rooms" :key="r.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ r.roomNumber }}</td>
                <td class="px-4 py-3 text-sm text-gray-600">{{ r.roomTypeName }}</td>
                <td class="px-4 py-3 text-sm text-gray-500">{{ r.promotionName || '—' }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-700">{{ fmtCurrency(r.basePrice) }}</td>
                <td class="px-4 py-3 text-right text-sm text-red-500">
                  {{ r.discountAmount > 0 ? `-${fmtCurrency(r.discountAmount)}` : '—' }}
                </td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900">{{ fmtCurrency(r.finalPrice) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ── Services tab ──────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'services'">
        <!-- Add service (CHECKED_IN only) -->
        <div
          v-if="reservation.status === 'CHECKED_IN'"
          class="mb-4 rounded-xl border border-gray-200 p-4"
        >
          <p class="mb-3 text-sm font-medium text-gray-700">Add Service</p>
          <AuthFormAlert :message="serviceError" class="mb-3" />
          <div class="flex flex-wrap gap-3">
            <select
              v-model="svcForm.serviceId"
              class="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option :value="undefined">— Select service —</option>
              <option v-for="s in servicesStore.items" :key="s.id" :value="s.id">
                {{ s.name }} (${{ s.price }})
              </option>
            </select>
            <input
              v-model.number="svcForm.quantity"
              type="number"
              min="1"
              placeholder="Qty"
              class="w-24 rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              :disabled="store.submitting"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
              @click="addService"
            >Add</button>
          </div>
        </div>
        <div v-else class="mb-4 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Services can only be added when the reservation is Checked In.
        </div>

        <!-- Service usage list -->
        <div v-if="reservation.serviceUsages.length > 0" class="overflow-hidden rounded-xl border border-gray-200">
          <table class="w-full">
            <thead>
              <tr class="border-b border-gray-100 bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Service</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Qty</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Unit</th>
                <th class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Total</th>
                <th class="px-4 py-3" />
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="u in reservation.serviceUsages" :key="u.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 text-sm font-medium text-gray-900">{{ u.serviceName }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600">{{ u.quantity }}</td>
                <td class="px-4 py-3 text-right text-sm text-gray-600">{{ fmtCurrency(u.unitPrice) }}</td>
                <td class="px-4 py-3 text-right text-sm font-semibold text-gray-900">{{ fmtCurrency(u.totalPrice) }}</td>
                <td class="px-4 py-3 text-right">
                  <button
                    v-if="reservation.status === 'CHECKED_IN'"
                    :disabled="store.submitting"
                    class="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                    @click="removeService(u.id)"
                  >
                    <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="border-t border-gray-200 bg-gray-50">
                <td colspan="3" class="px-4 py-3 text-right text-sm font-semibold text-gray-700">Service Total</td>
                <td class="px-4 py-3 text-right text-sm font-bold text-gray-900">{{ fmtCurrency(reservation.serviceChargeTotal) }}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div v-else class="rounded-xl border border-dashed border-gray-200 py-10 text-center text-sm text-gray-400">
          No services added yet.
        </div>
      </div>

      <!-- ── Payment tab ────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'payment'">
        <!-- Summary -->
        <div class="mb-5 grid grid-cols-3 gap-3">
          <div class="rounded-xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <p class="text-xs text-gray-400">Total Amount</p>
            <p class="mt-1 text-lg font-bold text-gray-900">{{ fmtCurrency(reservation.totalAmount) }}</p>
          </div>
          <div class="rounded-xl border border-green-100 bg-green-50 p-4 text-center">
            <p class="text-xs text-green-600">Paid</p>
            <p class="mt-1 text-lg font-bold text-green-700">{{ fmtCurrency(reservation.paidAmount) }}</p>
          </div>
          <div class="rounded-xl border p-4 text-center" :class="reservation.balanceAmount > 0 ? 'border-red-100 bg-red-50' : 'border-gray-100 bg-white'">
            <p class="text-xs" :class="reservation.balanceAmount > 0 ? 'text-red-500' : 'text-gray-400'">Balance</p>
            <p class="mt-1 text-lg font-bold" :class="reservation.balanceAmount > 0 ? 'text-red-600' : 'text-gray-400'">
              {{ fmtCurrency(reservation.balanceAmount) }}
            </p>
          </div>
        </div>

        <!-- Add payment -->
        <div v-if="reservation.balanceAmount > 0" class="rounded-xl border border-gray-200 p-4">
          <p class="mb-3 text-sm font-medium text-gray-700">Add Payment</p>
          <AuthFormAlert :message="paymentError" class="mb-3" />
          <div class="flex gap-3">
            <div class="relative flex-1">
              <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-400">$</span>
              <input
                v-model.number="paymentAmount"
                type="number"
                min="0.01"
                :max="reservation.balanceAmount"
                step="0.01"
                placeholder="0.00"
                class="block w-full rounded-xl border border-gray-200 py-2.5 pl-8 pr-3.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <button
              :disabled="store.submitting || !paymentAmount || paymentAmount <= 0"
              class="rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-700 disabled:opacity-50"
              @click="doPayment"
            >Pay</button>
          </div>
          <button
            type="button"
            class="mt-2 text-xs text-primary-500 hover:underline"
            @click="paymentAmount = reservation.balanceAmount"
          >Pay full balance ({{ fmtCurrency(reservation.balanceAmount) }})</button>
        </div>
        <div v-else class="rounded-xl border border-green-100 bg-green-50 px-4 py-3 text-sm text-green-700">
          Payment complete. No balance remaining.
        </div>
      </div>

      <!-- ── Invoice tab ────────────────────────────────────────────────────── -->
      <div v-else-if="activeTab === 'invoice'">
        <div v-if="loadingInvoice" class="flex items-center justify-center py-10">
          <svg class="h-7 w-7 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
        <div v-else-if="invoiceError" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {{ invoiceError }}
        </div>
        <div v-else-if="invoice" class="space-y-4">
          <!-- Header -->
          <div class="rounded-xl border border-gray-200 p-5">
            <div class="flex items-start justify-between">
              <div>
                <h4 class="text-lg font-bold text-gray-900">Invoice</h4>
                <p class="text-sm text-gray-500">Reservation #{{ invoice.reservationId }}</p>
              </div>
              <div class="text-right text-sm text-gray-500">
                <p>Generated: {{ fmtDate(invoice.generatedAt) }}</p>
                <p>Status: <span class="font-semibold text-gray-900">{{ invoice.reservationStatus }}</span></p>
              </div>
            </div>
            <div class="mt-4 grid grid-cols-2 gap-4 border-t border-gray-100 pt-4 text-sm">
              <div>
                <p class="font-medium text-gray-700">Guest</p>
                <p class="text-gray-900">{{ invoice.guestName }}</p>
                <p class="text-gray-500">{{ invoice.guestEmail }}</p>
                <p class="text-gray-500">{{ invoice.guestPhone }}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-700">Stay</p>
                <p class="text-gray-900">{{ fmtDate(invoice.checkInDate) }} → {{ fmtDate(invoice.checkOutDate) }}</p>
                <p class="text-gray-500">{{ invoice.nights }} night{{ invoice.nights !== 1 ? 's' : '' }}</p>
              </div>
            </div>
          </div>

          <!-- Room charges -->
          <div v-if="invoice.roomCharges.length > 0" class="overflow-hidden rounded-xl border border-gray-200">
            <div class="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Room Charges
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="r in invoice.roomCharges" :key="r.roomNumber" class="px-4">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900">{{ r.roomNumber }} — {{ r.roomTypeName }}</p>
                    <p v-if="r.promotionName" class="text-xs text-primary-600">{{ r.promotionName }}</p>
                  </td>
                  <td class="px-4 py-3 text-gray-500">{{ r.nights }}n × {{ fmtCurrency(r.ratePerNight) }}</td>
                  <td class="px-4 py-3 text-right">
                    <p>{{ fmtCurrency(r.basePrice) }}</p>
                    <p v-if="r.discountAmount > 0" class="text-xs text-red-500">-{{ fmtCurrency(r.discountAmount) }}</p>
                    <p class="font-semibold">{{ fmtCurrency(r.finalPrice) }}</p>
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200 bg-gray-50">
                  <td colspan="2" class="px-4 py-2.5 text-right text-sm font-semibold text-gray-700">Room Total</td>
                  <td class="px-4 py-2.5 text-right text-sm font-bold text-gray-900">{{ fmtCurrency(invoice.roomChargeTotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Service charges -->
          <div v-if="invoice.serviceCharges.length > 0" class="overflow-hidden rounded-xl border border-gray-200">
            <div class="border-b border-gray-100 bg-gray-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Service Charges
            </div>
            <table class="w-full text-sm">
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in invoice.serviceCharges" :key="s.serviceName">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.serviceName }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ s.quantity }} × {{ fmtCurrency(s.unitPrice) }}</td>
                  <td class="px-4 py-3 text-right font-semibold text-gray-900">{{ fmtCurrency(s.totalPrice) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-gray-200 bg-gray-50">
                  <td colspan="2" class="px-4 py-2.5 text-right text-sm font-semibold text-gray-700">Service Total</td>
                  <td class="px-4 py-2.5 text-right text-sm font-bold text-gray-900">{{ fmtCurrency(invoice.serviceChargeTotal) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Final summary -->
          <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
            <div class="space-y-2 text-sm">
              <div class="flex justify-between text-gray-700">
                <span>Total Amount</span>
                <span class="font-bold text-gray-900 text-base">{{ fmtCurrency(invoice.totalAmount) }}</span>
              </div>
              <div class="flex justify-between text-green-600">
                <span>Paid</span>
                <span class="font-semibold">{{ fmtCurrency(invoice.paidAmount) }}</span>
              </div>
              <div class="flex justify-between border-t border-gray-200 pt-2" :class="invoice.balanceAmount > 0 ? 'text-red-600' : 'text-gray-400'">
                <span>Balance</span>
                <span class="font-semibold">{{ fmtCurrency(invoice.balanceAmount) }}</span>
              </div>
            </div>
            <div class="mt-3 text-center">
              <span
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset"
                :class="paymentClass(invoice.paymentStatus)"
              >
                {{ invoice.paymentStatus }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { ReservationResponse, InvoiceResponse } from '~/types/api'

const props = defineProps<{
  modelValue:    boolean
  reservationId: number | null
  initialTab?:   'overview' | 'services' | 'payment' | 'invoice'
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const store         = useReservationsStore()
const servicesStore = useServicesStore()

const reservation   = ref<ReservationResponse | null>(null)
const loadingDetail = ref(false)
const actionError   = ref<string | null>(null)

// ── Tabs ──────────────────────────────────────────────────────────────────────
const activeTab = ref<'overview' | 'services' | 'payment' | 'invoice'>('overview')
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'services', label: 'Services' },
  { key: 'payment',  label: 'Payment' },
  { key: 'invoice',  label: 'Invoice' },
] as const

// ── Invoice ───────────────────────────────────────────────────────────────────
const invoice        = ref<InvoiceResponse | null>(null)
const loadingInvoice = ref(false)
const invoiceError   = ref<string | null>(null)

async function loadInvoice() {
  if (!props.reservationId || invoice.value) return
  loadingInvoice.value = true
  invoiceError.value   = null
  try {
    invoice.value = await store.getInvoice(props.reservationId)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    invoiceError.value = e?.data?.message || e?.message || 'Failed to load invoice'
  } finally {
    loadingInvoice.value = false
  }
}

function onTabChange(tab: typeof activeTab.value) {
  activeTab.value = tab
  if (tab === 'invoice') loadInvoice()
}

// ── Load reservation ──────────────────────────────────────────────────────────
async function loadReservation() {
  if (!props.reservationId) return
  loadingDetail.value = true
  actionError.value   = null
  try {
    reservation.value = await store.fetchById(props.reservationId)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message || e?.message || 'Failed to load reservation'
  } finally {
    loadingDetail.value = false
  }
}

watch(() => props.modelValue, async (v) => {
  if (v) {
    activeTab.value   = props.initialTab ?? 'overview'
    reservation.value = null
    invoice.value     = null
    actionError.value = null
    await Promise.all([
      loadReservation(),
      servicesStore.fetchAll(),
    ])
    if (activeTab.value === 'invoice') loadInvoice()
  }
})

// ── Status actions ─────────────────────────────────────────────────────────────
async function doAction(action: 'checkIn' | 'checkOut' | 'cancel') {
  if (!props.reservationId) return
  actionError.value = null
  try {
    reservation.value = await store[action](props.reservationId)
    invoice.value     = null  // reset so invoice is re-fetched
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message || e?.message || 'Action failed'
  }
}

// ── Services ──────────────────────────────────────────────────────────────────
const serviceError = ref<string | null>(null)
const svcForm = reactive({ serviceId: undefined as number | undefined, quantity: 1 })

async function addService() {
  if (!svcForm.serviceId || !props.reservationId) return
  serviceError.value = null
  try {
    await store.addServiceUsage({
      reservationId: props.reservationId,
      serviceId:     svcForm.serviceId,
      quantity:      svcForm.quantity || 1,
    })
    svcForm.serviceId = undefined
    svcForm.quantity  = 1
    reservation.value = await store.fetchById(props.reservationId)
    invoice.value     = null
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    serviceError.value = e?.data?.message || e?.message || 'Failed to add service'
  }
}

async function removeService(usageId: number) {
  if (!props.reservationId) return
  actionError.value = null
  try {
    await store.removeServiceUsage(usageId)
    reservation.value = await store.fetchById(props.reservationId)
    invoice.value     = null
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    actionError.value = e?.data?.message || e?.message || 'Failed to remove service'
  }
}

// ── Payment ───────────────────────────────────────────────────────────────────
const paymentAmount = ref<number | null>(null)
const paymentError  = ref<string | null>(null)

async function doPayment() {
  if (!props.reservationId || !paymentAmount.value || paymentAmount.value <= 0) return
  paymentError.value = null
  try {
    reservation.value = await store.addPayment(props.reservationId, paymentAmount.value)
    paymentAmount.value = null
    invoice.value       = null
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    paymentError.value = e?.data?.message || e?.message || 'Payment failed'
  }
}

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n)
}

function statusClass(s: string) {
  if (s === 'CONFIRMED')   return 'bg-blue-50   text-blue-700   ring-blue-200'
  if (s === 'CHECKED_IN')  return 'bg-green-50  text-green-700  ring-green-200'
  if (s === 'CHECKED_OUT') return 'bg-purple-50 text-purple-700 ring-purple-200'
  if (s === 'CANCELLED')   return 'bg-red-50    text-red-700    ring-red-200'
  return 'bg-gray-100 text-gray-600 ring-gray-200'
}

function statusDot(s: string) {
  if (s === 'CONFIRMED')   return 'bg-blue-500'
  if (s === 'CHECKED_IN')  return 'bg-green-500'
  if (s === 'CHECKED_OUT') return 'bg-purple-500'
  if (s === 'CANCELLED')   return 'bg-red-500'
  return 'bg-gray-400'
}

function paymentClass(s: string) {
  if (s === 'PAID')    return 'bg-green-50  text-green-700  ring-green-200'
  if (s === 'PARTIAL') return 'bg-amber-50  text-amber-700  ring-amber-200'
  return 'bg-red-50 text-red-700 ring-red-200'
}
</script>
