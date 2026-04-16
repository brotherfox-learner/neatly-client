<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { LineChart, BarChart } from 'echarts/charts'
import {
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  LegendComponent,
} from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  differenceInDays,
} from 'date-fns'
import { Button } from '@/components/ui/button'
import SingleDatePicker from '@/components/dashboard/SingleDatePicker.vue'
import CashIcon from '@/assets/icons/cash.svg'
import CreditIcon from '@/assets/icons/credit.svg'

use([
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  MarkLineComponent,
  LegendComponent,
  CanvasRenderer,
])

const GRANULARITY_OPTIONS = [
  { id: 'day', label: 'Day' },
  { id: 'month', label: 'Month' },
]

const SKELETON_DATA = [
  { label: 'Jan', percent: 32 },
  { label: 'Feb', percent: 45 },
  { label: 'Mar', percent: 68 },
  { label: 'Apr', percent: 78 },
  { label: 'May', percent: 54 },
  { label: 'Jun', percent: 82 },
]

const ROOM_TYPE_COLORS = ['#e76b39', '#465c50', '#E5A5A5', '#F5DA81', '#A8D4E0', '#C4B5D4']

const props = defineProps<{
  dateFrom: Date | null
  dateTo: Date | null
  viewBy: string
  granularity: string
  resolvedGranularity?: string
  data: {
    occupancySeries: Array<{
      date: string
      percent: number
      occupiedRooms?: number
      totalRooms?: number
    }>
    occupancyByRoomTypeSeries: Array<Record<string, any>>
    roomTypes: Array<{ id: string; label: string }>
    guestVisit: {
      totalGuests: number
      segments: Array<{ id: string; label: string; count: number; percent: number }>
    }
    paymentMethods: Array<{ id: string; label: string; count: number; percent: number }>
  }
  loading: boolean
  useLive: boolean
  autoGroupMeta?: { resolvedGranularity?: string; didAutoGroup?: boolean; reason?: string | null }
}>()

const emit = defineEmits<{
  'date-from-change': [date: Date | null]
  'date-to-change': [date: Date | null]
  'view-by-change': [value: string]
  'granularity-change': [value: string]
  'toggle-live': []
}>()

// ── Mobile detection + reset viewBy ───────────────────────────
const isMobile = ref(false)

onMounted(() => {
  const check = () => {
    isMobile.value = window.innerWidth < 768
    if (isMobile.value && props.viewBy === 'room_types') {
      emit('view-by-change', 'overall')
    }
  }
  check()
  window.addEventListener('resize', check)
  onUnmounted(() => window.removeEventListener('resize', check))
})

// ── MAX_X_TICKS ────────────────────────────────────────────────
const MAX_X_TICKS = computed(() => (isMobile.value ? 5 : 8))

const xTickInterval = computed(() => {
  const len = occupancyChartData.value.length
  if (len <= MAX_X_TICKS.value) return 0
  return Math.ceil(len / MAX_X_TICKS.value) - 1
})

// ── Effective granularity ──────────────────────────────────────
const effectiveGranularity = computed(() => {
  if (props.resolvedGranularity) return props.resolvedGranularity
  if (!props.dateFrom || !props.dateTo) return props.granularity
  const days = differenceInDays(props.dateTo, props.dateFrom)
  const sameMonth = format(props.dateFrom, 'yyyy-MM') === format(props.dateTo, 'yyyy-MM')
  if (days <= 30 || sameMonth) return 'day'
  return props.granularity
})

// ── Label formatters ───────────────────────────────────────────
function formatLabel(isoDate: string, gran: string) {
  const d = new Date(isoDate)
  if (gran === 'day') return format(d, 'd MMM')
  if (gran === 'quarter') {
    const q = Math.floor(d.getMonth() / 3) + 1
    return `Q${q} ${d.getFullYear()}`
  }
  return format(d, 'MMM yyyy')
}

function getRangeText(isoDate: string, gran: string) {
  const d = new Date(isoDate)
  if (gran === 'day') return format(d, 'd MMM yyyy')
  const start = gran === 'quarter' ? startOfQuarter(d) : startOfMonth(d)
  const end = gran === 'quarter' ? endOfQuarter(d) : endOfMonth(d)
  const s = props.dateFrom && start < props.dateFrom ? props.dateFrom : start
  const e = props.dateTo && end > props.dateTo ? props.dateTo : end
  return `${format(s, 'd MMM yyyy')} - ${format(e, 'd MMM yyyy')}`
}

