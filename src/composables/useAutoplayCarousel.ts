import { onMounted, onUnmounted, ref, type Ref } from "vue"

export function useAutoplayCarousel(
  length: Ref<number> | number,
  intervalMs: number,
): {
  index: Ref<number>
  next: () => void
  prev: () => void
  pause: () => void
  resume: () => void
} {
  const index = ref(0)
  let timer: ReturnType<typeof setInterval> | null = null
  const paused = ref(false)

  const len = () => (typeof length === "number" ? length : length.value)

  const next = () => {
    const n = len()
    if (n <= 0) return
    index.value = (index.value + 1) % n
  }

  const prev = () => {
    const n = len()
    if (n <= 0) return
    index.value = (index.value - 1 + n) % n
  }

  const tick = () => {
    if (!paused.value) next()
  }

  const pause = () => {
    paused.value = true
  }

  const resume = () => {
    paused.value = false
  }

  onMounted(() => {
    timer = setInterval(tick, intervalMs)
  })

  onUnmounted(() => {
    if (timer) clearInterval(timer)
    timer = null
  })

  return { index, next, prev, pause, resume }
}
