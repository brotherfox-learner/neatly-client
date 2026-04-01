<script setup lang="ts">
import { computed, ref } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  DataZoomComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import { format, startOfMonth, endOfMonth, addMonths, differenceInDays } from 'date-fns'
import { Button } from '@/components/ui/button'
import SingleDatePicker from '@/components/dashboard/SingleDatePicker.vue'

use([
  LineChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  DataZoomComponent,
  CanvasRenderer,
])

const REVENUE_MODES = [
  { id: 'booking_date', label: 'Booking Date' },
  { id: 'stay_date', label: 'Stay Date' },
]

const GRANULARITY_OPTIONS = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
]

const SKELETON_DATA = [
  { label: 'Jan', revenue: 38000 },
  { label: 'Feb', revenue: 16000 },
  { label: 'Mar', revenue: 51000 },
  { label: 'Apr', revenue: 66000 },
  { label: 'May', revenue: 39000 },
  { label: 'Jun', revenue: 56000 },
]

const props = defineProps<{
  dateFrom: Date | null
  dateTo: Date | null
  mode: string
  granularity: string
  data: Array<{ label: string; revenue: number }>
  loading: boolean
  useLive: boolean
}>()

const emit = defineEmits<{
  'date-from-change': [date: Date | null]
  'date-to-change': [date: Date | null]
  'mode-change': [mode: string]
  'granularity-change': [granularity: string]
  'toggle-live': []
}>()

// ── Computed granularity (force day if range <= 30d) ───────────
const effectiveGranularity = computed(() => {
  if (!props.dateFrom || !props.dateTo) return props.granularity
  const days = differenceInDays(props.dateTo, props.dateFrom)
  const sameMonth = format(props.dateFrom, 'yyyy-MM') === format(props.dateTo, 'yyyy-MM')
  if (days <= 30 || sameMonth) return 'day'
  return props.granularity
})

// ── Format & group data ────────────────────────────────────────
const formattedData = computed(() => {
  if (effectiveGranularity.value === 'day') {
    return props.data.map((item) => ({
      ...item,
      displayLabel: format(new Date(item.label), 'd MMM'),
      rangeText: format(new Date(item.label), 'd MMM yyyy'),
    }))
  }
  // group by month
  const monthMap = new Map<string, number>()
  for (const item of props.data) {
    const key = format(startOfMonth(new Date(item.label)), 'yyyy-MM-dd')
    monthMap.set(key, (monthMap.get(key) ?? 0) + (item.revenue ?? 0))
  }
  const months: any[] = []
  if (props.dateFrom && props.dateTo) {
    let cursor = startOfMonth(props.dateFrom)
    const endMonth = addMonths(startOfMonth(props.dateTo), 1)
    while (cursor < endMonth) {
      const key = format(cursor, 'yyyy-MM-dd')
      const revenue = monthMap.get(key) ?? 0
      const rangeStart = cursor < props.dateFrom ? props.dateFrom : cursor
      const rangeEnd = endOfMonth(cursor) > props.dateTo ? props.dateTo : endOfMonth(cursor)
      months.push({
        label: key,
        revenue,
        displayLabel: format(cursor, 'MMM yyyy'),
        rangeText: `${format(rangeStart, 'd MMM yyyy')} - ${format(rangeEnd, 'd MMM yyyy')}`,
      })
      cursor = addMonths(cursor, 1)
    }
  }
  return months
})

const chartData = computed(() =>
  props.loading
    ? SKELETON_DATA.map((d) => ({ ...d, displayLabel: d.label, rangeText: d.label }))
    : formattedData.value,
)

