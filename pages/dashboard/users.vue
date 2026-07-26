<template>
  <div class="space-y-6">

    <!-- Header -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Users</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ store.totalElements }} total users
        </p>
      </div>
      <button
        class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        v-if="can(PERM.USER.CREATE)" @click="openCreate"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Add User
      </button>
    </div>

    <!-- Filter bar -->
    <div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:flex-wrap">
      <div class="relative flex-1 min-w-48">
        <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          v-model="keyword"
          type="text"
          placeholder="Search by username…"
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
        v-model="filterRoleId"
        class="rounded-xl border border-gray-200 py-2.5 pl-3.5 pr-8 text-sm text-gray-700 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Roles</option>
        <option v-for="role in rolesStore.items" :key="role.roleId" :value="role.roleId">
          {{ role.roleName }}
        </option>
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
      <!-- Loading -->
      <div v-if="store.loading" class="flex items-center justify-center py-20">
        <svg class="h-8 w-8 animate-spin text-primary-500" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>

      <!-- Empty -->
      <div v-else-if="!store.items.length" class="flex flex-col items-center justify-center py-16 text-center">
        <div class="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
          <svg class="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p class="text-sm font-medium text-gray-900">No users found</p>
        <p class="mt-1 text-sm text-gray-500">
          {{ keyword || filterStatus || filterRoleId ? 'Try adjusting your search or filters' : 'Create the first user to get started' }}
        </p>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full min-w-[640px]">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50">
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Phone</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Roles</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
              <th class="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Created</th>
              <th class="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            <tr
              v-for="user in store.items"
              :key="user.userId"
              class="transition-colors hover:bg-gray-50"
            >
              <td class="px-5 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                    :class="avatarColor(user.userId)"
                  >
                    {{ initials(user.fullName || user.username) }}
                  </div>
                  <div class="min-w-0">
                    <p class="truncate text-sm font-medium text-gray-900">{{ user.fullName || '—' }}</p>
                    <p class="truncate text-xs text-gray-400">{{ user.email }}</p>
                    <p class="truncate text-xs text-gray-300">@{{ user.username }}</p>
                  </div>
                </div>
              </td>
              <td class="px-5 py-4 text-sm text-gray-500">{{ user.phoneNumber || '—' }}</td>
              <td class="px-5 py-4">
                <div class="flex flex-wrap gap-1">
                  <span
                    v-for="role in user.roles"
                    :key="role.roleId"
                    class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-200"
                  >
                    {{ role.roleName }}
                  </span>
                  <span v-if="!user.roles?.length" class="text-xs text-gray-300">—</span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span
                  class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
                  :class="user.isActive ? 'bg-green-50 text-green-700 ring-green-200' : 'bg-gray-100 text-gray-500 ring-gray-200'"
                >
                  <span class="h-1.5 w-1.5 rounded-full" :class="user.isActive ? 'bg-green-500' : 'bg-gray-400'" />
                  {{ user.isActive ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm text-gray-400">{{ formatDate(user.createdAt) }}</td>
              <td class="px-5 py-4">
                <div class="flex items-center justify-end gap-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-primary-50 hover:text-primary-600"
                    title="Edit user"
                    v-if="can(PERM.USER.UPDATE)" @click="openEdit(user)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-violet-50 hover:text-violet-600"
                    title="Manage roles"
                    @click="openAssignRole(user)"
                  >
                    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </button>
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title="Delete user"
                    v-if="can(PERM.USER.DELETE)" @click="openDelete(user)"
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

      <!-- Pagination -->
      <div v-if="store.totalPages > 1" class="border-t border-gray-100 px-5 py-4">
        <UiPagination
          :page="currentPage"
          :total-pages="store.totalPages"
          :total="store.totalElements"
          :page-size="pageSize"
          @change="onPageChange"
        />
      </div>
    </div>

    <!-- Modals -->
    <UsersUserFormModal v-model="showForm" :user="selectedUser" @saved="onSaved" />
    <UsersAssignRoleModal v-model="showAssignRole" :user="selectedUser" @updated="loadUsers()" />
    <UiConfirmDialog
      v-model="showDelete"
      title="Delete User"
      :message="`Delete '${selectedUser?.fullName || selectedUser?.username}'?`"
      detail="This will deactivate the account."
      confirm-label="Delete"
      :loading="store.submitting"
      @confirm="handleDelete"
    />
  </div>
</template>

<script setup lang="ts">
import type { UserResponse } from '~/types/api'

definePageMeta({ layout: 'default', middleware: 'auth', permission: 'USER_READ' })

const { can } = usePermissions()

const store      = useUsersStore()
const rolesStore = useRolesStore()

// Filters
const keyword      = ref('')
const filterStatus = ref('')
const filterRoleId = ref<number | ''>('')
const currentPage  = ref(0)   // 0-indexed for UiPagination
const pageSize     = ref(10)

function buildFilter() {
  return {
    username: keyword.value.trim() || undefined,
    isActive: filterStatus.value === 'true' ? true : filterStatus.value === 'false' ? false : undefined,
    roleId: filterRoleId.value || undefined,
  }
}

function loadUsers() {
  store.fetchPage({
    filter: buildFilter(),
    pageNumber: currentPage.value + 1,   // convert to 1-based
    size: pageSize.value,
  })
}

function onPageChange(page: number) {
  currentPage.value = page
  loadUsers()
}

// Debounced reload on filter changes
let debounceTimer: ReturnType<typeof setTimeout> | null = null
watch([keyword, filterStatus, filterRoleId, pageSize], () => {
  currentPage.value = 0
  if (debounceTimer) clearTimeout(debounceTimer)
  debounceTimer = setTimeout(loadUsers, 400)
})

// Modal state
const showForm       = ref(false)
const showAssignRole = ref(false)
const showDelete     = ref(false)
const selectedUser   = ref<UserResponse | null>(null)

const { showToast } = useToast()

function openCreate() { selectedUser.value = null; showForm.value = true }
function openEdit(u: UserResponse) { selectedUser.value = u; showForm.value = true }
function openAssignRole(u: UserResponse) { selectedUser.value = u; showAssignRole.value = true }
function openDelete(u: UserResponse) { selectedUser.value = u; showDelete.value = true }

async function handleDelete() {
  if (!selectedUser.value) return
  try {
    await store.remove(selectedUser.value.userId)
    showDelete.value = false
    showToast('success', 'User deleted successfully')
    loadUsers()
  } catch (err: unknown) {
    showToast('error', getApiError(err, 'Delete failed'))
  }
}

function onSaved() {
  showToast('success', selectedUser.value ? 'User updated' : 'User created successfully')
  loadUsers()
}

// Helpers
function initials(name: string) {
  return name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?'
}

const AVATAR_COLORS = [
  'bg-violet-100 text-violet-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-indigo-100 text-indigo-700',
]

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function formatDate(iso: string) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

onMounted(() => {
  rolesStore.fetchAll()
  loadUsers()
})
</script>
