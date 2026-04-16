<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"
import type { Room } from "@/data/rooms"

const props = defineProps<{ rooms: Room[] }>()

const containerEl = ref<HTMLElement | null>(null)
const containerW = ref(0)
const isDesktop = ref(false)
const current = ref(0)

function measure() {
  containerW.value = containerEl.value?.clientWidth ?? window.innerWidth
  isDesktop.value = window.innerWidth >= 768
}

let ro: ResizeObserver | null = null

onMounted(() => {
  measure()
  ro = new ResizeObserver(measure)
  if (containerEl.value) ro.observe(containerEl.value)
})

onBeforeUnmount(() => ro?.disconnect())

const visibleCount = computed(() => (isDesktop.value ? 3 : 1))
const slideW = computed(() => containerW.value / visibleCount.value || 0)

const maxIndex = computed(() =>
  Math.max(0, props.rooms.length - visibleCount.value),
)
const trackOffset = computed(() => -current.value * slideW.value)

function goNext() {
  current.value = Math.min(current.value + 1, maxIndex.value)
}

function goPrev() {
  current.value = Math.max(0, current.value - 1)
}

const canNext = computed(() => current.value < maxIndex.value)
const canPrev = computed(() => current.value > 0)
</script>

<template>
  <section
    class="bg-green-100 py-12 md:py-16 lg:py-20"
    aria-labelledby="other-rooms-heading"
  >
    <h2
      id="other-rooms-heading"
      class="landing-serif-h2 mb-8 text-center text-[#2f3e35] md:mb-10"
    >
      Other Rooms
    </h2>

    <div
      ref="containerEl"
      class="other-rooms-track-wrap relative w-full overflow-hidden"
      :style="{ '--slide-w': `${slideW}px`, '--offset': `${trackOffset}px` }"
      role="region"
      aria-label="Other rooms"
    >
      <div class="other-rooms-track flex">
        <article
          v-for="room in rooms"
          :key="room.id"
          class="other-rooms-slide relative shrink-0 overflow-hidden"
        >
          <div class="relative aspect-4/3 w-full overflow-hidden">
            <img
              :src="room.coverImage"
              :alt="room.name"
              width="480"
              height="360"
              class="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              class="absolute inset-0 bg-linear-to-t from-black/70 via-black/15 to-transparent"
              aria-hidden="true"
            />
            <div class="absolute inset-x-0 bottom-0 p-4 md:p-6">
              <h3 class="landing-room-title mb-1 md:text-[2rem]">{{ room.name }}</h3>
              <RouterLink
                :to="`/rooms/${room.id}`"
                class="font-open-sans inline-flex items-center gap-1.5 text-[14px] font-semibold text-white transition-opacity hover:opacity-80"
              >
                Explore Room
                <img
                  src="/Icon%20figma/arrow-right.svg"
                  alt=""
                  class="size-3.5 brightness-0 invert"
                  width="14"
                  height="14"
                />
              </RouterLink>
            </div>
          </div>
        </article>
      </div>

      <!-- Arrows -->
      <button
        v-show="canPrev"
        type="button"
        class="absolute left-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors hover:bg-white"
        aria-label="Previous room"
        @click="goPrev"
      >
        <img src="/Icon%20figma/arrow-left.svg" alt="" width="18" height="18" class="size-4.5" />
      </button>
      <button
        v-show="canNext"
        type="button"
        class="absolute right-4 top-1/2 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 shadow-md transition-colors hover:bg-white"
        aria-label="Next room"
        @click="goNext"
      >
        <img src="/Icon%20figma/arrow-right.svg" alt="" width="18" height="18" class="size-4.5" />
      </button>
    </div>

    <!-- Navigation arrows below (desktop) -->
    <div class="mt-8 flex items-center justify-center gap-4 md:mt-10">
      <button
        type="button"
        class="border-border flex size-10 items-center justify-center rounded-full border bg-white shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
        :disabled="!canPrev"
        aria-label="Previous room"
        @click="goPrev"
      >
        <img src="/Icon%20figma/arrow-left.svg" alt="" width="18" height="18" class="size-4.5" />
      </button>
      <button
        type="button"
        class="border-border flex size-10 items-center justify-center rounded-full border bg-white shadow-sm transition-colors hover:bg-gray-50 disabled:opacity-40"
        :disabled="!canNext"
        aria-label="Next room"
        @click="goNext"
      >
        <img src="/Icon%20figma/arrow-right.svg" alt="" width="18" height="18" class="size-4.5" />
      </button>
    </div>
  </section>
</template>

<style scoped>
.other-rooms-track {
  transform: translateX(var(--offset, 0px));
  transition: transform 0.5s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}

.other-rooms-slide {
  width: var(--slide-w, 100%);
}
</style>