// ── Chart data ─────────────────────────────────────────────────
const occupancyChartData = computed(() => {
  const series = props.data.occupancySeries ?? []
  return series.map((item) => ({
    ...item,
    label: formatLabel(item.date, effectiveGranularity.value),
    rangeText: getRangeText(item.date, effectiveGranularity.value),
  }))
})

const roomTypeChartData = computed(() => {
  return (props.data.occupancyByRoomTypeSeries ?? []).map((row) => {
    if (!row.month) return row
    const rangeText = getRangeText(row.month, effectiveGranularity.value)
    return { ...row, rangeText }
  })
})

// ── Skeleton chart option ──────────────────────────────────────
const skeletonChartOption = computed(() => ({
  grid: { top: 8, right: 0, left: 55, bottom: 30 },
  xAxis: {
    type: 'category',
    data: SKELETON_DATA.map((d) => d.label),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#c8ccdb', fontSize: 12 },
    boundaryGap: false,
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    interval: 20,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#c8ccdb', fontSize: 12, formatter: (v: number) => `${v}%` },
    splitLine: { lineStyle: { color: '#f1f2f6' } },
  },
  series: [
    {
      type: 'line',
      data: SKELETON_DATA.map((d) => d.percent),
      smooth: true,
      symbol: 'none',
      lineStyle: { color: '#e4e6ed', width: 2 },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            { offset: 0, color: 'rgba(228,230,237,0.4)' },
            { offset: 1, color: 'rgba(228,230,237,0)' },
          ],
        },
      },
    },
  ],
}))

// ── Overall chart option ───────────────────────────────────────
const overallChartOption = computed(() => {
  const data = props.loading
    ? SKELETON_DATA.map((d) => ({ ...d, rangeText: d.label }))
    : occupancyChartData.value

  return {
    grid: { top: 8, right: 0, left: 55, bottom: 30 },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.label),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#646d89',
        fontSize: 12,
        interval: xTickInterval.value,
      },
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 20,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#646d89', fontSize: 12, formatter: (v: number) => `${v}%` },
      splitLine: { lineStyle: { color: '#e4e6ed' } },
    },
    tooltip: {
      trigger: 'axis',
      confine: true,
      formatter: (params: any) => {
        const d = data[params[0]?.dataIndex] as any
        if (!d) return ''

        const gran = effectiveGranularity.value
        const isDay = gran === 'day'
        const isAggregated = gran === 'month' || gran === 'quarter'
        const header = d.rangeText ?? d.label

        let html = `<div style="font-size:12px;min-width:160px">`
        html += `<p style="font-weight:600;margin-bottom:6px">${header}</p>`
        html += `<div style="display:flex;justify-content:space-between;gap:24px">
                   <span style="color:#646d89">Occupancy</span>
                   <b>${d.percent ?? 0}%</b>
                 </div>`

        if (d.occupiedRooms != null && d.totalRooms != null && d.totalRooms > 0) {
          const label = isDay ? 'Rooms' : 'Avg. rooms'
          html += `<div style="display:flex;justify-content:space-between;gap:24px">
                     <span style="color:#646d89">${label}</span>
                     <b>${d.occupiedRooms} / ${d.totalRooms}</b>
                   </div>`
        }

        if (isAggregated) {
          if (d.daysInPeriod > 0) {
            html += `<div style="display:flex;justify-content:space-between;gap:24px">
                       <span style="color:#646d89">Days</span>
                       <b>${d.daysInPeriod}</b>
                     </div>`
          }
          if (d.occupiedRoomNights != null) {
            html += `<div style="display:flex;justify-content:space-between;gap:24px">
                       <span style="color:#646d89">Room-nights</span>
                       <b>${Math.round(d.occupiedRoomNights).toLocaleString()}</b>
                     </div>`
          }
          if (d.capacityRoomNights != null) {
            html += `<div style="display:flex;justify-content:space-between;gap:24px">
                       <span style="color:#646d89">Capacity</span>
                       <b>${Math.round(d.capacityRoomNights).toLocaleString()}</b>
                     </div>`
          }
          if (gran === 'month' && d.rangeDays > 0 && d.rangeCapacityRoomNights > 0) {
            html += `<div style="border-top:1px solid #f1f2f6;margin-top:4px;padding-top:4px;
                          display:flex;justify-content:space-between;gap:24px">
                       <span style="color:#646d89">Range (${d.rangeDays}d)</span>
                       <b>${Math.round(d.rangeOccupiedRoomNights).toLocaleString()} / ${Math.round(d.rangeCapacityRoomNights).toLocaleString()}</b>
                     </div>`
          }
        }

        html += `</div>`
        return html
      },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.percent),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: props.loading ? '#e4e6ed' : '#e76b39', width: 2 },
        areaStyle: {
          color: {
            type: 'linear',
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              {
                offset: 0,
                color: props.loading ? 'rgba(228,230,237,0.3)' : 'rgba(231,107,57,0.3)',
              },
              { offset: 1, color: 'rgba(0,0,0,0)' },
            ],
          },
        },
      },
    ],
  }
})

