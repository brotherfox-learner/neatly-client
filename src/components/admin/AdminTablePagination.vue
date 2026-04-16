<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  currentPage: number
  totalPages: number
  totalItems: number
}>()

const emit = defineEmits<{
  "update:currentPage": [page: number]
}>()

const pageNumbers = computed(() => {
  const total = props.totalPages
  const cur = props.currentPage
  const maxVisible = 7
  if (total <= 0) return [] as number[]
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }
  const half = Math.floor(maxVisible / 2)
  let start = Math.max(1, cur - half)
  let end = Math.min(total, start + maxVisible - 1)
  start = Math.max(1, end - maxVisible + 1)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

const canPrev = computed(() => props.currentPage > 1 && props.totalItems > 0)
const canNext = computed(() => props.currentPage < props.totalPages && props.totalItems > 0)

function go(n: number) {
  emit("update:currentPage", n)
}
</script>

<template>
  <nav
    v-if="totalItems > 0"
    class="mt-10 flex w-full flex-wrap items-center justify-center gap-2"
    aria-label="Pagination"
  >
    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-[4px] disabled:opacity-40"
      :disabled="!canPrev"
      aria-label="Previous page"
      @click="go(currentPage - 1)"
    >
      <span class="text-[#9AA1B9]" aria-hidden="true">‹</span>
    </button>

    <button
      v-for="n in pageNumbers"
      :key="n"
      type="button"
      class="font-open-sans size-8 rounded-[4px] text-center text-base font-semibold leading-4"
      :class="
        n === currentPage
          ? 'border border-[#D5DFDA] bg-white text-[#5D7B6A]'
          : 'text-[#C8CCDB] hover:text-[#5D7B6A]'
      "
      :aria-current="n === currentPage ? 'page' : undefined"
      :aria-label="`Page ${n}`"
      @click="go(n)"
    >
      {{ n }}
    </button>

    <button
      type="button"
      class="flex size-8 items-center justify-center rounded-[4px] disabled:opacity-40"
      :disabled="!canNext"
      aria-label="Next page"
      @click="go(currentPage + 1)"
    >
      <span class="text-[#9AA1B9]" aria-hidden="true">›</span>
    </button>
  </nav>
</template>
