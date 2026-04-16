<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
} from "vue"
import { api } from "@/lib/api"

const images = [
  "/LandingPagePic/SlidePic1.jpg",
  "/LandingPagePic/SlidePic2.jpg",
  "/LandingPagePic/SlidePic3.jpg",
  "/LandingPagePic/SlidePic4.jpg",
  "/LandingPagePic/SlidePic5.jpg",
] as const

/**
 * 3 clones on each side so the viewport (≈3.6 slides wide) is
 * always filled even when the active slide is the clone itself.
 *
 * track = [img3c, img4c, img5c, img1, img2, img3, img4, img5, img1c, img2c, img3c]
 * idx  =   0      1      2      3     4     5     6     7     8      9      10
 *
 * REAL_START = 3 (img1), REAL_END = 7 (img5)
 * goNext from img5 → trackIndex 8 (clone-img1) → snap to 3
 * goPrev from img1 → trackIndex 2 (clone-img5) → snap to 7
 */
const CLONES = 3
const REAL_START = CLONES              // 3
const REAL_END = REAL_START + images.length - 1  // 7

const trackSlides = computed(() => {
  const before = Array.from({ length: CLONES }, (_, i) =>
    images[(images.length - CLONES + i) % images.length]!,
  )
  const after = Array.from({ length: CLONES }, (_, i) =>
    images[i % images.length]!,
  )
  return [...before, ...images, ...after]
})

const hotelName = ref("Neatly Hotel")
const aboutDescription = ref(
  "Set in Bangkok, Thailand. Neatly Hotel offers 5-star accommodation with an outdoor pool, kids' club, sports facilities and a fitness centre. There is also a spa, an indoor pool and saunas.\n\nAll units at the hotel are equipped with a seating area, a flat-screen TV with satellite channels, a dining area and a private bathroom with free toiletries, a bathtub and a hairdryer. Every room in Neatly Hotel features a furnished balcony. Some rooms are equipped with a coffee machine.\n\nFree WiFi and entertainment facilities are available at property and also rentals are provided to explore the area.",
)
const hotelNameParts = computed(() => {
  const value = hotelName.value.trim()
  if (!value) return { first: "Neatly", rest: "Hotel" }
  const words = value.split(/\s+/)
  if (words.length === 1) return { first: words[0] ?? "Neatly", rest: "Hotel" }
  return { first: words[0] ?? "Neatly", rest: words.slice(1).join(" ") }
})
const aboutParagraphs = computed(() =>
  aboutDescription.value
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean),
)

/** Design spec: 400 px per slide at 1440 vw */
const DESIGN_W = 1440
const SLIDE_NATURAL_W = 400

const viewportEl = ref<HTMLElement | null>(null)
const trackEl = ref<HTMLElement | null>(null)
const viewportW = ref(0)
const isDesktop = ref(false)

const activeSlide = ref(0)           // 0–4 (mobile + desktop label)
const trackIndex = ref(REAL_START)   // real slides at REAL_START..REAL_END
const noTransition = ref(false)
const paused = ref(false)
const transitioning = ref(false)

let autoTimer: ReturnType<typeof setInterval> | null = null
let ro: ResizeObserver | null = null

const slideW = computed(() =>
  viewportW.value
    ? Math.round(viewportW.value * (SLIDE_NATURAL_W / DESIGN_W))
    : SLIDE_NATURAL_W,
)

/** Center the active trackIndex in the viewport */
const trackOffset = computed(() => {
  const V = viewportW.value || DESIGN_W
  const S = slideW.value
  const k = trackIndex.value
  return Math.round(V / 2 - k * S - S / 2)
})

function measureViewport() {
  if (viewportEl.value) viewportW.value = viewportEl.value.clientWidth
}

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
  if (!isDesktop.value) {
    activeSlide.value = (activeSlide.value + 1) % images.length
    return
  }
  if (transitioning.value) return
  transitioning.value = true

  if (activeSlide.value < images.length - 1) {
    activeSlide.value++
    trackIndex.value++
  } else {
    activeSlide.value = 0
    trackIndex.value = REAL_END + 1  // = 8 → clone-img1
  }
}

function goPrev() {
  if (!isDesktop.value) {
    activeSlide.value = (activeSlide.value - 1 + images.length) % images.length
    return
  }
  if (transitioning.value) return
  transitioning.value = true

  if (activeSlide.value > 0) {
    activeSlide.value--
    trackIndex.value--
  } else {
    activeSlide.value = images.length - 1
    trackIndex.value = REAL_START - 1  // = 2 → clone-img5
  }
}

