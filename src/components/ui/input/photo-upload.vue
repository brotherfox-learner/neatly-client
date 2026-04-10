<script setup lang="ts">
// PhotoUpload — Photo file selector with drag-and-drop and preview
//
// States:
//   empty  — dashed border box with "+" icon and "Upload photo" label
//   filled — shows image preview with "×" remove button in top-right corner
//
// Usage:
//   const photo = ref<File | null>(null)
//
//   <PhotoUpload v-model="photo" />
//   <PhotoUpload v-model="photo" accept="image/png,image/jpeg" :max-size-mb="2" />
//   <PhotoUpload v-model="photo" @error="msg => toast.error(msg)" />
//
// Props:
//   modelValue? — File | null  (bound via v-model)
//   accept?     — MIME types string (default: 'image/*')
//   maxSizeMb?  — max file size in MB (default: 5)
//
// Emits:
//   update:modelValue(file: File | null)
//   error(message: string) — fires on invalid type or oversized file
import { ref, computed, onUnmounted, watch } from 'vue'
import { Plus, X } from 'lucide-vue-next'

interface Props {
  modelValue?: File | null
  accept?: string
  maxSizeMb?: number
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: null,
  accept: 'image/*',
  maxSizeMb: 5,
})

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  error: [message: string]
}>()

const fileInputRef = ref<HTMLInputElement>()
const isDragging = ref(false)
const previewUrl = ref<string | null>(null)

watch(
  () => props.modelValue,
  (file) => {
    if (previewUrl.value) {
      URL.revokeObjectURL(previewUrl.value)
      previewUrl.value = null
    }
    if (file) {
      previewUrl.value = URL.createObjectURL(file)
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (previewUrl.value) URL.revokeObjectURL(previewUrl.value)
})

const hasPhoto = computed(() => !!previewUrl.value)

function openFilePicker() {
  fileInputRef.value?.click()
}

function handleFile(file: File) {
  if (!file.type.startsWith('image/')) {
    emit('error', 'Please upload an image file.')
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    emit('error', `File size must be less than ${props.maxSizeMb}MB.`)
    return
  }
  emit('update:modelValue', file)
}

function onFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) handleFile(file)
}

function onDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) handleFile(file)
}

function removePhoto() {
  emit('update:modelValue', null)
  if (fileInputRef.value) fileInputRef.value.value = ''
}
</script>

<template>
  <div class="relative inline-block">
    <button
      v-if="!hasPhoto"
      type="button"
      aria-label="Upload photo"
      :class="[
        'w-[120px] h-[120px] flex flex-col items-center justify-center gap-1',
        'bg-gray-100 rounded border border-dashed border-gray-400',
        'cursor-pointer transition-colors duration-200',
        isDragging
          ? 'border-orange-500 bg-orange-100'
          : 'hover:border-orange-500 hover:bg-orange-100',
      ]"
      @click="openFilePicker"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="onDrop"
    >
      <Plus :size="24" class="text-orange-500" aria-hidden="true" />
      <span class="text-orange-500 text-xs leading-[150%] font-normal font-inter">
        Upload photo
      </span>
    </button>

    <div v-else class="relative w-[120px] h-[120px]">
      <img
        :src="previewUrl!"
        alt="Uploaded photo preview"
        class="w-full h-full object-cover rounded"
      />
      <button
        type="button"
        aria-label="Remove photo"
        class="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center bg-red text-white rounded-full hover:opacity-80 transition-opacity duration-150 cursor-pointer"
        @click="removePhoto"
      >
        <X :size="12" aria-hidden="true" />
      </button>
    </div>

    <input
      ref="fileInputRef"
      type="file"
      :accept="accept"
      class="sr-only"
      aria-hidden="true"
      tabindex="-1"
      @change="onFileChange"
    />
  </div>
</template>
