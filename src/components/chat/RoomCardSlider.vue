<script setup lang="ts">
import { computed, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import type { RoomCard } from '@/stores/chat'

const props = defineProps<{
  cards: RoomCard[]
  action?: string
}>()

const router = useRouter()

/** Smooth horizontal scroll follow (per component instance). */
let rafId = 0
let targetScrollLeft = 0
let activeTrack: HTMLElement | null = null
const LERP = 0.26
const SNAP_EPS = 0.4

function stopScrollAnimation() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = 0
  }
}

function scrollTick() {
  const el = activeTrack
  if (!el) {
    rafId = 0
    return
  }
  const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
  targetScrollLeft = Math.min(maxScroll, Math.max(0, targetScrollLeft))
  const diff = targetScrollLeft - el.scrollLeft
  if (Math.abs(diff) < SNAP_EPS) {
    el.scrollLeft = targetScrollLeft
    rafId = 0
    return
  }
  el.scrollLeft += diff * LERP
  rafId = requestAnimationFrame(scrollTick)
}

function onSliderScroll(e: Event) {
  const el = e.target as HTMLElement
  if (rafId) return
  targetScrollLeft = el.scrollLeft
}

function onSliderWheel(e: WheelEvent) {
  const el = e.currentTarget as HTMLElement
  activeTrack = el
  const maxScroll = el.scrollWidth - el.clientWidth
  if (maxScroll <= 0) return

  const lineHeight = Number.parseFloat(getComputedStyle(el).lineHeight) || 16
  let dy = e.deltaY
  let dx = e.deltaX
  if (e.deltaMode === WheelEvent.DOM_DELTA_LINE) {
    dy *= lineHeight
    dx *= lineHeight
  } else if (e.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    dy *= el.clientHeight
    dx *= el.clientHeight
  }

  const delta = Math.abs(dy) >= Math.abs(dx) ? dy : dx

  const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion) {
    stopScrollAnimation()
    el.scrollLeft = Math.min(maxScroll, Math.max(0, el.scrollLeft + delta))
    targetScrollLeft = el.scrollLeft
    return
  }

  if (!rafId) {
    targetScrollLeft = el.scrollLeft
  }
  targetScrollLeft = Math.min(maxScroll, Math.max(0, targetScrollLeft + delta))
  if (!rafId) {
    rafId = requestAnimationFrame(scrollTick)
  }
}

onBeforeUnmount(() => {
  stopScrollAnimation()
  activeTrack = null
})

const actionLabel = computed(() => (props.action === 'book_now' ? 'Book now' : 'View details'))

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price)
}

const handleAction = (room: RoomCard) => {
  if (props.action === 'book_now') {
    router.push({ name: 'room-detail', params: { id: room.id }, query: { book: 'true' } })
  } else {
    router.push({ name: 'room-detail', params: { id: room.id } })
  }
}
</script>

<template>
  <div class="room-card-slider">
    <div
      class="slider-container"
      @wheel.prevent.stop="onSliderWheel"
      @scroll.passive="onSliderScroll"
    >
      <article v-for="room in cards" :key="room.id" class="room-card">
        <div class="card-image-wrap">
          <img
            v-if="room.imageUrl"
            :src="room.imageUrl"
            :alt="room.name"
            class="card-image"
          />
          <div v-else class="card-image-placeholder">No image</div>
        </div>
        <div class="card-body">
          <h4 class="room-name">{{ room.name }}</h4>
          <div class="price-row">
            <template v-if="room.discountedPrice != null">
              <span class="price-current">{{ formatPrice(room.discountedPrice) }}</span>
              <span class="price-base price-base--struck">{{ formatPrice(room.basePrice) }}</span>
            </template>
            <template v-else>
              <span class="price-current">{{ formatPrice(room.basePrice) }}</span>
            </template>
          </div>
          <p v-if="room.description" class="room-desc">{{ room.description }}</p>
          <button type="button" class="card-footer" @click.prevent="handleAction(room)">
            <span class="card-footer-label">{{ actionLabel }}</span>
            <svg class="card-footer-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.room-card-slider {
  margin: 4px 0 14px;
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.slider-container {
  display: flex;
  overflow-x: auto;
  overflow-y: hidden;
  gap: 14px;
  padding-bottom: 10px;
  scroll-snap-type: none;
  overscroll-behavior-x: contain;
  overscroll-behavior-y: none;
  min-width: 0;
}

.slider-container::-webkit-scrollbar {
  height: 4px;
}
.slider-container::-webkit-scrollbar-track {
  background: transparent;
}
.slider-container::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 4px;
}

.room-card {
  flex: 0 0 calc(82% - 8px);
  max-width: 220px;
  background: #ffffff;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(15, 23, 42, 0.08);
  border: 1px solid #e8ecf0;
  scroll-snap-align: start;
}

.card-image-wrap {
  width: 100%;
  aspect-ratio: 16 / 10;
  background: #f1f5f9;
}

.card-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px 14px 0 0;
}

.card-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #94a3b8;
  font-size: 12px;
}

.card-body {
  padding: 12px 12px 0;
}

.room-name {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price-row {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.price-current {
  font-size: 15px;
  font-weight: 700;
  color: #c04e1d;
}

.price-base {
  font-size: 13px;
  color: #64748b;
}

.price-base--struck {
  text-decoration: line-through;
  font-size: 12px;
  color: #94a3b8;
}

.room-desc {
  margin: 0 0 10px;
  font-size: 12px;
  line-height: 1.45;
  color: #64748b;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: calc(100% + 24px);
  margin-left: -12px;
  margin-right: -12px;
  padding: 10px 14px;
  border: none;
  background: rgba(192, 78, 29, 0.1);
  cursor: pointer;
  transition: background 0.2s;
}

.card-footer:hover {
  background: rgba(192, 78, 29, 0.16);
}

.card-footer-label {
  font-size: 13px;
  font-weight: 600;
  color: #c04e1d;
}

.card-footer-chevron {
  width: 18px;
  height: 18px;
  color: #c04e1d;
  flex-shrink: 0;
}
</style>
