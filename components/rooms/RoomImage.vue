<template>
  <div class="h-full w-full">
    <!-- Skeleton while loading -->
    <div v-if="loading" class="h-full w-full animate-pulse bg-gray-200" />

    <!-- Loaded image -->
    <img
      v-else-if="src"
      :src="src"
      :alt="alt"
      v-bind="$attrs"
      class="h-full w-full object-cover"
    />

    <!-- Error / no image — fallback slot or default icon -->
    <slot v-else name="placeholder">
      <div class="flex h-full w-full flex-col items-center justify-center gap-1 bg-gray-100 text-gray-300">
        <svg class="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1"
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
// Disable automatic class/style inheritance so $attrs only reaches <img>
defineOptions({ inheritAttrs: false })

const props = defineProps<{
  roomId:  number
  imageId: number
  alt?:    string
}>()

const { getImageSrc } = useRoomImageSrc()

const src     = ref<string | null>(null)
const loading = ref(true)

async function load(roomId: number, imageId: number) {
  loading.value = true
  src.value     = null
  try {
    src.value = await getImageSrc(roomId, imageId)
  } catch {
    // show placeholder on error
  } finally {
    loading.value = false
  }
}

onMounted(() => load(props.roomId, props.imageId))

watch(
  [() => props.roomId, () => props.imageId],
  ([newRoom, newImg]) => load(newRoom, newImg),
)
</script>
