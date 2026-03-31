<script setup lang="ts">
import { RouterView } from "vue-router"
import AdminSidebar from "@/components/admin/AdminSidebar.vue"
</script>

<template>
  <div class="flex min-h-screen w-full min-w-0 bg-[#F6F7FC]">
    <AdminSidebar />
    <div class="flex min-h-screen min-w-0 flex-1 flex-col">
      <RouterView />
    </div>
  </div>
</template>
