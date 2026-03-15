<template>
  <UiModal
    :model-value="modelValue"
    :title="`Manage Roles`"
    :subtitle="user ? `@${user.username}` : ''"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- API error -->
    <AuthFormAlert :message="apiError" class="mb-4" />

    <!-- Current roles -->
    <div class="mb-5">
      <p class="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">Assigned Roles</p>
      <div v-if="currentRoles.length" class="flex flex-wrap gap-2">
        <div
          v-for="role in currentRoles"
          :key="role.roleId"
          class="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-1.5 text-sm font-medium text-primary-700 ring-1 ring-primary-200"
        >
          <span>{{ role.roleName }}</span>
          <button
            type="button"
            :disabled="removing === role.roleId"
            class="flex h-4 w-4 items-center justify-center rounded-full text-primary-400 transition-colors hover:bg-primary-200 hover:text-primary-700 disabled:opacity-40"
            @click="handleRemoveRole(role.roleId)"
          >
            <svg v-if="removing === role.roleId" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <p v-else class="text-sm text-gray-400 italic">No roles assigned</p>
    </div>

    <!-- Add role -->
    <div class="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Add Role</p>
      <div class="flex gap-2">
        <select
          v-model="selectedRoleId"
          class="flex-1 rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="">Select a role…</option>
          <option
            v-for="role in availableRoles"
            :key="role.roleId"
            :value="role.roleId"
          >
            {{ role.roleName }}
          </option>
        </select>
        <button
          type="button"
          :disabled="!selectedRoleId || assigning"
          class="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50"
          @click="handleAssignRole"
        >
          <svg v-if="assigning" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <svg v-else class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add
        </button>
      </div>
    </div>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none"
        @click="emit('update:modelValue', false)"
      >
        Done
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { UserResponse, RoleResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  user: UserResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  updated: []
}>()

const usersStore = useUsersStore()
const rolesStore = useRolesStore()

const apiError = ref<string | null>(null)
const selectedRoleId = ref<number | ''>('')
const assigning = ref(false)
const removing = ref<number | null>(null)

// Local copy so we can update UI without re-fetching
const currentRoles = ref<RoleResponse[]>([])

watch(() => props.user, (u) => {
  currentRoles.value = u ? [...u.roles] : []
  selectedRoleId.value = ''
  apiError.value = null
}, { immediate: true })

watch(() => props.modelValue, async (v) => {
  if (v && !rolesStore.items.length) await rolesStore.fetchAll()
})

// Roles not yet assigned to the user
const availableRoles = computed(() =>
  rolesStore.items.filter(
    r => r.isActive && !currentRoles.value.some(cr => cr.roleId === r.roleId)
  )
)

async function handleAssignRole() {
  if (!selectedRoleId.value || !props.user) return
  apiError.value = null
  assigning.value = true
  try {
    const updated = await usersStore.assignRole(props.user.userId, {
      roleId: selectedRoleId.value as number,
    })
    currentRoles.value = updated.roles ? [...updated.roles] : currentRoles.value
    selectedRoleId.value = ''
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'Failed to assign role'
  } finally {
    assigning.value = false
  }
}

async function handleRemoveRole(roleId: number) {
  if (!props.user) return
  apiError.value = null
  removing.value = roleId
  try {
    const updated = await usersStore.removeRole(props.user.userId, roleId)
    currentRoles.value = updated.roles ? [...updated.roles] : currentRoles.value.filter(r => r.roleId !== roleId)
    emit('updated')
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'Failed to remove role'
  } finally {
    removing.value = null
  }
}
</script>