function onTrackTransitionEnd(e: TransitionEvent) {
  if (e.target !== trackEl.value || e.propertyName !== "transform") return

  if (trackIndex.value > REAL_END) {
    jumpNoTransition(() => { trackIndex.value = REAL_START })
  } else if (trackIndex.value < REAL_START) {
    jumpNoTransition(() => { trackIndex.value = REAL_END })
  }

  transitioning.value = false
}

function pause() { paused.value = true }
function resume() { paused.value = false }

async function loadHotelInfo() {
  try {
    const { data } = await api.get<unknown>("/api/v1/public/hotel-info")
    if (typeof data !== "object" || data === null) return
    const raw = data as Record<string, unknown>
    if (typeof raw.hotelName === "string" && raw.hotelName.trim()) {
      hotelName.value = raw.hotelName.trim()
    }
    if (typeof raw.aboutDescription === "string" && raw.aboutDescription.trim()) {
      aboutDescription.value = raw.aboutDescription.trim()
    }
  } catch {
    // keep defaults when API is unavailable
  }
}

onMounted(() => {
  const mql = window.matchMedia("(min-width: 768px)")
  isDesktop.value = mql.matches
  mql.addEventListener("change", (e) => {
    isDesktop.value = e.matches
    if (e.matches) {
      trackIndex.value = activeSlide.value + REAL_START
    }
  })

  measureViewport()
  ro = new ResizeObserver(measureViewport)
  if (viewportEl.value) ro.observe(viewportEl.value)
  nextTick(measureViewport)

  autoTimer = setInterval(() => { if (!paused.value) goNext() }, 4000)
  void loadHotelInfo()
})

onBeforeUnmount(() => {
  ro?.disconnect()
  if (autoTimer) clearInterval(autoTimer)
})
</script>

<template>
  <section
    id="about-neatly"
    class="min-h-[824px] scroll-mt-24 bg-bg md:min-h-[1178px]"
    aria-labelledby="about-neatly-heading"
  >
    <!-- ─── Text: "Neatly" top-left, "Hotel" beside it; body below-right of "Neatly" (like Enter + Tab) ─── -->
    <div
      class="mx-auto max-w-[90%] px-4 pt-12 pb-10 md:pt-42 md:pb-42 lg:px-10 xl:px-[160px]"
    >
      <div
        class="grid w-full grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 sm:gap-x-4 md:gap-x-6 md:gap-y-5"
      >
        <h2 id="about-neatly-heading" class="contents">
          <span class="landing-about-title col-start-1 row-start-1 leading-tight">{{ hotelNameParts.first }}</span>
          <span class="landing-about-title col-start-2 row-start-1 min-w-0 leading-tight">{{ hotelNameParts.rest }}</span>
        </h2>
        <div
          class="body-1 font-inter col-start-2 row-start-2 min-w-0 space-y-4 text-[#646D89]"
        >
          <p v-for="(paragraph, idx) in aboutParagraphs" :key="`about-paragraph-${idx}`">
            {{ paragraph }}
          </p>
        </div>
      </div>
    </div>

    <!-- ─── Mobile: single image + side arrows ─── -->
    <div
      class="px-4 pb-12 md:hidden"
      @touchstart.passive="pause"
      @touchend="resume"
      @mouseenter="pause"
      @mouseleave="resume"
    >
      <div class="flex items-center justify-center gap-3">
        <button
          type="button"
          class="border-border flex size-[25.2px] shrink-0 items-center justify-center rounded-full border bg-white shadow-sm"
          aria-label="Previous slide"
          @click="goPrev"
        >
          <img src="/Icon%20figma/arrow-left.svg" alt="" width="11" height="11" class="size-[10.8px]" />
        </button>

        <div
          class="relative aspect-180/225 w-[min(180px,55vw)] overflow-hidden rounded-md"
          role="region"
          aria-label="Hotel gallery"
          aria-live="polite"
        >
          <img
            v-for="(src, i) in images"
            :key="src"
            :src="src"
            :alt="`Hotel gallery image ${i + 1} of ${images.length}`"
            width="180"
            height="225"
            class="absolute inset-0 size-full object-cover transition-opacity duration-700"
            :class="i === activeSlide ? 'z-1 opacity-100' : 'z-0 opacity-0'"
          />
        </div>

        <button
          type="button"
          class="border-border flex size-[25.2px] shrink-0 items-center justify-center rounded-full border bg-white shadow-sm"
          aria-label="Next slide"
          @click="goNext"
        >
          <img src="/Icon%20figma/arrow-right.svg" alt="" width="11" height="11" class="size-[10.8px]" />
        </button>
      </div>
    </div>

    <!-- ─── Desktop: FULL-BLEED carousel (no horizontal padding) ─── -->
    <div
      ref="viewportEl"
      class="relative hidden w-full overflow-hidden pb-20 md:block"
      :style="{ '--slide-w': `${slideW}px` }"
      role="region"
      aria-roledescription="carousel"
      aria-label="Hotel gallery"
      aria-live="polite"
      @mouseenter="pause"
      @mouseleave="resume"
    >
      <!-- Track -->
      <div
        ref="trackEl"
        class="about-track flex"
        :class="noTransition ? 'about-track--no-tween' : ''"
        :style="{ transform: `translate3d(${trackOffset}px,0,0)` }"
        @transitionend="onTrackTransitionEnd"
      >
        <article
          v-for="(src, t) in trackSlides"
          :key="`t${t}`"
          class="about-slide shrink-0 overflow-hidden"
          :class="t === trackIndex ? 'about-slide--active' : 'about-slide--inactive'"
        >
          <img
            :src="src"
            :alt="t >= 1 && t <= 5 ? `Hotel gallery image ${t} of 5` : ''"
            width="400"
            height="500"
            class="about-slide-img block size-full object-cover"
          />
        </article>
      </div>

      <!-- Prev arrow — centered on the image LEFT of active -->
      <button
        type="button"
        class="about-arrow about-arrow--prev"
        aria-label="Previous slide"
        @click="goPrev"
      >
        <span class="about-arrow-ring" aria-hidden="true" />
        <img
          src="/Icon%20figma/arrow-left.svg"
          alt=""
          width="24"
          height="24"
          class="about-arrow-icon"
        />
      </button>

      <!-- Next arrow — centered on the image RIGHT of active -->
      <button
        type="button"
        class="about-arrow about-arrow--next"
        aria-label="Next slide"
        @click="goNext"
      >
        <span class="about-arrow-ring" aria-hidden="true" />
        <img
          src="/Icon%20figma/arrow-right.svg"
          alt=""
          width="24"
          height="24"
          class="about-arrow-icon"
        />
      </button>
    </div>
  </section>
