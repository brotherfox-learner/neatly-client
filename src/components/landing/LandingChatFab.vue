<script setup lang="ts">
function onClick() {
  /* Wire to chat / support when available */
}
</script>

<template>
  <button
    type="button"
    class="border-border fixed bottom-6 right-6 z-40 flex size-16 items-center justify-center rounded-full border border-orange-200 bg-white text-white shadow-lg transition-colors hover:bg-orange-600 focus-visible:ring-2 focus-visible:ring-orange-300 focus-visible:outline-none"
    aria-label="Open chat"
    @click="onClick"
  >
    <img src="/LandingPagePic/icon.svg" alt="" class="size-12" width="48" height="48" />
  </button>
</template>
