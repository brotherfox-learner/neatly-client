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

    <div class="space-y-6 md:space-y-8">
      <article
        v-for="index in 3"
        :key="index"
        class="overflow-hidden rounded-lg border border-white/70 bg-white shadow-[0_8px_30px_rgba(34,45,78,0.08)]"
      >
        <div class="flex flex-col md:min-h-[280px] md:flex-row">
          <div class="relative h-[220px] w-full shrink-0 md:h-auto md:w-[min(40.5%,453px)] md:max-w-[453px]">
            <AppSkeleton class="size-full rounded-none md:min-h-[280px]" />
            <div class="absolute bottom-4 left-4"> 
              <AppSkeleton class="size-11 rounded-md bg-white/30" />
            </div>
          </div>

          <div class="flex flex-1 flex-col justify-between px-5 pb-6 pt-5 md:px-10 md:pb-8 md:pt-8">
            <div class="space-y-4">
              <AppSkeleton class="h-7 w-44 md:w-60" />
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
              <AppSkeleton class="h-9 w-52 rounded-full bg-[#f8e0d4]" />
            </div>

            <div class="mt-8 flex flex-wrap items-end justify-between gap-5 md:mt-10">
              <div class="ml-auto flex flex-col items-end gap-2">
                <AppSkeleton class="h-4 w-24" />
                <AppSkeleton class="h-8 w-32" />
                <AppSkeleton class="h-9 w-28 rounded-md bg-[#eef1f7]" />
              </div>
              <div class="flex items-center gap-4">
                <AppSkeleton class="h-5 w-24 bg-[#f5d9cb]" />
                <AppSkeleton class="h-12 w-[140px] rounded-[4px] bg-[#C14817]/20" />
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
