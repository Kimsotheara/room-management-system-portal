<template>
  <div class="min-h-screen lg:flex">

    <!-- ─── Left Panel · Branding (lg+) ─────────────────────────────────── -->
    <aside
      class="hidden lg:flex lg:w-[44%] xl:w-2/5 flex-col justify-between
             bg-gradient-to-br from-primary-950 via-primary-900 to-primary-800
             relative overflow-hidden p-10 xl:p-14"
    >
      <!-- Decorative blobs -->
      <div class="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-primary-700/25 blur-3xl" />
      <div class="pointer-events-none absolute -bottom-32 -right-24 h-80 w-80 rounded-full bg-primary-600/20 blur-3xl" />
      <div class="pointer-events-none absolute left-1/3 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-white/5 blur-2xl" />

      <!-- Brand mark -->
      <div class="relative flex items-center gap-3">
        <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
          <svg class="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span class="text-base font-semibold tracking-tight text-white">Room Management</span>
      </div>

      <!-- Headline + features -->
      <div class="relative space-y-8">
        <div>
          <h2 class="text-3xl font-bold leading-tight text-white xl:text-4xl">
            Manage your spaces<br />
            <span class="text-primary-300">with confidence</span>
          </h2>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-primary-200 xl:text-base">
            A complete portal for room bookings, user management, and real-time availability across your organisation.
          </p>
        </div>

        <ul class="space-y-3">
          <li
            v-for="feat in features"
            :key="feat"
            class="flex items-center gap-3 text-sm text-primary-100"
          >
            <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-500/30">
              <svg class="h-3 w-3 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </span>
            {{ feat }}
          </li>
        </ul>
      </div>

      <!-- Footer -->
      <p class="relative text-xs text-primary-400">
        &copy; {{ year }} Room Management Portal. All rights reserved.
      </p>
    </aside>

    <!-- ─── Right Panel · Form ────────────────────────────────────────────── -->
    <main
      class="flex flex-1 flex-col items-center justify-center
             min-h-screen lg:min-h-0
             bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700
             lg:bg-none lg:bg-gray-50
             px-4 py-10 sm:px-6 sm:py-14 lg:px-10 lg:py-8"
    >
      <div class="w-full max-w-sm sm:max-w-md">

        <!-- Mobile / tablet brand header (hidden lg+) -->
        <div class="mb-8 text-center lg:hidden">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/25 sm:h-16 sm:w-16">
            <svg class="h-7 w-7 text-white sm:h-8 sm:w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h1 class="text-xl font-bold text-white sm:text-2xl">Room Management Portal</h1>
          <p class="mt-1 text-sm text-primary-200">Sign in to your account</p>
        </div>

        <!-- Form card -->
        <div class="rounded-2xl bg-white px-6 py-8 shadow-2xl ring-1 ring-black/5 sm:px-8 sm:py-10 lg:shadow-xl">
          <slot />
        </div>

        <!-- Mobile footer -->
        <p class="mt-6 text-center text-xs text-primary-300 lg:hidden">
          &copy; {{ year }} Room Management Portal
        </p>
      </div>
    </main>

  </div>
</template>

<script setup lang="ts">
const year = new Date().getFullYear()

const features = [
  'Real-time room availability',
  'Smart booking management',
  'User roles & permissions',
  'Reports & analytics',
]
</script>