// ── Room type chart option ─────────────────────────────────────
const roomTypeChartOption = computed(() => ({
  grid: { top: 40, right: 8, left: 55, bottom: 30 },
  xAxis: {
    type: 'category',
    data: roomTypeChartData.value.map((d) => d.monthLabel ?? ''),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#646d89', fontSize: 11 },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    interval: 20,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#646d89', fontSize: 12, formatter: (v: number) => `${v}%` },
    splitLine: { lineStyle: { color: '#e4e6ed' } },
  },
  legend: {
    top: 0,
    right: 0,
    data: props.data.roomTypes.map((rt, i) => ({
      name: rt.label,
      itemStyle: { color: ROOM_TYPE_COLORS[i % ROOM_TYPE_COLORS.length] },
    })),
    textStyle: { color: '#646d89', fontSize: 12 },
  },
  tooltip: {
    trigger: 'axis',
    confine: true,
    formatter: (params: any) => {
      const d = roomTypeChartData.value[params[0]?.dataIndex] as any
      const header = d?.rangeText ?? d?.monthLabel ?? ''
      const sorted = [...params].sort((a: any, b: any) => (b.value ?? 0) - (a.value ?? 0))
      const rows = sorted
        .slice(0, 8)
        .map(
          (p: any) => `
        <div style="display:flex;justify-content:space-between;gap:16px;align-items:center">
          <span style="color:#646d89;display:flex;align-items:center;gap:6px">
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${p.color}"></span>
            ${p.seriesName}
          </span>
          <b>${p.value ?? 0}%</b>
        </div>
      `,
        )
        .join('')
      const hidden = sorted.length - Math.min(sorted.length, 8)
      return `
        <div style="font-size:12px;min-width:160px">
          <p style="font-weight:600;margin-bottom:6px">${header}</p>
          ${rows}
          ${hidden > 0 ? `<p style="color:#9aa1b9;margin-top:4px">+${hidden} more</p>` : ''}
        </div>
      `
    },
  },
  series: props.data.roomTypes.map((rt, i) => ({
    name: rt.label,
    type: 'bar',
    data: roomTypeChartData.value.map((d) => d[rt.id] ?? 0),
    itemStyle: {
      color: ROOM_TYPE_COLORS[i % ROOM_TYPE_COLORS.length],
      borderRadius: [4, 4, 0, 0],
    },
    barWidth: 16,
  })),
}))

