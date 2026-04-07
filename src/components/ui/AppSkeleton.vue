<script setup lang="ts">
withDefaults(
  defineProps<{
    class?: string
  }>(),
  {
    class: "",
  },
)
</script>

<template>
  <div
    aria-hidden="true"
    :class="['app-skeleton-block', $props.class]"
  />
</template>
