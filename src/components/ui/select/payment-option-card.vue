<script setup lang="ts">
// PaymentOptionCard — Selectable payment method card
//
// Usage:
//   const selectedPayment = ref('')
//
//   <PaymentOptionCard v-model="selectedPayment" value="cash" label="Cash">
//     <template #icon><Banknote :size="28" /></template>
//   </PaymentOptionCard>
//   <PaymentOptionCard v-model="selectedPayment" value="credit-card" label="Credit Card">
//     <template #icon><CreditCard :size="28" /></template>
//   </PaymentOptionCard>
//
// Props:
//   label    (required) — display label e.g. "Cash"
//   value    (required) — unique value for this option
//   modelValue? — currently selected value (bound via v-model)
//
// Slots:
//   #icon — 32×32 icon area (use any Lucide icon or SVG)

import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  label: string
  value: string
  modelValue?: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const isSelected = computed(() => props.modelValue === props.value)
</script>

<template>
  <button
    type="button"
    :aria-pressed="isSelected"
    :aria-label="label"
    :class="
      cn(
        'w-[212px] h-20 flex items-center justify-center',
        'bg-white rounded border shadow-1 cursor-pointer transition-colors duration-200',
        isSelected ? 'border-orange-500' : 'border-gray-300 hover:border-orange-500',
      )
    "
    @click="emit('update:modelValue', value)"
  >
    <div
      :class="
        cn(
          'flex flex-row items-center gap-2',
          isSelected ? 'text-orange-500' : 'text-gray-600',
        )
      "
    >
      <div class="w-8 h-8 flex items-center justify-center shrink-0">
        <slot name="icon" />
      </div>
      <span class="headline-5">{{ label }}</span>
    </div>
  </button>
</template>
