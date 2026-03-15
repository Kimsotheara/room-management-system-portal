<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset"
    :class="overlay ? meta.overlayClass : meta.badgeClass"
  >
    <span class="h-1.5 w-1.5 rounded-full" :class="meta.dotClass" />
    {{ meta.label }}
  </span>
</template>

<script setup lang="ts">
import { useRoomStatus } from '~/composables/useRoomStatus'

const props = defineProps<{
  status?: string | null
  /** Use semi-transparent overlay variant (e.g. on top of images) */
  overlay?: boolean
}>()

const { getMeta } = useRoomStatus()
const meta = computed(() => getMeta(props.status))
</script>
