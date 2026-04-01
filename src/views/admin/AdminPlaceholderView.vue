<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue"
import AdminHotelInformationView from "./AdminHotelInformationView.vue"
import AdminRoomPropertyView from "./AdminRoomPropertyView.vue"
import AdminRoomManagementView from "./AdminRoomManagementView.vue"

const route = useRoute()
const title = computed(() => (route.meta.pageTitle as string) ?? "Admin")
</script>

<template>
  <AdminHotelInformationView v-if="title === 'Hotel Information'" />
  <AdminRoomPropertyView v-else-if="title === 'Room & Property'" />
  <AdminRoomManagementView v-else-if="title === 'Room Management'" />

  <section v-else class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <AdminPageHeader :title="title" />
    <div class="px-4 py-10 sm:px-8 lg:px-[60px]">
      <p class="body-1 text-gray-600">This section is coming soon.</p>
    </div>
  </section>
</template>
