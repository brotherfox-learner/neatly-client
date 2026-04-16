<script setup>
defineProps({
  label: String,
  value: Number,
  percentChange: Number,
  trend: String,
  type: String,
  currency: String,
  icon: Object, // SVG component
})
</script>

<template>
  <div class="rounded-[8px] border border-gray-300 p-[16px] bg-white flex flex-col gap-[8px] relative">
    <span class="body-1 text-gray-900">{{ label }}</span>
    <h4 class="headline-4 text-gray-900">{{ formattedValue }}</h4>

    <div v-if="trend === 'up'" class="flex items-center gap-[8px]">
      <IncreaseIcon />
      <span class="body-3 text-green-600">Up {{ percentChange }}% from last month</span>
    </div>
    <div v-else-if="trend === 'down'" class="flex items-center gap-[8px]">
      <DecreaseIcon />
      <span class="body-3 text-[#F93C65]">Down {{ Math.abs(percentChange) }}% from last month</span>
    </div>
    <span v-else-if="trend === 'neutral'" class="body-3 text-gray-500">
      No change from last month
    </span>

    <div class="bg-gray-300 h-[48px] w-[48px] rounded-full absolute right-0 top-0 m-[16px] flex justify-center items-center">
      <component :is="icon" v-if="icon" class="w-[28px] text-gray-700 stroke-[0.1]" />
    </div>
  </div>
</template>

<script>
import IncreaseIcon from '@/assets/icons/increase-trend-line.svg?component'
import DecreaseIcon from '@/assets/icons/decrease-trend-line.svg?component'

export default { components: { IncreaseIcon, DecreaseIcon } }
</script>