// ── Export ─────────────────────────────────────────────────────
function handleExport() {
  const range =
    props.dateFrom && props.dateTo
      ? `${format(props.dateFrom, 'yyyy-MM-dd')}_${format(props.dateTo, 'yyyy-MM-dd')}`
      : 'occupancy_guest'

  const overallSection =
    'Overall Occupancy\nLabel,Percent (%)\n' +
    occupancyChartData.value.map((d) => `${d.label},${d.percent}`).join('\n')

  const guestSection =
    'Guest Visit\nSegment,Count,Percent\n' +
    props.data.guestVisit.segments.map((s) => `${s.label},${s.count},${s.percent}`).join('\n')

  const paymentSection =
    'Payment Methods\nMethod,Count,Percent\n' +
    props.data.paymentMethods.map((m) => `${m.label},${m.count},${m.percent}`).join('\n')

  const csv = [overallSection, guestSection, paymentSection].join('\n\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `occupancy_guest_${range}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// ── Disabled date helpers ──────────────────────────────────────
const today = new Date()
function disabledFrom(date: Date) {
  return date > today
}
function disabledTo(date: Date) {
  if (!props.dateFrom) return date > today
  return date < props.dateFrom || date > today
}
</script>

<template>
  <section class="flex flex-col gap-[24px]" aria-label="Occupancy and guest analytics">
    <!-- Header -->
    <header>
      <div class="flex flex-row items-center justify-between pb-[16px]">
        <div class="flex items-center gap-[8px]">
          <h2 class="headline-5 text-gray-600">Occupancy &amp; Guest</h2>
          <button
            type="button"
            class="hidden lg:block text-xs px-[8px] py-[4px] rounded-full border transition-colors hover:cursor-pointer"
            :class="
              useLive
                ? 'bg-green-50 border-green-400 text-green-700'
                : 'bg-gray-100 border-gray-300 text-gray-500'
            "
            @click="emit('toggle-live')"
          >
            {{ useLive ? '● Live DB' : '○ Mock' }}
          </button>
        </div>
        <Button
          variant="primary"
          size="ghost"
          class="w-[115px] h-[40px] lg:w-[167px]"
          @click="handleExport"
        >
          Export
        </Button>
      </div>

      <!-- Filters -->
      <div
        class="grid grid-cols-2 gap-x-[16px] gap-y-[8px] pb-[24px] lg:flex lg:flex-row lg:items-center lg:pt-3 lg:pb-12 lg:flex-nowrap"
      >
        <!-- Date range -->
        <div
          class="col-span-2 grid grid-cols-2 gap-x-[16px] lg:flex lg:flex-row lg:items-center lg:gap-2"
        >
          <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
            <label class="body-2 text-gray-600 lg:w-[30px] lg:text-right lg:whitespace-nowrap"
              >From</label
            >
            <SingleDatePicker
              :model-value="dateFrom"
              placeholder="Select start date"
              :disabled-date="disabledFrom"
              @update:model-value="emit('date-from-change', $event)"
            />
          </div>
          <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
            <label class="body-2 text-gray-600 lg:w-[30px] lg:text-right lg:whitespace-nowrap"
              >To</label
            >
            <SingleDatePicker
              :model-value="dateTo"
              placeholder="Select end date"
              :disabled-date="disabledTo"
              @update:model-value="emit('date-to-change', $event)"
            />
          </div>
        </div>

        <!-- View by + Granularity -->
        <div
          class="col-span-2 grid grid-cols-2 gap-x-[16px] lg:flex lg:flex-row lg:items-center lg:gap-2"
        >
          <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
            <label class="body-2 text-gray-600 lg:w-[64px] lg:text-right lg:whitespace-nowrap"
              >View by</label
            >
            <select
              :value="viewBy"
              class="w-full h-[40px] border border-gray-300 rounded-[8px] px-3 text-[14px] text-gray-900 hover:border-orange-500 focus:outline-none"
              @change="emit('view-by-change', ($event.target as HTMLSelectElement).value)"
            >
              <option value="overall">Overall</option>
              <option value="room_types" :disabled="isMobile">Room types</option>
            </select>
          </div>
          <div class="flex flex-col gap-1 lg:flex-row lg:items-center lg:gap-2">
            <label class="body-2 text-gray-600 lg:w-[84px] lg:text-right lg:whitespace-nowrap"
              >Granularity</label
            >
            <select
              :value="granularity"
              :disabled="viewBy === 'room_types'"
              class="w-full h-[40px] border border-gray-300 rounded-[8px] px-3 text-[14px] text-gray-900 hover:border-orange-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
              @change="emit('granularity-change', ($event.target as HTMLSelectElement).value)"
            >
              <option v-for="o in GRANULARITY_OPTIONS" :key="o.id" :value="o.id">
                {{ o.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </header>

    <!-- แก้ส่วน Occupancy Rate Chart ใน template -->
    <section class="flex flex-col gap-2" aria-label="Occupancy rate">
      <h3 class="font-semibold text-[16px] text-gray-700">Occupancy Rate</h3>
      <p v-if="autoGroupMeta?.didAutoGroup" class="text-xs text-gray-400">
        Auto-grouped to {{ autoGroupMeta.resolvedGranularity }}
        <span v-if="autoGroupMeta.reason"> — {{ autoGroupMeta.reason }}</span>
      </p>
      <div class="w-full min-h-[240px]">
        <!-- Skeleton -->
        <template v-if="loading">
          <VChart style="width: 100%; height: 295px" :option="skeletonChartOption" autoresize />
        </template>

        <template v-else-if="viewBy === 'overall' || isMobile">
          <div
            v-if="occupancyChartData.length === 0"
            class="flex items-center justify-center h-[295px] body-2 text-gray-400"
          >
            No data for selected range
          </div>
          <VChart
            v-else
            style="width: 100%; height: 295px"
            :option="overallChartOption"
            autoresize
          />
        </template>

        <template v-else>
          <VChart style="width: 100%; height: 295px" :option="roomTypeChartOption" autoresize />
        </template>
      </div>
    </section>

    <!-- Guest Visit + Payment Method -->
    <div class="lg:grid lg:grid-cols-2 lg:gap-[48px]">
      <!-- Guest Visit -->
      <section class="flex flex-col gap-[16px] lg:gap-[24px]" aria-label="Guest visit summary">
        <h3 class="font-semibold text-[16px] text-gray-700">Guest Visit</h3>
        <div class="flex flex-col gap-[16px]">
          <!-- Skeleton -->
          <template v-if="loading">
            <div
              v-for="label in ['New guests', 'Returning guests']"
              :key="label"
              class="flex flex-col gap-1"
            >
              <div class="flex items-center justify-between body-2">
                <span class="text-black">
                  {{ label }}
                  <span
                    class="inline-block h-4 w-6 rounded bg-gray-200 animate-pulse align-middle"
                  />
                  people
                </span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="flex-1 h-[10px] rounded-full bg-gray-300 overflow-hidden">
                  <div class="h-full rounded-full bg-gray-200 animate-pulse" style="width: 70%" />
                </div>
                <span class="inline-block h-4 w-8 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </template>

          <!-- Real data -->
          <template v-else>
            <div
              v-for="segment in data.guestVisit.segments"
              :key="segment.id"
              class="flex flex-col gap-1"
            >
              <div class="flex items-center justify-between body-2">
                <span class="text-black">
                  {{ segment.label }}
                  <span class="text-gray-700"> {{ segment.count }} people</span>
                </span>
              </div>
              <div class="flex flex-row items-center gap-2">
                <div class="flex-1 h-[10px] rounded-full bg-gray-300 overflow-hidden">
                  <div
                    class="h-full rounded-full bg-orange-500"
                    :style="{ width: `${segment.percent}%` }"
                  />
                </div>
                <span class="body-2 font-medium text-gray-900 min-w-[40px] text-right">
                  {{ segment.percent }}%
                </span>
              </div>
            </div>
          </template>
        </div>
      </section>

      <!-- Payment Method -->
      <section class="flex flex-col gap-[16px] lg:gap-[24px]" aria-label="Payment method summary">
        <h3 class="font-semibold text-[16px] text-gray-700">Payment Method</h3>
        <div class="flex flex-col gap-[16px]">
          <!-- Skeleton -->
          <template v-if="loading">
            <div
              v-for="item in [
                { label: 'Credit card', cash: false },
                { label: 'Cash', cash: true },
              ]"
              :key="item.label"
              class="flex flex-row gap-2"
            >
              <div
                class="flex bg-gray-300 w-[40px] h-[40px] rounded-full justify-center items-center shrink-0"
              >
                <CashIcon v-if="item.cash" class="text-gray-700" />
                <CreditIcon v-else class="text-gray-700" />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <div class="flex items-center justify-between body-2">
                  <span class="text-black">
                    {{ item.label }}
                    <span
                      class="inline-block h-3 w-4 rounded bg-gray-200 animate-pulse align-middle"
                    />
                    people
                  </span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="flex-1 h-[10px] rounded-full bg-gray-300 overflow-hidden">
                    <div class="h-full rounded-full bg-gray-200 animate-pulse" style="width: 65%" />
                  </div>
                  <span class="inline-block h-4 w-8 rounded bg-gray-200 animate-pulse" />
                </div>
              </div>
            </div>
          </template>

          <!-- Real data -->
          <template v-else>
            <div v-for="method in data.paymentMethods" :key="method.id" class="flex flex-row gap-2">
              <div
                class="flex bg-gray-300 w-[40px] h-[40px] rounded-full justify-center items-center shrink-0"
              >
                <CashIcon
                  v-if="
                    method.id?.toLowerCase().includes('cash') ||
                    method.label?.toLowerCase().includes('cash')
                  "
                  class="text-gray-700"
                />
                <CreditIcon v-else class="text-gray-700" />
              </div>
              <div class="flex flex-col gap-1 flex-1">
                <div class="flex items-center justify-between body-2">
                  <span class="text-black">
                    {{ method.label }}
                    <span class="text-gray-700"> {{ method.count }} people</span>
                  </span>
                </div>
                <div class="flex flex-row items-center gap-2">
                  <div class="flex-1 h-[10px] rounded-full bg-gray-300 overflow-hidden">
                    <div
                      class="h-full rounded-full bg-orange-500"
                      :style="{ width: `${method.percent}%` }"
                    />
                  </div>
                  <span class="body-2 font-medium text-gray-900 min-w-[40px] text-right">
                    {{ method.percent }}%
                  </span>
                </div>
              </div>
            </div>
          </template>
        </div>
      </section>
    </div>
  </section>
</template>
