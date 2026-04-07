<script setup lang="ts">
import AppSkeleton from "@/components/ui/AppSkeleton.vue"
</script>

<template>
  <main
    class="pb-16 md:pb-20"
    role="status"
    aria-live="polite"
    aria-label="Loading room details"
  >
    <section aria-hidden="true" class="bg-white">
      <div class="mx-auto w-full max-w-[1320px] px-0 md:px-6 lg:px-10 xl:px-[100px]">
        <div class="overflow-hidden bg-[#f5f2ee] md:rounded-[28px]">
          <AppSkeleton class="aspect-[16/11] w-full rounded-none md:aspect-[930/581]" />
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-[1120px] px-4 pb-14 pt-10 md:pb-20 md:pt-14 lg:px-10 xl:px-[160px]">
      <div
        class="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C14817]/15 bg-[#fff7f3] px-3 py-2 text-[12px] font-medium tracking-[0.18em] text-[#C14817] uppercase"
      >
        <span class="app-skeleton-orb" />
        Loading suite details
      </div>

      <div class="md:flex md:items-start md:justify-between md:gap-10">
        <div class="md:max-w-[55%] lg:max-w-[60%]">
          <AppSkeleton class="h-14 w-3/4 max-w-[420px] md:h-18" />
          <div class="mt-5 space-y-3">
            <AppSkeleton class="h-4 w-full max-w-[520px]" />
            <AppSkeleton class="h-4 w-full max-w-[500px]" />
            <AppSkeleton class="h-4 w-2/3 max-w-[360px]" />
          </div>

          <div class="mt-7 flex flex-wrap items-center gap-3">
            <AppSkeleton class="h-4 w-20 rounded-full" />
            <AppSkeleton class="h-4 w-1 rounded-full bg-[#d8ddea]" />
            <AppSkeleton class="h-4 w-24 rounded-full" />
            <AppSkeleton class="h-4 w-1 rounded-full bg-[#d8ddea]" />
            <AppSkeleton class="h-4 w-16 rounded-full" />
          </div>
        </div>

        <div class="mt-8 flex flex-col items-start md:mt-0 md:items-end">
          <AppSkeleton class="h-4 w-24" />
          <AppSkeleton class="mt-2 h-9 w-32" />
          <AppSkeleton class="mt-5 h-12 w-full rounded bg-[#C14817]/20 md:w-40" />
        </div>
      </div>

      <div class="mt-12 border-t border-[#E4E6ED] pt-10">
        <AppSkeleton class="h-7 w-40" />
        <div class="mt-6 grid gap-y-4 md:grid-cols-2 md:gap-x-16">
          <div
            v-for="column in 2"
            :key="column"
            class="space-y-4"
          >
            <div
              v-for="item in 4"
              :key="`${column}-${item}`"
              class="flex items-center gap-3"
            >
              <AppSkeleton class="size-2 rounded-full bg-[#C14817]/35" />
              <AppSkeleton class="h-4 w-40 md:w-52" />
            </div>
          </div>
        </div>
      </div>

      <div class="mt-14 rounded-[28px] bg-[#f1f5f3] px-5 py-6 md:px-8 md:py-8">
        <AppSkeleton class="mx-auto h-10 w-48" />
        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <div
            v-for="card in 3"
            :key="card"
            class="overflow-hidden rounded-[24px] bg-white/65"
          >
            <AppSkeleton class="aspect-[4/3] w-full rounded-none" />
            <div class="space-y-3 px-4 py-4">
              <AppSkeleton class="h-6 w-2/3" />
              <AppSkeleton class="h-4 w-28 bg-[#f5d9cb]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
