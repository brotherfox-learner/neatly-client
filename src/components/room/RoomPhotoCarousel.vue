<script setup lang="ts">
import { ChevronLeft, ChevronRight } from "lucide-vue-next"
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue"

const props = defineProps<{ images: string[] }>()

/** One clone on each side: [last, …real, first] — same idea as landing About slideshow */
const REAL_START = 1

const containerEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const containerW = ref(0)
const isDesktop = ref(false)

const n = computed(() => props.images.length)
const realEnd = computed(() => REAL_START + n.value - 1)

const trackSlides = computed(() => {
  const imgs = props.images
  const len = imgs.length
  if (len <= 1) return [...imgs]
  return [imgs[len - 1]!, ...imgs, imgs[0]!]
})

/** 0 … n−1 for dots / a11y */
const activeSlide = ref(0)
/** Index in extended track (clones + real) */
const trackIndex = ref(0)
const noTransition = ref(false)
const transitioning = ref(false)

function measure() {
  containerW.value = containerEl.value?.clientWidth ?? window.innerWidth
  isDesktop.value = window.matchMedia("(min-width: 768px)").matches
}

function resetCarousel() {
  const len = n.value
  if (len <= 1) {
    trackIndex.value = 0
    activeSlide.value = 0
  } else {
    trackIndex.value = REAL_START
    activeSlide.value = 0
  }
  transitioning.value = false
}

watch(
  () => props.images,
  () => {
    resetCarousel()
  },
  { deep: true },
)

let ro: ResizeObserver | null = null
let mql: MediaQueryList | null = null

function onViewportModeChange() {
  measure()
  if (n.value > 1) {
    trackIndex.value = REAL_START + activeSlide.value
  }
}

onMounted(() => {
  measure()
  resetCarousel()
  ro = new ResizeObserver(measure)
  if (containerEl.value) ro.observe(containerEl.value)
  mql = window.matchMedia("(min-width: 768px)")
  mql.addEventListener("change", onViewportModeChange)
})

onBeforeUnmount(() => {
  ro?.disconnect()
  mql?.removeEventListener("change", onViewportModeChange)
})

/** Figma desktop frame: 930×581px */
const DESKTOP_SLIDE_W = 930
const DESKTOP_SLIDE_H = 581

const gapPx = computed(() => (isDesktop.value ? 12 : 0))

const slideW = computed(() => {
  const c = containerW.value
  if (!c) return 0
  if (!isDesktop.value) return c
  return Math.min(DESKTOP_SLIDE_W, c)
})

const trackTranslateX = computed(() => {
  const c = containerW.value
  const w = slideW.value
  const g = gapPx.value
  if (!c || !w) return 0
  const k = trackIndex.value
  const centerOffset = isDesktop.value ? c / 2 - w / 2 : 0
  return centerOffset - k * (w + g)
})

function jumpNoTransition(cb: () => void) {
  noTransition.value = true
  cb()
  nextTick(() =>
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        noTransition.value = false
      }),
    ),
  )
}

function goNext() {
  if (n.value <= 1) return
  if (transitioning.value) return
  transitioning.value = true

  if (activeSlide.value < n.value - 1) {
    activeSlide.value++
    trackIndex.value++
  } else {
    activeSlide.value = 0
    trackIndex.value = realEnd.value + 1
  }
}

function goPrev() {
  if (n.value <= 1) return
  if (transitioning.value) return
  transitioning.value = true

  if (activeSlide.value > 0) {
    activeSlide.value--
    trackIndex.value--
  } else {
    activeSlide.value = n.value - 1
    trackIndex.value = REAL_START - 1
  }
}

function onTrackTransitionEnd(e: TransitionEvent) {
  if (e.target !== trackEl.value || e.propertyName !== "transform") return
  if (n.value <= 1) {
    transitioning.value = false
    return
  }

  if (trackIndex.value > realEnd.value) {
    jumpNoTransition(() => {
      trackIndex.value = REAL_START
    })
  } else if (trackIndex.value < REAL_START) {
    jumpNoTransition(() => {
      trackIndex.value = realEnd.value
    })
  }

  transitioning.value = false
}
</script>

<template>
  <div
    ref="containerEl"
    class="room-photo-carousel relative w-full overflow-hidden bg-white"
    role="region"
    aria-label="Room photo gallery"
  >
    <div
      ref="trackEl"
      class="room-photo-track flex"
      :class="{ 'room-photo-track--no-tween': noTransition }"
      :style="{
        gap: `${gapPx}px`,
        transform: `translate3d(${trackTranslateX}px, 0, 0)`,
      }"
      @transitionend="onTrackTransitionEnd"
    >
      <article
        v-for="(src, t) in trackSlides"
        :key="`room-track-${t}`"
        class="room-photo-slide shrink-0 overflow-hidden"
        :style="{
          width: slideW ? `${slideW}px` : '100%',
          aspectRatio: `${DESKTOP_SLIDE_W} / ${DESKTOP_SLIDE_H}`,
        }"
      >
        <img
          :src="src"
          :alt="
            n <= 1
              ? 'Room photo'
              : t >= REAL_START && t <= realEnd
                ? `Room photo ${t - REAL_START + 1} of ${n}`
                : ''
          "
          :width="DESKTOP_SLIDE_W"
          :height="DESKTOP_SLIDE_H"
          class="size-full object-cover"
        />
      </article>
    </div>

    <button
      v-if="n > 1"
      type="button"
      class="absolute top-1/2 left-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-transparent text-white transition-opacity hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:left-6 md:size-12"
      aria-label="Previous photo"
      @click="goPrev"
    >
      <ChevronLeft class="size-6 md:size-7" aria-hidden="true" :stroke-width="1.35" />
    </button>

    <button
      v-if="n > 1"
      type="button"
      class="absolute top-1/2 right-3 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-transparent text-white transition-opacity hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-6 md:size-12"
      aria-label="Next photo"
      @click="goNext"
    >
      <ChevronRight class="size-6 md:size-7" aria-hidden="true" :stroke-width="1.35" />
    </button>

    <div
      v-if="n > 1"
      class="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 md:bottom-4"
      aria-hidden="true"
    >
      <span
        v-for="idx in n"
        :key="idx - 1"
        class="block size-1.5 rounded-full transition-colors"
        :class="idx - 1 === activeSlide ? 'bg-white' : 'bg-white/45'"
      />
    </div>
  </div>
</template>

<style scoped>
.room-photo-track {
  transition: transform 0.45s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}
.room-photo-track--no-tween {
  transition: none;
}
</style>
