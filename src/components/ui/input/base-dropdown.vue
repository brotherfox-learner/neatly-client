<script setup lang="ts">
// BaseDropdown — Select/dropdown input with option list
//
// States:
//   closed  — gray-400 border; shows selected value or placeholder
//   open    — orange-500 border; option list visible with shadow below
//   disabled— gray-100 bg, non-interactive
//
// Usage:
//   const service = ref('')
//   const options = ['Deluxe Room', 'Superior Room', 'Standard Room']
//
//   <BaseDropdown v-model="service" label="Room Type" :options="options" />
//   <BaseDropdown v-model="service" label="Room Type" :options="options" :disabled="true" />
//
// Props:
//   label?      — field label text
//   placeholder?— placeholder when no value selected (default: 'Place Holder')
//   modelValue? — currently selected value (bound via v-model)
//   options?    — string[] list of selectable options
//   disabled?   — disables interaction (default: false)
//   id?         — explicit element id (auto-generated if omitted)
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ChevronDown } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
  options?: string[]
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  options: () => [],
  placeholder: 'Place Holder',
  disabled: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const containerRef = ref<HTMLDivElement>()

const inputId = computed(
  () => props.id ?? `base-dropdown-${Math.random().toString(36).slice(2, 9)}`,
)

function toggleOpen() {
  if (!props.disabled) {
    isOpen.value = !isOpen.value
  }
}

function select(option: string) {
  emit('update:modelValue', option)
  isOpen.value = false
}

function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('mousedown', handleClickOutside))
onUnmounted(() => document.removeEventListener('mousedown', handleClickOutside))
</script>

<template>
  <div ref="containerRef" class="relative w-full">
    <label
      v-if="label"
      :for="inputId"
      class="block text-gray-900 text-base leading-[150%] font-normal mb-1 select-none"
    >
      {{ label }}
    </label>

    <button
      :id="inputId"
      type="button"
      :disabled="disabled"
      :aria-haspopup="'listbox'"
      :aria-expanded="isOpen"
      :aria-label="label ?? 'Dropdown'"
      :class="
        cn(
          'w-full h-12 flex flex-row items-center justify-between pl-3 pr-4 py-3 rounded border',
          'font-inter text-base leading-[150%] outline-none transition-colors duration-200',
          disabled
            ? 'bg-gray-100 border-gray-400 cursor-not-allowed text-gray-600'
            : cn(
                'bg-white cursor-pointer',
                isOpen ? 'border-orange-500' : 'border-gray-400 hover:border-gray-600',
              ),
        )
      "
      @click="toggleOpen"
    >
      <span :class="modelValue ? 'text-gray-900' : 'text-gray-600'">
        {{ modelValue || placeholder }}
      </span>
      <ChevronDown
        :size="20"
        class="text-gray-600 shrink-0 transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        aria-hidden="true"
      />
    </button>

    <ul
      v-if="isOpen"
      role="listbox"
      :aria-label="label ?? 'Options'"
      class="absolute z-50 w-full mt-1 bg-white shadow-1 rounded py-2 outline-none"
    >
      <li
        v-for="option in options"
        :key="option"
        role="option"
        :aria-selected="option === modelValue"
        :class="
          cn(
            'px-4 py-2 text-gray-700 text-base leading-[150%] font-inter cursor-pointer',
            'transition-colors duration-150',
            option === modelValue ? 'bg-gray-100' : 'hover:bg-gray-100',
          )
        "
        @click="select(option)"
      >
        {{ option }}
      </li>
    </ul>
  </div>
</template>
