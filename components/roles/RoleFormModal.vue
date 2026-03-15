<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit Role' : 'Create Role'"
    :subtitle="isEdit ? `Updating ${role?.roleName}` : 'Fill in the details below'"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <AuthFormAlert :message="apiError" class="mb-5" />

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Role Name -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          Role Name <span class="text-red-500">*</span>
        </label>
        <input
          v-model="form.roleName"
          type="text"
          placeholder="e.g. MANAGER"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.roleName ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
          @input="errors.roleName = ''"
        />
        <p v-if="errors.roleName" class="mt-1 text-xs text-red-500">{{ errors.roleName }}</p>
      </div>

      <!-- Description -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
        <textarea
          v-model="form.roleDescription"
          rows="3"
          placeholder="Describe what this role can do…"
          class="block w-full resize-none rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Role Active</p>
          <p class="text-xs text-gray-500">Inactive roles cannot be assigned to users</p>
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
    </form>

    <template #footer>
      <button
        type="button"
        class="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        @click="emit('update:modelValue', false)"
      >
        Cancel
      </button>
      <button
        type="button"
        :disabled="rolesStore.submitting"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="rolesStore.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ rolesStore.submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Role') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { RoleResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  role?: RoleResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const rolesStore = useRolesStore()

const isEdit = computed(() => !!props.role)
const apiError = ref<string | null>(null)

const form = reactive({
  roleName: '',
  roleDescription: '',
  isActive: true,
})

const errors = reactive({ roleName: '' })

function resetForm() {
  apiError.value = null
  errors.roleName = ''
  if (props.role) {
    form.roleName = props.role.roleName
    form.roleDescription = props.role.roleDescription || ''
    form.isActive = props.role.isActive
  } else {
    Object.assign(form, { roleName: '', roleDescription: '', isActive: true })
  }
}

watch(() => props.modelValue, (v) => { if (v) resetForm() })

function validate() {
  if (!form.roleName.trim()) {
    errors.roleName = 'Role name is required'
    return false
  }
  return true
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    if (isEdit.value && props.role) {
      await rolesStore.update(props.role.roleId, {
        roleName: form.roleName,
        roleDescription: form.roleDescription,
        isActive: form.isActive,
      })
    } else {
      await rolesStore.create({
        roleName: form.roleName,
        roleDescription: form.roleDescription,
      })
    }
    emit('saved')
    emit('update:modelValue', false)
  } catch (err: unknown) {
    const e = err as { data?: { message?: string }; message?: string }
    apiError.value = e?.data?.message || e?.message || 'An error occurred'
  }
}
</script>
