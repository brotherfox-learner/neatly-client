<script setup lang="ts">
import axios from "axios"
import { onMounted, ref } from "vue"
import { X } from "lucide-vue-next"
import { api } from "@/lib/api"

const hotelName = ref("")
const hotelDescription = ref("")
const hotelLogoPreviewUrl = ref("/logo.svg")
const isLoading = ref(false)
const isSubmitting = ref(false)
const formError = ref("")
const formSuccess = ref("")

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  if (!error.response) return "Cannot reach the server. Please check backend and network."
  const status = error.response.status
  const data = error.response.data
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === "string" && msg.trim()) return msg
  }
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You do not have permission to update hotel information."
  if (status >= 500) return "Server error while updating hotel information."
  return fallback
}

async function loadHotelInfo() {
  isLoading.value = true
  formError.value = ""
  try {
    const { data } = await api.get<unknown>("/api/v1/admin/hotel-info")
    if (typeof data !== "object" || data === null) {
      formError.value = "Unexpected data format from hotel information API."
      return
    }
    const raw = data as Record<string, unknown>
    hotelName.value = typeof raw.hotelName === "string" ? raw.hotelName : ""
    hotelDescription.value = typeof raw.aboutDescription === "string" ? raw.aboutDescription : ""
    hotelLogoPreviewUrl.value = typeof raw.logoUrl === "string" && raw.logoUrl.trim() ? raw.logoUrl : "/logo.svg"
  } catch (error) {
    formError.value = extractApiErrorMessage(error, "Unable to load hotel information.")
  } finally {
    isLoading.value = false
  }
}

async function onUpdate() {
  formError.value = ""
  formSuccess.value = ""
  if (!hotelName.value.trim()) {
    formError.value = "Hotel name is required."
    return
  }
  if (!hotelDescription.value.trim()) {
    formError.value = "Hotel description is required."
    return
  }

  isSubmitting.value = true
  try {
    await api.put("/api/v1/admin/hotel-info", {
      hotelName: hotelName.value.trim(),
      aboutDescription: hotelDescription.value.trim(),
      logoUrl: hotelLogoPreviewUrl.value.trim() || "/logo.svg",
    })
    formSuccess.value = "Hotel information updated."
  } catch (error) {
    formError.value = extractApiErrorMessage(error, "Unable to update hotel information.")
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => {
  void loadHotelInfo()
})
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <header
      class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="min-w-0 flex-1 text-[#2A2E3F] font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em]">
        Hotel Information
      </h1>

      <button
        type="submit"
        form="hotel-information-form"
        class="h-12 w-[121px] rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210] disabled:cursor-not-allowed disabled:bg-[#C8CCDB]"
        aria-label="Update hotel information"
        :disabled="isSubmitting || isLoading"
      >
        {{ isSubmitting ? "Updating..." : "Update" }}
      </button>
    </header>

    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <article class="w-full rounded-[4px] border border-[#E4E6ED] bg-white p-8">
        <form id="hotel-information-form" class="flex w-full flex-col gap-8" @submit.prevent="onUpdate">
          <p v-if="formError" class="body-2 text-[#B61515]">{{ formError }}</p>
          <p v-else-if="formSuccess" class="body-2 text-[#465C50]">{{ formSuccess }}</p>
          <p v-else-if="isLoading" class="body-2 text-[#646D89]">Loading hotel information...</p>

          <section class="flex w-full flex-col gap-2.5">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-name">
              Hotel name *
            </label>
            <input
              id="hotel-name"
              v-model="hotelName"
              type="text"
              class="h-12 w-full rounded-[4px] border border-[#D6D9E4] bg-white px-4 text-sm outline-none focus:border-[#9AA1B9]"
            />
          </section>

          <section class="flex w-full flex-col gap-2.5">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-description">
              Hotel description *
            </label>
            <textarea
              id="hotel-description"
              v-model="hotelDescription"
              class="min-h-[160px] w-full resize-none rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3 text-sm outline-none focus:border-[#9AA1B9]"
            />
          </section>

          <section class="flex w-full flex-col gap-3">
            <label class="text-sm font-medium text-[#424C6B]" for="hotel-logo">
              Hotel logo *
            </label>

            <div class="flex items-center">
              <div class="relative inline-flex">
                <img
                  :src="hotelLogoPreviewUrl"
                  alt="Hotel logo preview"
                  class="h-[120px] w-[120px] rounded-[4px] border border-[#E4E6ED] bg-white object-contain p-3"
                />
                <button
                  type="button"
                  class="absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-[#B61515] text-white"
                  aria-label="Reset hotel logo"
                  @click="hotelLogoPreviewUrl = '/logo.svg'"
                >
                  <X class="size-[14px]" aria-hidden="true" />
                </button>
              </div>
              <input id="hotel-logo" type="file" class="sr-only" aria-label="Upload hotel logo" />
            </div>
          </section>
        </form>
      </article>
    </main>
  </section>
</template>

