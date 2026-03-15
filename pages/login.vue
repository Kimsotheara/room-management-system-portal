<template>
  <div>
    <!-- Heading -->
    <div class="mb-6 sm:mb-8">
      <h2 class="text-xl font-bold text-gray-900 sm:text-2xl">Welcome back</h2>
      <p class="mt-1 text-sm text-gray-500">Sign in to your account to continue</p>
    </div>

    <!-- Error alert -->
    <AuthFormAlert :message="authStore.error" class="mb-5" />

    <!-- Login form -->
    <form class="space-y-4 sm:space-y-5" @submit.prevent="handleLogin">

      <!-- Username -->
      <AuthFormInput
        id="username"
        v-model="form.username"
        label="Username"
        type="text"
        autocomplete="username"
        placeholder="Enter your username"
        required
        :error="errors.username"
        @input="errors.username = ''"
      >
        <template #icon>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </template>
      </AuthFormInput>

      <!-- Password -->
      <AuthFormInput
        id="password"
        v-model="form.password"
        label="Password"
        type="password"
        autocomplete="current-password"
        placeholder="Enter your password"
        required
        :error="errors.password"
        @input="errors.password = ''"
      >
        <template #icon>
          <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </template>
      </AuthFormInput>

      <!-- Remember me / Forgot password -->
      <div class="flex items-center justify-between">
        <label class="flex cursor-pointer select-none items-center gap-2">
          <input
            v-model="form.rememberMe"
            type="checkbox"
            class="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 transition-colors"
          />
          <span class="text-sm text-gray-600">Remember me</span>
        </label>
        <a
          href="#"
          class="text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          Forgot password?
        </a>
      </div>

      <!-- Submit -->
      <div class="pt-1">
        <AuthFormButton
          label="Sign In"
          loading-label="Signing in..."
          :loading="authStore.isLoading"
        >
          <template #icon>
            <svg class="h-4 w-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </template>
        </AuthFormButton>
      </div>
    </form>

    <!-- Demo credentials -->
    <div class="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 sm:mt-8">
      <p class="mb-2 text-xs font-semibold text-blue-700">Demo Credentials</p>
      <div class="space-y-1.5">
        <p class="text-xs text-blue-600">
          Username:&nbsp;
          <code class="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-800">admin</code>
        </p>
        <p class="text-xs text-blue-600">
          Password:&nbsp;
          <code class="rounded bg-blue-100 px-1.5 py-0.5 font-mono text-blue-800">admin123</code>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: 'auth',
})

const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  rememberMe: false,
})

const errors = reactive({
  username: '',
  password: '',
})

function validate() {
  let valid = true
  if (!form.username.trim()) {
    errors.username = 'Username is required'
    valid = false
  }
  if (!form.password) {
    errors.password = 'Password is required'
    valid = false
  } else if (form.password.length < 4) {
    errors.password = 'Password must be at least 4 characters'
    valid = false
  }
  return valid
}

async function handleLogin() {
  if (!validate()) return

  const result = await authStore.login({
    username: form.username,
    password: form.password,
    deviceName: 'Web Browser',
    deviceType: 'WEB',
  })

  if (result.success) {
    navigateTo('/dashboard')
  }
}
</script>
