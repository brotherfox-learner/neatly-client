<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import { GridComponent, TooltipComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([LineChart, GridComponent, TooltipComponent, CanvasRenderer])

const PERIODS = [
  { id: 'realtime',     label: 'Real-time' },
  { id: 'yesterday',    label: 'Yesterday' },
  { id: 'last_7_days',  label: 'Last 7 days' },
  { id: 'last_30_days', label: 'Last 30 days' },
]

const STATIC_PAGES_BEFORE = [
  { id: 'all',            label: 'All pages' },
  { id: 'homepage',       label: 'Homepage' },
  { id: 'search_rooms',   label: 'Search rooms' },
  { id: 'booking',        label: 'Booking' },
  { id: 'booking_action', label: 'Booking actions' },
  { id: 'room_details',   label: 'Room details' },
]

const STATIC_PAGES_AFTER = [
  { id: 'login',          label: 'Login' },
  { id: 'register',       label: 'Register' },
  { id: 'user_profile',   label: 'User profile' },
  { id: 'payment_method', label: 'Payment method' },
]

const SKELETON_DATA = [
  { label: '12:00 AM', value: 12 },
  { label: '4:00 AM',  value: 8 },
  { label: '8:00 AM',  value: 24 },
  { label: '12:00 PM', value: 32 },
  { label: '4:00 PM',  value: 28 },
  { label: '8:00 PM',  value: 18 },
  { label: '11:59 PM', value: 14 },
]

const props = defineProps<{
  pageId: string
  periodId: string
  data: Array<{ label: string; value: number }>
  loading: boolean
  roomOptions?: Array<{ id: string; label: string }>
}>()

const emit = defineEmits<{
  'page-change':   [value: string]
  'period-change': [value: string]
}>()

const isMobile = ref(false)
onMounted(() => {
  const check = () => { isMobile.value = window.innerWidth < 768 }
  check()
  window.addEventListener('resize', check)
  onUnmounted(() => window.removeEventListener('resize', check))
})

const pageOptions = computed(() => [
  ...STATIC_PAGES_BEFORE,
  ...(props.roomOptions ?? []),
  ...STATIC_PAGES_AFTER,
])

// ── Label formatter ────────────────────────────────────────────
function formatTrafficLabel(rawLabel: string, periodId: string): string {
  if (!rawLabel) return ''
  const parsed = new Date(rawLabel)
  if (isNaN(parsed.getTime())) return rawLabel

  if (periodId === 'realtime' || periodId === 'yesterday') {
    const h = parsed.getHours()
    const m = parsed.getMinutes().toString().padStart(2, '0')
    const period = h >= 12 ? 'PM' : 'AM'
    const h12 = h % 12 || 12
    return `${h12}:${m} ${period}`
  }

  if (periodId === 'last_7_days' || periodId === 'last_30_days') {
    const day = parsed.getDate()
    const month = parsed.toLocaleString('en-US', { month: 'short' })
    return `${day} ${month}`
  }

  return rawLabel
}

// ── Formatted chart data ───────────────────────────────────────
const formattedData = computed(() =>
  (props.data ?? []).map(item => ({
    ...item,
    labelFormatted: formatTrafficLabel(item.label, props.periodId),
  }))
)

// ── MAX_X_TICKS interval ───────────────────────────────────────
const xTickInterval = computed(() => {
  const len = formattedData.value.length
  const max = isMobile.value ? 5 : 8
  if (len <= max) return 0
  return Math.ceil(len / max) - 1
})

// ── Chart option ───────────────────────────────────────────────
const chartOption = computed(() => {
  const isLoading = props.loading
  const data = isLoading ? SKELETON_DATA : formattedData.value

  return {
    grid: { top: 8, right: 8, left: 32, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map(d => (d as any).labelFormatted ?? d.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#9aa1b9',
        fontSize: 11,
        interval: isLoading ? 0 : xTickInterval.value,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#9aa1b9', fontSize: 11 },
      splitLine: { lineStyle: { color: '#f1f2f6' } },
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: any) => {
        const d = data[params[0]?.dataIndex] as any
        if (!d) return ''
        const label = d.labelFormatted ?? d.label
        const value = Number(d.value ?? 0).toLocaleString()
        return `
          <div style="font-size:12px">
            <p style="color:#646d89">${label}</p>
            <p>Visitors: <b>${value}</b></p>
          </div>
        `
      },
    },
    series: [{
      type: 'line',
      data: data.map(d => d.value),
      smooth: true,
      symbol: 'none',
      lineStyle: { color: isLoading ? '#e4e6ed' : '#e76b39', width: 2 },
      areaStyle: {
        color: {
          type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: isLoading ? 'rgba(228,230,237,0.4)' : 'rgba(231,107,57,0.4)' },
            { offset: 1, color: 'rgba(0,0,0,0)' },
          ],
        },
      },
    }],
  }
})
</script>

<template>
  <article class="flex flex-col gap-[24px]" aria-labelledby="website-traffic-title">

    <!-- Header -->
    <header class="flex flex-row items-center justify-between gap-2">
      <h2 id="website-traffic-title" class="headline-5 text-gray-600">Website traffic</h2>

      <div class="flex flex-col items-stretch gap-2 lg:flex-row lg:items-center lg:gap-3">
        <!-- Page select -->
        <select
          :value="pageId"
          class="w-[136px] h-[40px] border border-gray-300 rounded-[8px] px-3 text-[14px] text-gray-900 hover:border-orange-500 focus:outline-none"
          @change="emit('page-change', ($event.target as HTMLSelectElement).value)"
        >
          <option v-for="p in pageOptions" :key="p.id" :value="p.id">{{ p.label }}</option>
        </select>

        <!-- Period buttons desktop -->
        <div class="hidden lg:flex flex-row gap-[8px] overflow-x-auto whitespace-nowrap">
          <button
            v-for="period in PERIODS"
            :key="period.id"
            type="button"
            class="h-[40px] px-[12px] py-[4px] text-[16px] rounded-[8px] border hover:border-orange-500 hover:cursor-pointer transition-colors"
            :class="periodId === period.id
              ? 'text-orange-500 bg-orange-100 border-orange-500'
              : 'text-gray-900 border-gray-300'"
            @click="emit('period-change', period.id)"
          >
            {{ period.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Period buttons mobile -->
    <div class="flex flex-row gap-[8px] overflow-x-auto whitespace-nowrap lg:hidden">
      <button
        v-for="period in PERIODS"
        :key="period.id"
        type="button"
        class="px-[12px] py-[4px] text-[16px] rounded-[4px] border transition-colors hover:cursor-pointer"
        :class="periodId === period.id
          ? 'text-orange-500 bg-orange-100 border-orange-500'
          : 'text-gray-900 border-gray-300'"
        @click="emit('period-change', period.id)"
      >
        {{ period.label }}
      </button>
    </div>

    <!-- Chart -->
    <div class="w-full min-h-[220px]">
      <div
        v-if="!loading && (!data || data.length === 0)"
        class="flex items-center justify-center h-[295px] body-2 text-gray-400"
      >
        No traffic data for selected filters
      </div>
      <VChart
        v-else
        style="width: 100%; height: 295px"
        :option="chartOption"
        autoresize
      />
    </div>

  </article>
</template>