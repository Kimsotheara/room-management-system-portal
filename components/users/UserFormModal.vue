<template>
  <UiModal
    :model-value="modelValue"
    :title="isEdit ? 'Edit User' : 'Create User'"
    :subtitle="isEdit ? `Updating @${user?.username}` : 'Fill in the details below'"
    size="md"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <!-- API error -->
    <AuthFormAlert :message="apiError" class="mb-5" />

    <form class="space-y-4" @submit.prevent="handleSubmit">
      <!-- Create-only fields -->
      <template v-if="!isEdit">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Username <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.username"
              type="text"
              placeholder="e.g. john.doe"
              autocomplete="off"
              class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
              :class="errors.username ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
              @input="errors.username = ''"
            />
            <p v-if="errors.username" class="mt-1 text-xs text-red-500">{{ errors.username }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.password"
              type="password"
              placeholder="Min 8 characters"
              autocomplete="new-password"
              class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
              :class="errors.password ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
              @input="errors.password = ''"
            />
            <p v-if="errors.password" class="mt-1 text-xs text-red-500">{{ errors.password }}</p>
          </div>
        </div>
      </template>

      <!-- Shared fields -->
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1.5">
          Email <span v-if="!isEdit" class="text-red-500">*</span>
        </label>
        <input
          v-model="form.email"
          type="email"
          placeholder="user@example.com"
          class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2"
          :class="errors.email ? 'border-red-400 focus:ring-red-400' : 'focus:ring-primary-500'"
          @input="errors.email = ''"
        />
        <p v-if="errors.email" class="mt-1 text-xs text-red-500">{{ errors.email }}</p>
      </div>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
          <input
            v-model="form.fullName"
            type="text"
            placeholder="John Doe"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
          <input
            v-model="form.phoneNumber"
            type="tel"
            placeholder="+1 555 000 0000"
            class="block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm placeholder-gray-400 shadow-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      <!-- Active toggle (edit only) -->
      <div v-if="isEdit" class="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3">
        <div>
          <p class="text-sm font-medium text-gray-900">Account Active</p>
          <p class="text-xs text-gray-500">Disabled accounts cannot log in</p>
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
        :disabled="usersStore.submitting"
        class="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        @click="handleSubmit"
      >
        <svg v-if="usersStore.submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        {{ usersStore.submitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create User') }}
      </button>
    </template>
  </UiModal>
</template>

<script setup lang="ts">
import type { UserResponse } from '~/types/api'

const props = defineProps<{
  modelValue: boolean
  user?: UserResponse | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  saved: []
}>()

const usersStore = useUsersStore()

const isEdit = computed(() => !!props.user)
const apiError = ref<string | null>(null)

const form = reactive({
  username: '',
  password: '',
  email: '',
  fullName: '',
  phoneNumber: '',
  isActive: true,
})

const errors = reactive({
  username: '',
  password: '',
  email: '',
})

function resetForm() {
  apiError.value = null
  Object.assign(errors, { username: '', password: '', email: '' })
  if (props.user) {
    form.username = props.user.username
    form.email = props.user.email || ''
    form.fullName = props.user.fullName || ''
    form.phoneNumber = props.user.phoneNumber || ''
    form.isActive = props.user.isActive
    form.password = ''
  } else {
    Object.assign(form, { username: '', password: '', email: '', fullName: '', phoneNumber: '', isActive: true })
  }
}

watch(() => props.modelValue, (v) => { if (v) resetForm() })

function validate() {
  let ok = true
  if (!isEdit.value) {
    if (!form.username.trim() || form.username.length < 3) {
      errors.username = 'Username must be at least 3 characters'
      ok = false
    }
    if (!form.password || form.password.length < 8) {
      errors.password = 'Password must be at least 8 characters'
      ok = false
    }
    if (!form.email.trim()) {
      errors.email = 'Email is required'
      ok = false
    }
  }
  return ok
}

async function handleSubmit() {
  if (!validate()) return
  apiError.value = null
  try {
    if (isEdit.value && props.user) {
      await usersStore.update(props.user.userId, {
        email: form.email,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
        isActive: form.isActive,
      })
    } else {
      await usersStore.create({
        username: form.username,
        password: form.password,
        email: form.email,
        fullName: form.fullName,
        phoneNumber: form.phoneNumber,
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