</template>

<style scoped>
/* ── Track ─────────────────────────────────────────────── */
.about-track {
  width: max-content;
  transition: transform 0.75s cubic-bezier(0.25, 0.1, 0.25, 1);
  will-change: transform;
}
.about-track--no-tween {
  transition: none;
}

/* ── Each slide ─────────────────────────────────────────── */
.about-slide {
  width: var(--slide-w, 400px);
  aspect-ratio: 400 / 500;
  flex-shrink: 0;
}

.about-slide-img {
  transition:
    transform 0.75s cubic-bezier(0.25, 0.1, 0.25, 1),
    filter 0.75s ease;
}

.about-slide--active .about-slide-img {
  transform: scale(1.06);
  filter: brightness(1);
}

.about-slide--inactive .about-slide-img {
  transform: scale(1);
  filter: brightness(0.82);
}

/* ── Arrow buttons ──────────────────────────────────────── */
.about-arrow {
  position: absolute;
  top: 50%;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  transform: translate(-50%, -50%);
}

.about-arrow:focus-visible {
  outline: 2px solid rgba(255, 255, 255, 0.9);
  outline-offset: 3px;
  border-radius: 9999px;
}

/*
 * Position arrows at the center of the image adjacent to the active one:
 *   prev  → 50% - 1 × slideW   (center of the image to the LEFT)
 *   next  → 50% + 1 × slideW   (center of the image to the RIGHT)
 */
.about-arrow--prev {
  left: calc(50% - var(--slide-w, 400px));
}
.about-arrow--next {
  left: calc(50% + var(--slide-w, 400px));
}

.about-arrow-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 1.5px solid rgba(255, 255, 255, 0.85);
  background: rgba(0, 0, 0, 0.18);
  transition:
    border-color 0.2s ease,
    background-color 0.2s ease;
}

.about-arrow:hover .about-arrow-ring {
  border-color: #fff;
  background: rgba(255, 255, 255, 0.12);
}

.about-arrow-icon {
  position: relative;
  z-index: 1;
  width: 1.5rem;
  height: 1.5rem;
  filter: brightness(0) invert(1);
}
</style>
