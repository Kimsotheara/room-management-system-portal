<template>
  <div v-bind="$attrs" class="relative overflow-hidden">
    <!-- Loading skeleton -->
    <div v-if="loading" class="h-full w-full animate-pulse bg-gray-200" />
    <!-- Image -->
    <img v-else-if="src" :src="src" :alt="alt" class="h-full w-full object-cover" />
    <!-- Initials fallback -->
    <div v-else class="flex h-full w-full items-center justify-center bg-primary-50 text-sm font-semibold text-primary-600">
      {{ initials || '?' }}
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  guestId: number
  initials?: string
  alt?: string
}>()

const { getImageSrc } = useGuestImageSrc()

const src     = ref<string | null>(null)
const loading = ref(true)

async function loadImage() {
  loading.value = true
  src.value = null
  try {
    src.value = await getImageSrc(props.guestId)
  } catch {
    src.value = null
  } finally {
    loading.value = false
  }
}

onMounted(loadImage)
watch(() => props.guestId, loadImage)
</script>
