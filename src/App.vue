<script setup lang="ts">
import { RouterView, useRoute } from "vue-router"
import AppNavbar from "@/components/AppNavbar.vue"
import ChatWidget from "@/components/chat/ChatWidget.vue"

const route = useRoute()
</script>

<template>
  <AppNavbar v-if="!route.meta.hideNavbar" />
  <main>
    <RouterView />
  </main>
  <ChatWidget />
</template>
