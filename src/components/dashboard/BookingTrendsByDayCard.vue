<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { BarChart } from 'echarts/charts'
import { GridComponent, TooltipComponent, MarkLineComponent } from 'echarts/components'
import { CanvasRenderer } from 'echarts/renderers'

use([BarChart, GridComponent, TooltipComponent, MarkLineComponent, CanvasRenderer])

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'last_month', label: 'Last month' },
  { id: 'last_2_month', label: 'Last 2 months' },
]

const SKELETON_DATA = [
  { day: 'Sun', percent: 45 },
  { day: 'Mon', percent: 40 },
  { day: 'Tue', percent: 55 },
  { day: 'Wed', percent: 35 },
  { day: 'Thu', percent: 60 },
  { day: 'Fri', percent: 80 },
  { day: 'Sat', percent: 90 },
]

const props = defineProps({
  periodId: String,
  data: Array,
  loading: Boolean,
  useLive: Boolean,
  onToggleLive: Function,
})

const emit = defineEmits(['period-change', 'toggle-live'])

const hasData = computed(
  () => Array.isArray(props.data) && props.data.some((r) => Number(r?.percent) > 0),
)

const activeData = computed(() => (props.loading ? SKELETON_DATA : props.data))

const chartOption = computed(() => ({
  grid: { top: 8, right: 8, left: 55, bottom: 30 },
  xAxis: {
    type: 'category',
    data: activeData.value.map((d) => d.day),
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: 'var(--color-gray-700)', fontSize: 12 },
  },
  yAxis: {
    type: 'value',
    min: 0,
    max: 100,
    interval: 20,
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: {
      color: 'var(--color-gray-700)',
      fontSize: 12,
      formatter: (v) => `${v}%`,
    },
    splitLine: { lineStyle: { color: 'var(--color-gray-300)' } },
  },
  tooltip: {
    trigger: 'axis',
    formatter: (params) => {
      const d = params[0]?.data
      if (!d) return ''
      return `
        <div style="font-size:12px">
          <div style="font-weight:600">${params[0].axisValue}</div>
          <div>Avg occupancy: <b>${d.percent}%</b></div>
          ${d.rooms != null ? `<div>Rooms: <b>${d.rooms} / ${d.totalRooms}</b></div>` : ''}
          <div style="color:#9ca3af">Based on ${d.sampleCount} occurrence(s)</div>
        </div>
      `
    },
  },
  series: [
    {
      type: 'bar',
      data: activeData.value.map((d) => ({ value: d.percent, ...d })),
      itemStyle: {
        color: props.loading ? '#e4e6ed' : '#e76b39',
        borderRadius: [4, 4, 4, 4],
      },
      barWidth: 10,
    },
  ],
  markLine: {
    data: [{ yAxis: 80 }],
    lineStyle: { color: 'var(--color-gray-300)' },
  },
}))
</script>

<template>
  <article class="flex flex-col gap-[24px]">
    <header class="flex justify-between items-start lg:pb-[32px]">
      <div class="flex items-center gap-[8px]">
        <h2 class="headline-5 text-gray-600">Booking Trends by Day</h2>
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

      <select
        :value="periodId"
        class="w-[136px] h-[40px] border border-gray-300 rounded-[8px] px-3 body-2 text-gray-900 hover:border-orange-500"
        @change="emit('period-change', $event.target.value)"
      >
        <option v-for="p in PERIODS" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
    </header>

    <div class="w-full min-h-[200px]">
      <div
        v-if="!loading && !hasData"
        class="flex items-center justify-center h-[235px] body-2 text-gray-400"
      >
        No data for selected range
      </div>
      <VChart v-else style="width: 100%; height: 235px" :option="chartOption" autoresize />
    </div>
  </article>
</template>
