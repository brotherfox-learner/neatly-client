<script setup lang="ts">
import AppSkeleton from "@/components/ui/AppSkeleton.vue"
</script>

<template>
  <div
    class="space-y-6 md:space-y-8"
    role="status"
    aria-live="polite"
    aria-label="Loading available rooms"
  >
    <article
      v-for="index in 3"
      :key="index"
      class="search-result-card relative flex max-h-[320px] flex-col overflow-hidden rounded-lg bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:min-h-[280px] md:max-w-[1120px] md:flex-row"
    >
      <div
        class="relative h-[320px] w-full shrink-0 overflow-hidden md:min-h-[280px] md:w-[min(40.5%,453px)] md:max-w-[453px] md:self-stretch"
      >
        <AppSkeleton class="absolute inset-0 size-full rounded-none" />
      </div>

      <div
        class="flex min-h-0 min-w-0 flex-1 flex-col px-5 pb-6 pt-5 md:min-h-[280px] md:px-10 md:pb-8 md:pt-8 md:pl-10 md:pr-9"
      >
        <div
          class="flex min-w-0 flex-row items-start justify-between gap-4 md:gap-8"
        >
          <div class="min-w-0 flex-1 space-y-4 pr-2">
            <AppSkeleton class="h-7 w-44 md:h-[26px] md:w-60" />
            <div class="flex flex-wrap items-center gap-2">
              <AppSkeleton class="h-4 w-20 rounded-full" />
              <AppSkeleton class="h-4 w-1 rounded-full bg-[#d8ddea]" />
              <AppSkeleton class="h-4 w-24 rounded-full" />
              <AppSkeleton class="h-4 w-1 rounded-full bg-[#d8ddea]" />
              <AppSkeleton class="h-4 w-16 rounded-full" />
            </div>
            <div class="space-y-2.5">
              <AppSkeleton class="h-4 w-full max-w-[520px]" />
              <AppSkeleton class="h-4 w-full max-w-[500px]" />
              <AppSkeleton class="h-4 w-3/4 max-w-[360px]" />
            </div>
          </div>

          <div
            class="flex shrink-0 flex-col items-end gap-1 self-start md:items-end"
          >
            <AppSkeleton class="h-4 w-24" />
            <AppSkeleton class="h-8 w-32 md:h-9 md:w-36" />
            <AppSkeleton class="h-8 w-28 md:h-10 md:w-32" />
          </div>
        </div>

        <div
          class="mt-auto flex flex-wrap items-center justify-end gap-4 pt-8 md:gap-6 md:pt-10"
        >
          <AppSkeleton class="h-5 w-24 bg-[#f5d9cb]" />
          <AppSkeleton class="h-12 w-[140px] rounded-[4px] bg-[#C14817]/20" />
        </div>
      </div>
    </article>
  </div>
</template>
