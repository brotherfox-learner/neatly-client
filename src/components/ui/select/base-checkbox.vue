<script setup lang="ts">
// BaseCheckbox — Checkbox with label, 4 visual states
//
// States (driven by props):
//   default  — white box, gray-400 border, gray-700 text
//   hover    — white box, orange-500 border, orange-500 text  (CSS group-hover)
//   checked  — orange-500 box, orange-300 border, white check, gray-900 text bold
//   disabled — gray-100 box, gray-400 border, gray-500 text, no interaction
//
// Usage:
//   const agreed = ref(false)
//
//   <BaseCheckbox v-model="agreed" label="I agree to terms" />
//   <BaseCheckbox v-model="agreed" label="Disabled option" :disabled="true" />
//
// Props:
//   modelValue  (boolean) — checked state, bind with v-model
//   label?      — text shown beside the checkbox
//   disabled?   — disables all interaction
//   id?         — explicit id (auto-generated if omitted)

import { computed } from 'vue'
import { Check } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  modelValue?: boolean
  label?: string
  disabled?: boolean
  id?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const inputId = computed(
  () => props.id ?? `checkbox-${Math.random().toString(36).slice(2, 9)}`,
)

function toggle() {
  if (!props.disabled) emit('update:modelValue', !props.modelValue)
}

const boxClass = computed(() =>
  cn(
    'w-6 h-6 flex items-center justify-center rounded border shrink-0 transition-colors duration-150',
    props.disabled
      ? 'bg-gray-100 border-gray-400'
      : props.modelValue
        ? 'bg-orange-500 border-orange-300'
        : 'bg-white border-gray-400 group-hover:border-orange-500',
  ),
)

const labelClass = computed(() =>
  cn(
    'text-base leading-[150%] font-inter transition-colors duration-150 select-none',
    props.disabled
      ? 'text-gray-500'
      : props.modelValue
        ? 'text-gray-900 font-medium'
        : 'text-gray-700 group-hover:text-orange-500',
  ),
)
</script>

<template>
  <label
    :for="inputId"
    :class="
      cn(
        'group inline-flex items-center gap-3',
        disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )
    "
  >
    <input
      :id="inputId"
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      class="sr-only"
      @change="toggle"
    />

    <span :class="boxClass" aria-hidden="true">
      <Check
        v-if="modelValue"
        :size="14"
        :stroke-width="3"
        class="text-white"
      />
    </span>

    <span v-if="label" :class="labelClass">{{ label }}</span>
  </label>
</template>
