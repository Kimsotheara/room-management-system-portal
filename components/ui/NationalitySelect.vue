<template>
  <div ref="containerRef" class="relative">
    <!-- Trigger input -->
    <div
      class="flex w-full cursor-pointer items-center rounded-xl border px-3.5 py-2.5 text-sm shadow-sm transition focus-within:border-transparent focus-within:ring-2"
      :class="[
        open ? 'border-transparent ring-2 ring-primary-500' : 'border-gray-200',
        error ? 'border-red-400 focus-within:ring-red-400' : '',
        disabled ? 'cursor-not-allowed bg-gray-50 opacity-60' : 'bg-white',
      ]"
      @click="!disabled && toggleOpen()"
    >
      <span class="flex-1 truncate" :class="modelValue ? 'text-gray-700' : 'text-gray-400'">
        {{ modelValue || placeholder }}
      </span>
      <!-- Clear button -->
      <button
        v-if="modelValue && !disabled"
        type="button"
        class="ml-1 flex-shrink-0 rounded p-0.5 text-gray-400 transition hover:text-gray-600"
        @click.stop="select('')"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <!-- Chevron -->
      <svg
        class="ml-1 h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-150"
        :class="open ? 'rotate-180' : ''"
        fill="none" stroke="currentColor" viewBox="0 0 24 24"
      >
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </div>

    <!-- Dropdown -->
    <Transition
      enter-active-class="transition duration-150 ease-out"
      enter-from-class="opacity-0 -translate-y-1 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-100 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-1 scale-95"
    >
      <div
        v-if="open"
        class="absolute z-50 mt-1 w-full origin-top overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
      >
        <!-- Search input -->
        <div class="border-b border-gray-100 p-2">
          <div class="relative">
            <svg class="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref="searchRef"
              v-model="query"
              type="text"
              placeholder="Search nationality…"
              class="w-full rounded-lg border border-gray-200 py-1.5 pl-7 pr-3 text-sm placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <!-- Options list -->
        <ul ref="listRef" class="max-h-52 overflow-y-auto py-1">
          <!-- Clear option -->
          <li
            class="cursor-pointer px-3.5 py-2 text-sm text-gray-400 transition-colors hover:bg-gray-50"
            @click="select('')"
          >
            — None —
          </li>

          <template v-if="filtered.length">
            <li
              v-for="item in filtered"
              :key="item"
              class="flex cursor-pointer items-center gap-2 px-3.5 py-2 text-sm transition-colors"
              :class="item === modelValue
                ? 'bg-primary-50 font-medium text-primary-700'
                : 'text-gray-700 hover:bg-gray-50'"
              @click="select(item)"
            >
              <svg
                v-if="item === modelValue"
                class="h-3.5 w-3.5 flex-shrink-0 text-primary-600"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
              <span :class="item !== modelValue ? 'ml-5' : ''">{{ item }}</span>
            </li>
          </template>
          <li v-else class="px-3.5 py-3 text-center text-sm text-gray-400">No results found</li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue: string
  placeholder?: string
  error?: boolean
  disabled?: boolean
}>(), {
  placeholder: '— Select nationality —',
  error: false,
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const NATIONALITIES = [
  'Afghan', 'Albanian', 'Algerian', 'American', 'Andorran', 'Angolan', 'Argentine', 'Armenian',
  'Australian', 'Austrian', 'Azerbaijani', 'Bahamian', 'Bahraini', 'Bangladeshi', 'Barbadian',
  'Belarusian', 'Belgian', 'Belizean', 'Beninese', 'Bhutanese', 'Bolivian', 'Bosnian',
  'Botswanan', 'Brazilian', 'British', 'Bruneian', 'Bulgarian', 'Burkinabe', 'Burmese',
  'Burundian', 'Cambodian', 'Cameroonian', 'Canadian', 'Cape Verdean', 'Central African',
  'Chadian', 'Chilean', 'Chinese', 'Colombian', 'Comoran', 'Congolese', 'Costa Rican',
  'Croatian', 'Cuban', 'Cypriot', 'Czech', 'Danish', 'Djiboutian', 'Dominican', 'Dutch',
  'Ecuadorean', 'Egyptian', 'Emirati', 'Equatorial Guinean', 'Eritrean', 'Estonian',
  'Ethiopian', 'Fijian', 'Finnish', 'French', 'Gabonese', 'Gambian', 'Georgian', 'German',
  'Ghanaian', 'Greek', 'Grenadian', 'Guatemalan', 'Guinean', 'Guyanese', 'Haitian',
  'Honduran', 'Hungarian', 'Icelandic', 'Indian', 'Indonesian', 'Iranian', 'Iraqi', 'Irish',
  'Israeli', 'Italian', 'Ivorian', 'Jamaican', 'Japanese', 'Jordanian', 'Kazakhstani',
  'Kenyan', 'Korean', 'Kuwaiti', 'Kyrgyz', 'Laotian', 'Latvian', 'Lebanese', 'Lesothan',
  'Liberian', 'Libyan', 'Lithuanian', 'Luxembourgish', 'Macedonian', 'Malagasy', 'Malawian',
  'Malaysian', 'Maldivian', 'Malian', 'Maltese', 'Mauritanian', 'Mauritian', 'Mexican',
  'Micronesian', 'Moldovan', 'Monégasque', 'Mongolian', 'Montenegrin', 'Moroccan', 'Mozambican',
  'Namibian', 'Nepalese', 'New Zealander', 'Nicaraguan', 'Nigerian', 'Nigerien', 'Norwegian',
  'Omani', 'Pakistani', 'Palauan', 'Palestinian', 'Panamanian', 'Papua New Guinean',
  'Paraguayan', 'Peruvian', 'Filipino', 'Polish', 'Portuguese', 'Qatari', 'Romanian',
  'Russian', 'Rwandan', 'Saint Lucian', 'Salvadoran', 'Samoan', 'Saudi', 'Senegalese',
  'Serbian', 'Sierra Leonean', 'Singaporean', 'Slovak', 'Slovenian', 'Somali',
  'South African', 'South Sudanese', 'Spanish', 'Sri Lankan', 'Sudanese', 'Surinamese',
  'Swazi', 'Swedish', 'Swiss', 'Syrian', 'Taiwanese', 'Tajik', 'Tanzanian', 'Thai',
  'Timorese', 'Togolese', 'Trinidadian', 'Tunisian', 'Turkish', 'Turkmen', 'Ugandan',
  'Ukrainian', 'Uruguayan', 'Uzbek', 'Venezuelan', 'Vietnamese', 'Yemeni', 'Zambian',
  'Zimbabwean',
]

const open         = ref(false)
const query        = ref('')
const containerRef = ref<HTMLElement | null>(null)
const searchRef    = ref<HTMLInputElement | null>(null)

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return NATIONALITIES
  return NATIONALITIES.filter(n => n.toLowerCase().includes(q))
})

function toggleOpen() {
  open.value = !open.value
  if (open.value) {
    query.value = ''
    nextTick(() => searchRef.value?.focus())
  }
}

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
  query.value = ''
}

// Close on outside click
function onClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    open.value = false
    query.value = ''
  }
}

// Close on Escape
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') { open.value = false; query.value = '' }
}

onMounted(() => {
  document.addEventListener('mousedown', onClickOutside)
  document.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
  document.removeEventListener('keydown', onKeydown)
})
</script>
