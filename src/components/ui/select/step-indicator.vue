<script setup lang="ts">
// StepIndicator — One step item in a multi-step flow
//
// States:
//   none    — gray-200 box, gray-600 number & label  (upcoming step)
//   current — orange-500 box, white number, orange-500 label  (active step)
//   finish  — orange-100 box, orange-500 number, gray-900 label  (completed step)
//
// Usage:
//   <div class="flex flex-col gap-4">
//     <StepIndicator :step="1" label="Basic Information" status="finish" />
//     <StepIndicator :step="2" label="Payment Method"    status="current" />
//     <StepIndicator :step="3" label="Confirm Booking"   status="none" />
//   </div>
//
// Props:
//   step    (required) — step number shown in the box
//   label   (required) — descriptive text shown beside the box
//   status? — 'none' | 'current' | 'finish' (default: 'none')

import { computed } from 'vue'
import { cn } from '@/lib/utils'

type StepStatus = 'none' | 'current' | 'finish'

interface Props {
  step: number | string
  label: string
  status?: StepStatus
}

const props = withDefaults(defineProps<Props>(), {
  status: 'none',
})

const boxClass = computed(() =>
  cn(
    'w-[66px] h-[66px] flex flex-col justify-center items-center rounded shrink-0',
    props.status === 'current'
      ? 'bg-orange-500'
      : props.status === 'finish'
        ? 'bg-orange-100'
        : 'bg-gray-200',
  ),
)

const numberClass = computed(() =>
  cn(
    'headline-4',
    props.status === 'current'
      ? 'text-white'
      : props.status === 'finish'
        ? 'text-orange-500'
        : 'text-gray-600',
  ),
)

const labelClass = computed(() =>
  cn(
    'headline-5',
    props.status === 'current'
      ? 'text-orange-500'
      : props.status === 'finish'
        ? 'text-gray-900'
        : 'text-gray-600',
  ),
)
</script>

<template>
  <div class="flex flex-row items-center gap-4">
    <div :class="boxClass" aria-hidden="true">
      <span :class="numberClass">{{ step }}</span>
    </div>
    <span :class="labelClass">{{ label }}</span>
  </div>
</template>
