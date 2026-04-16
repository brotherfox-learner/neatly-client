<script setup lang="ts">
import { Search } from "lucide-vue-next"

withDefaults(defineProps<{
  title: string
  searchValue?: string
  searchPlaceholder?: string
}>(), {
  searchValue: "",
  searchPlaceholder: "Search...",
})

const emit = defineEmits<{
  (event: "update:searchValue", value: string): void
}>()
</script>

<template>
  <header
    class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
  >
    <h1 class="headline-5 min-w-0 flex-1 text-[#2A2E3F]">
      {{ title }}
    </h1>
    <div class="relative flex w-full max-w-[320px] flex-row items-center" role="search">
      <label class="sr-only" for="admin-search">Search</label>
      <div
        class="flex w-full flex-row items-center gap-2.5 rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3"
      >
        <Search class="size-6 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
        <input
          id="admin-search"
          type="search"
          :value="searchValue"
          :placeholder="searchPlaceholder"
          class="body-1 min-w-0 flex-1 border-0 bg-transparent p-0 text-[#2A2E3F] outline-none placeholder:text-[#9AA1B9]"
          @input="emit('update:searchValue', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>
  </header>
</template>
