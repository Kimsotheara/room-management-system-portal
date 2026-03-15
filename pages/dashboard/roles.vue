<template>
  <div class="space-y-6">

    <!-- Toast -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-2"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 -translate-y-2"
    >
      <div
        v-if="toast"
        class="fixed right-4 top-4 z-50 flex items-center gap-3 rounded-xl px-4 py-3 shadow-lg ring-1 sm:right-6 sm:top-6"
        :class="toast.type === 'success' ? 'bg-green-50 ring-green-200 text-green-800' : 'bg-red-50 ring-red-200 text-red-800'"
      >
        <svg class="h-5 w-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path v-if="toast.type === 'success'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p class="text-sm font-medium">{{ toast.message }}</p>
      </div>
    </Transition>

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Roles</h1>
        <p class="mt-1 text-sm text-gray-500">{{ filteredItems.length }} of {{ store.items.length }} roles</p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add Role
      </button>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="Search by name or description…"
          class="block w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3.5 text-sm placeholder-gray-400 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>
      <select
        v-model="filterStatus"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Status</option>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </select>
      <select
        v-model="pageSize"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option :value="10">10 / page</option>
        <option :value="25">25 / page</option>
        <option :value="50">50 / page</option>
      </select>
    </div>

    <!-- Table card -->
    <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      <div v-else-if="!pagedItems.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No roles found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterStatus ? 'Try adjusting your search or filters' : 'Create the first role to get started' }}
        </p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[540px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Description</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="role in pagedItems"
              :key="role.roleId"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-violet-100">
                    <svg class="h-4 w-4 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <span class="text-sm font-semibold text-gray-900">{{ role.roleName }}</span>
                </div>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500">
                <span class="line-clamp-1 max-w-xs">{{ role.roleDescription || '—' }}</span>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="role.isActive ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-100 text-gray-500 ring-gray-200'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="role.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ role.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-400">{{ formatDate(role.createdAt) }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit role"
                    @click="openEdit(role)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete role"
                    @click="openDelete(role)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="totalPages > 1" class="border-t border-gray-100 px-5 py-4">
        <UiPagination
          :page="currentPage"
          :total-pages="totalPages"
          :total="filteredItems.length"
          :page-size="pageSize"
          @change="currentPage = $event"
        />
      </div>
    </div>

    <!-- Modals -->
    <RolesRoleFormModal v-model="showForm" :role="selectedRole" @saved="onSaved" />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete Role"
      :message="`Delete '${selectedRole?.roleName}'?`"
      detail="Users with this role will have it removed."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { RoleResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth' })

const store = useRolesStore()

const keyword      = ref('')
const filterStatus = ref('')
const currentPage  = ref(0)
const pageSize     = ref(10)

const filteredItems = computed(() => {
  let items = store.items
  if (keyword.value.trim()) {
    const q = keyword.value.toLowerCase()
    items = items.filter(r =>
      r.roleName?.toLowerCase().includes(q) ||
      r.roleDescription?.toLowerCase().includes(q)
    )
  }
  if (filterStatus.value !== '') {
    const active = filterStatus.value === 'true'
    items = items.filter(r => r.isActive === active)
  }
  return items
})

const totalPages = computed(() => Math.max(1, Math.ceil(filteredItems.value.length / pageSize.value)))

const pagedItems = computed(() => {
  const from = currentPage.value * pageSize.value
  return filteredItems.value.slice(from, from + pageSize.value)
})

watch([keyword, filterStatus, pageSize], () => { currentPage.value = 0 })

const showForm    = ref(false)
const showDelete  = ref(false)
const selectedRole = ref<RoleResponse | null>(null)

const toast = ref<{ type: 'success' | 'error'; message: string } | null>(null)
let toastTimer: ReturnType<typeof setTimeout> | null = null

function showToast(type: 'success' | 'error', message: string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { type, message }
  toastTimer = setTimeout(() => { toast.value = null }, 3500)
}

function openCreate() { selectedRole.value = null; showForm.value = true }
function openEdit(r: RoleResponse) { selectedRole.value = r; showForm.value = true }
function openDelete(r: RoleResponse) { selectedRole.value = r; showDelete.value = true }

async function handleDelete() {
  if (!selectedRole.value) return
  try {
    await store.remove(selectedRole.value.roleId)
    showDelete.value = false
    showToast('success', 'Role deleted successfully')
    await store.fetchAll()
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    showToast('error', e?.data?.message || e?.message || 'Delete failed')
  }
}

function onSaved() {
  showToast('success', selectedRole.value ? 'Role updated' : 'Role created successfully')
  store.fetchAll()
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => store.fetchAll())
</script>
