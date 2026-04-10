<script setup lang="ts">
// BaseInput — Text input field with multiple visual states
//
// States (via `status` prop):
//   normal   — white bg, gray-400 border; orange-500 border on focus
//   success  — same as normal (value is filled)
//   error    — red border + red dot indicator + optional supporting text below
//   disabled — gray-100 bg, non-interactive
//
// Usage:
//   const email = ref('')
//
//   <BaseInput v-model="email" label="Email" placeholder="Enter your email" />
//   <BaseInput v-model="email" label="Email" status="error" supporting-text="Email is required" />
//   <BaseInput v-model="email" label="Email" status="disabled" />
//   <BaseInput v-model="password" label="Password" type="password" />
//
// Props:
//   label?         — field label text
//   placeholder?   — input placeholder (default: 'Place Holder')
//   modelValue?    — bound value via v-model
//   type?          — HTML input type (default: 'text')
//   status?        — 'normal' | 'success' | 'error' | 'disabled' (default: 'normal')
//   supportingText?— error message shown below (only visible when status='error')
//   id?            — explicit element id (auto-generated if omitted)
//   name?          — HTML name attribute
import { computed } from 'vue'
import { cn } from '@/lib/utils'

type InputStatus = 'normal' | 'success' | 'error' | 'disabled'

interface Props {
  label?: string
  placeholder?: string
  modelValue?: string
  type?: string
  status?: InputStatus
  supportingText?: string
  id?: string
  name?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  status: 'normal',
  placeholder: 'Place Holder',
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  focus: []
  blur: []
}>()

const inputId = computed(
  () => props.id ?? `base-input-${Math.random().toString(36).slice(2, 9)}`,
)

const isDisabled = computed(() => props.status === 'disabled')
const isError = computed(() => props.status === 'error')

const fieldClasses = computed(() =>
  cn(
    'w-full flex items-center pl-3 pr-4 py-3 h-12 rounded border bg-white',
    'font-inter text-base leading-[150%] text-gray-900',
    'outline-none transition-colors duration-200',
    'placeholder:text-gray-600',
    isDisabled.value
      ? 'bg-gray-100 border-gray-400 cursor-not-allowed text-gray-600'
      : isError.value
        ? 'border-red focus:border-red'
        : 'border-gray-400 focus:border-orange-500',
  ),
)
</script>

<template>
  <div class="flex flex-col gap-1 w-full">
    <label
      v-if="label"
      :for="inputId"
      class="text-gray-900 text-base leading-[150%] font-normal select-none"
    >
      {{ label }}
    </label>

    <div class="relative flex items-center">
      <input
        :id="inputId"
        :name="name"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :class="fieldClasses"
        :aria-invalid="isError || undefined"
        :aria-describedby="supportingText ? `${inputId}-helper` : undefined"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="emit('focus')"
        @blur="emit('blur')"
      />
      <span
        v-if="isError"
        class="absolute right-3 w-2 h-2 rounded-full bg-red pointer-events-none"
        aria-hidden="true"
      />
    </div>

    <p
      v-if="isError && supportingText"
      :id="`${inputId}-helper`"
      class="text-red text-sm leading-[150%]"
      role="alert"
    >
      {{ supportingText }}
    </p>
  </div>
</template>
