<script setup>
import { computed } from 'vue'
import VChart from 'vue-echarts'
import { use } from 'echarts/core'
import { PieChart } from 'echarts/charts'
import { CanvasRenderer } from 'echarts/renderers'

use([PieChart, CanvasRenderer])

const PERIODS = [
  { id: 'month', label: 'This month' },
  { id: 'week', label: 'This week' },
  { id: 'day', label: 'Today' },
]

const props = defineProps({
  periodId: String,
  data: Array,
  loading: Boolean,
})

const emit = defineEmits(['period-change'])

const chartOption = computed(() => ({
  series: [{
    type: 'pie',
    radius: ['65%', '100%'],
    padAngle: 0,
    data: props.data.map(item => ({
      name: item.label,
      value: item.count,
      itemStyle: { color: item.strokeColor },
    })),
    label: { show: false },
  }],
}))
</script>

<template>
  <article class="flex flex-col gap-[24px] lg:h-full">
    <header class="flex justify-between items-center">
      <h5 class="headline-5 text-gray-600">Room Availability</h5>
      <select
        :value="periodId"
        class="w-[136px] h-[40px] border border-gray-300 rounded-[8px] px-3 body-2 text-gray-900 hover:border-orange-500"
        @change="emit('period-change', $event.target.value)"
      >
        <option v-for="p in PERIODS" :key="p.id" :value="p.id">{{ p.label }}</option>
      </select>
    </header>

    <div class="flex flex-row items-center gap-[20px] lg:justify-center lg:h-full">
      <!-- Skeleton -->
      <template v-if="loading">
        <div class="w-[120px] h-[120px] lg:w-[260px] lg:h-[260px] lg:flex-none bg-gray-100 rounded-full" />
        <ul class="flex flex-col gap-3 w-[160px] shrink-0 lg:self-end">
          <li v-for="item in data" :key="item.id" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-sm" :class="item.color" />
            <span class="body-2 text-gray-700">
              {{ item.label }}: <span class="w-8 h-3 bg-gray-200 inline-block rounded align-middle" />
            </span>
          </li>
        </ul>
      </template>

      <!-- Chart -->
      <template v-else>
        <VChart
          class="w-[120px] h-[120px] lg:w-[260px] lg:h-[260px] lg:flex-none"
          :option="chartOption"
          autoresize
        />
        <ul class="flex flex-col gap-3 w-[160px] shrink-0 lg:self-end">
          <li v-for="item in data" :key="item.id" class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-sm" :class="item.color" />
            <span class="body-2 text-gray-700">
              {{ item.label }}: <span class="font-medium">{{ item.count }} Rooms</span>
            </span>
          </li>
        </ul>
      </template>
    </div>
  </article>
</template>