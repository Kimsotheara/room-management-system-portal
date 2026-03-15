<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-gray-900">Settings</h1>
      <p class="text-sm text-gray-500 mt-1">Manage your account and preferences</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Profile section -->
      <div class="lg:col-span-2 space-y-6">
        <div class="card p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Profile Information</h2>
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {{ authStore.userInitials }}
            </div>
            <div>
              <button class="btn-secondary text-sm">Change Avatar</button>
              <p class="text-xs text-gray-400 mt-1">JPG, PNG, GIF max 2MB</p>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                :value="authStore.user?.fullName"
                type="text"
                class="input-field"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Username</label>
              <input
                :value="authStore.user?.username"
                type="text"
                class="input-field"
                disabled
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                :value="authStore.user?.email"
                type="email"
                class="input-field"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div class="flex justify-end mt-4">
            <button class="btn-primary">Save Changes</button>
          </div>
        </div>

        <!-- Security section -->
        <div class="card p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Security</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
              <input type="password" class="input-field" placeholder="••••••••" />
            </div>
          </div>
          <div class="flex justify-end mt-4">
            <button class="btn-primary">Update Password</button>
          </div>
        </div>
      </div>

      <!-- Account info sidebar -->
      <div class="space-y-4">
        <div class="card p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Account Details</h2>
          <div class="space-y-3">
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">User ID</p>
              <p class="text-sm font-medium text-gray-700">#{{ authStore.user?.userId }}</p>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Status</p>
              <span class="badge badge-success">Active</span>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-2">Roles</p>
              <div class="flex flex-wrap gap-1">
                <span
                  v-for="role in authStore.user?.roles"
                  :key="role"
                  class="badge badge-info"
                >{{ role }}</span>
              </div>
            </div>
            <div>
              <p class="text-xs text-gray-400 uppercase tracking-wider mb-1">Permissions</p>
              <p class="text-sm font-medium text-gray-700">{{ authStore.user?.permissionCodes?.length || 0 }} granted</p>
            </div>
          </div>
        </div>

        <div class="card p-6">
          <h2 class="text-base font-semibold text-gray-900 mb-4">Danger Zone</h2>
          <p class="text-sm text-gray-500 mb-4">Once you deactivate your account, you won't be able to log in.</p>
          <button class="btn-danger w-full text-sm py-2">
            Deactivate Account
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'default',
  middleware: 'auth',
})

const authStore = useAuthStore()
</script>