// ── Y ticks ────────────────────────────────────────────────────
const yMax = computed(() => {
  const values = chartData.value.map((d) => Number(d.revenue) || 0)
  const max = Math.max(0, ...values)
  if (max <= 0) return 1000
  const pow = Math.pow(10, Math.floor(Math.log10(max / 8)))
  const n = max / 8 / pow
  const step = (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow
  return Math.ceil(max / step) * step
})

// ── ECharts option ─────────────────────────────────────────────
const chartOption = computed(() => ({
  grid: { top: 8, right: 0, left: 60, bottom: 30 },
  xAxis: {
    type: 'category',
    data: chartData.value.map((d) => d.displayLabel ?? d.label),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#646d89', fontSize: 12 },
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: yMax.value,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: '#646d89',
      fontSize: 12,
      formatter: (v: number) => Math.round(v).toLocaleString(),
    },
    splitLine: { lineStyle: { color: '#e4e6ed' } },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
    formatter: (params: any) => {
      const d = chartData.value[params[0]?.dataIndex]
      if (!d) return ''
      const header = d.rangeText ?? d.displayLabel ?? d.label
      const amount = Math.max(0, Math.round(Number(d.revenue) || 0))
      return `
        <div style="font-size:12px; display:flex; flex-direction:column; gap:4px">
          <span style="font-weight:600">${header}</span>
          <span>Revenue: <b>฿${amount.toLocaleString()}</b></span>
        </div>
      `
    },
  },
  series: [
    {
      type: 'line',
      data: chartData.value.map((d) => d.revenue),
      smooth: true,
      symbol: 'none',
      lineStyle: {
        color: props.loading ? '#e4e6ed' : '#e76b39',
        width: 2,
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: props.loading ? 'rgba(228,230,237,0.3)' : 'rgba(231,107,57,0.3)' },
            { offset: 1, color: 'rgba(231,107,57,0)' },
          ],
        },
      },
    },
  ],
}))

// ── Export CSV ─────────────────────────────────────────────────
function handleExport() {
  const range =
    props.dateFrom && props.dateTo
      ? `${format(props.dateFrom, 'yyyy-MM-dd')}_${format(props.dateTo, 'yyyy-MM-dd')}`
      : 'revenue'
  const csv =
    `Period,Revenue (THB)\n` +
    chartData.value
      .map((d) => `${d.displayLabel ?? d.label},${Math.round(Number(d.revenue) || 0)}`)
      .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `revenue_trend_${props.mode}_${range}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── disabled date helpers ──────────────────────────────────────
const today = new Date()

function disabledFrom(date: Date) {
  return props.mode === 'booking_date' ? date > today : false
}

function disabledTo(date: Date) {
  if (props.mode === 'booking_date') {
    if (!props.dateFrom) return date > today
    return date < props.dateFrom || date > today
  }
  return props.dateFrom ? date < props.dateFrom : false
}
</script>

<template>
  <article class="flex flex-col gap-[40px]" aria-labelledby="revenue-trend-title">
    <!-- Header + Filters in one row -->
    <header
      class="flex flex-col gap-[16px] lg:flex-row lg:items-center lg:justify-between"
    >
      <h2 id="revenue-trend-title" class="headline-5 text-gray-600">Revenue Trend</h2>

      <div class="flex flex-col gap-[8px] lg:flex-row lg:items-center lg:gap-[16px]">
        <!-- From -->
        <div class="flex items-center gap-[8px]">
          <label class="body-2 text-gray-600 whitespace-nowrap">From</label>
          <SingleDatePicker
            :model-value="dateFrom"
            placeholder="Select start date"
            :disabled-date="disabledFrom"
            @update:model-value="emit('date-from-change', $event)"
          />
        </div>

        <!-- To -->
        <div class="flex items-center gap-[8px]">
          <label class="body-2 text-gray-600 whitespace-nowrap">To</label>
          <SingleDatePicker
            :model-value="dateTo"
            placeholder="Select end date"
            :disabled-date="disabledTo"
            @update:model-value="emit('date-to-change', $event)"
          />
        </div>

        <!-- Export -->
        <Button
          variant="primary"
          size="ghost"
          class="w-full h-[40px] lg:w-[167px]"
          @click="handleExport"
        >
          Export
        </Button>
      </div>
    </header>

    <!-- Chart -->
    <div class="w-full min-h-[240px]">
      <div
        v-if="!loading && chartData.length === 0"
        class="flex items-center justify-center h-[240px] body-2 text-gray-400"
      >
        No data for selected range
      </div>
      <VChart v-else style="width: 100%; height: 295px" :option="chartOption" autoresize />
    </div>
  </article>
</template>
