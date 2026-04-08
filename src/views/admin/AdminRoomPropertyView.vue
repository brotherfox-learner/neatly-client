<script setup lang="ts">
import axios from "axios"
import { computed, onMounted, ref } from "vue"
import { ArrowLeft, Plus, Search, X } from "lucide-vue-next"

import { api } from "@/lib/api"
import { adminRoomDetailSchema, roomImageUploadResponseSchema } from "@/schemas/adminRoom"

type RoomRow = {
  roomId: string
  roomType: string
  roomSize: string
  bedType: string
  guests: string
  price: string
  promotionPrice: string
  imageUrl: string
}

const searchQuery = ref("")
const isLoadingRows = ref(false)
const rowsError = ref("")
const rows = ref<RoomRow[]>([])

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    [r.roomType, r.bedType, r.roomSize].some((x) => x.toLowerCase().includes(q)),
  )
})

// Modal state (mock).
const isEditOpen = ref(false)
const isCreating = ref(false)
const selectedRoom = ref<RoomRow | null>(null)
const isSubmittingCreate = ref(false)
const isSubmittingUpdate = ref(false)
const isSubmittingDelete = ref(false)
const isLoadingEditDetail = ref(false)
const isDeleteModalOpen = ref(false)
const createError = ref("")
const imageUploadError = ref("")
const isUploadingRoomImage = ref(false)
const mainImageInputRef = ref<HTMLInputElement | null>(null)
const galleryImageInputRef = ref<HTMLInputElement | null>(null)
/** `null` = append new gallery image; number = replace at index */
const galleryUploadTargetIndex = ref<number | null>(null)
const draggedGalleryIndex = ref<number | null>(null)

const editForm = ref({
  roomType: "",
  roomSize: "",
  bedType: "single bed",
  guests: "2",
  price: "",
  promotionEnabled: false,
  promotionPrice: "",
  roomDescription: "Rooms (36sqm) with full garden views, 1 single bed, bathroom with bathtub & shower.",
  roomMainImageUrl: "",
  roomGalleryUrls: [] as string[],
  amenities: ["Safe in Room", "Air Conditioning", "High speed internet connection", "Hairdryer", "Shower"],
})

function openEdit(row: RoomRow) {
  isCreating.value = false
  selectedRoom.value = row
  editForm.value = {
    ...editForm.value,
    roomType: row.roomType,
    roomSize: row.roomSize.replace(" sqm", ""),
    bedType: row.bedType.toLowerCase(),
    guests: row.guests,
    price: row.price,
    promotionEnabled: row.promotionPrice !== "-",
    promotionPrice: row.promotionPrice,
    roomMainImageUrl: row.imageUrl,
    roomGalleryUrls: [row.imageUrl, row.imageUrl, row.imageUrl, row.imageUrl],
  }
  createError.value = ""
  imageUploadError.value = ""
  isEditOpen.value = true
  void loadRoomDetail(row.roomId)
}

function openCreate() {
  isCreating.value = true
  selectedRoom.value = null
  editForm.value = {
    ...editForm.value,
    roomType: "",
    roomSize: "",
    bedType: "single bed",
    guests: "2",
    price: "",
    promotionEnabled: false,
    promotionPrice: "",
    roomDescription: "",
    roomMainImageUrl: "",
    roomGalleryUrls: [],
    amenities: [""],
  }
  createError.value = ""
  imageUploadError.value = ""
  isEditOpen.value = true
}

function closeModal() {
  isEditOpen.value = false
  selectedRoom.value = null
  isLoadingEditDetail.value = false
  isDeleteModalOpen.value = false
}

function openDeleteModal() {
  if (!selectedRoom.value) return
  isDeleteModalOpen.value = true
}

function closeDeleteModal() {
  isDeleteModalOpen.value = false
}

function removeAmenity(idx: number) {
  editForm.value.amenities.splice(idx, 1)
}

function addAmenity() {
  editForm.value.amenities.push("")
}

function openMainImagePicker() {
  imageUploadError.value = ""
  mainImageInputRef.value?.click()
}

function openGalleryPickerForNew() {
  imageUploadError.value = ""
  galleryUploadTargetIndex.value = null
  galleryImageInputRef.value?.click()
}

function openGalleryPickerForReplace(idx: number) {
  imageUploadError.value = ""
  galleryUploadTargetIndex.value = idx
  galleryImageInputRef.value?.click()
}

async function onMainImageFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ""
  if (!file) return
  await uploadRoomImageToForm(file, "main")
}

async function onGalleryImageFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ""
  if (!file) return
  const replaceIdx = galleryUploadTargetIndex.value
  galleryUploadTargetIndex.value = null
  await uploadRoomImageToForm(file, "gallery", replaceIdx)
}

async function uploadRoomImageToForm(
  file: File,
  target: "main" | "gallery",
  replaceGalleryIndex: number | null | undefined = undefined,
) {
  imageUploadError.value = ""
  isUploadingRoomImage.value = true
  const formData = new FormData()
  formData.append("file", file)
  try {
    const { data } = await api.post<unknown>("/api/v1/admin/rooms/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    const { imageUrl } = roomImageUploadResponseSchema.parse(data)
    if (target === "main") {
      editForm.value.roomMainImageUrl = imageUrl
    } else if (replaceGalleryIndex !== null && replaceGalleryIndex !== undefined) {
      const next = [...editForm.value.roomGalleryUrls]
      if (replaceGalleryIndex >= 0 && replaceGalleryIndex < next.length) {
        next[replaceGalleryIndex] = imageUrl
        editForm.value.roomGalleryUrls = next
      }
    } else {
      editForm.value.roomGalleryUrls = [...editForm.value.roomGalleryUrls, imageUrl]
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      const msg = error.response?.data?.message
      if (status === 403) {
        imageUploadError.value = "You do not have permission to upload images."
      } else if (status === 401) {
        imageUploadError.value = "Your session has expired. Please sign in again."
      } else if (typeof msg === "string" && msg) {
        imageUploadError.value = msg
      } else {
        imageUploadError.value = "Image upload failed."
      }
    } else {
      imageUploadError.value = "Image upload failed."
    }
  } finally {
    isUploadingRoomImage.value = false
  }
}

function removeGalleryImage(idx: number) {
  editForm.value.roomGalleryUrls.splice(idx, 1)
}

function onGalleryDragStart(idx: number) {
  draggedGalleryIndex.value = idx
}

function onGalleryDrop(dropIndex: number) {
  const from = draggedGalleryIndex.value
  draggedGalleryIndex.value = null
  if (from === null || from === dropIndex) return
  const next = [...editForm.value.roomGalleryUrls]
  const [moved] = next.splice(from, 1)
  if (!moved) return
  next.splice(dropIndex, 0, moved)
  editForm.value.roomGalleryUrls = next
}

function parseNumericInput(value: string): number {
  const normalized = String(value ?? "")
    .replace(/,/g, "")
    .trim()
  return Number(normalized)
}

function toEditFormPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return ""
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function buildRoomPayloadFromForm() {
  const roomSize = parseNumericInput(editForm.value.roomSize)
  const basePrice = parseNumericInput(editForm.value.price)
  const discountedPrice = editForm.value.promotionEnabled
    ? parseNumericInput(editForm.value.promotionPrice)
    : null
  const amenities = editForm.value.amenities.map((a) => a.trim()).filter(Boolean)

  if (!editForm.value.roomType.trim()) {
    createError.value = "Please enter room type."
    return null
  }
  if (!Number.isFinite(roomSize) || roomSize <= 0) {
    createError.value = "Please enter valid room size (sqm)."
    return null
  }
  if (!Number.isFinite(basePrice) || basePrice <= 0) {
    createError.value = "Please enter valid price per night."
    return null
  }
  if (editForm.value.promotionEnabled) {
    if (!Number.isFinite(discountedPrice ?? NaN) || (discountedPrice ?? 0) < 0) {
      createError.value = "Please enter valid promotion price."
      return null
    }
    if ((discountedPrice ?? 0) > basePrice) {
      createError.value = "Promotion price must be less than or equal to base price."
      return null
    }
  }
  if (!editForm.value.roomMainImageUrl.trim()) {
    createError.value = "Please upload main image."
    return null
  }
  if (editForm.value.roomGalleryUrls.length < 4) {
    createError.value = "Image gallery must contain at least 4 images."
    return null
  }
  if (amenities.length === 0) {
    createError.value = "Please add at least 1 amenity."
    return null
  }

  return {
    roomTypeName: editForm.value.roomType.trim(),
    description: editForm.value.roomDescription.trim() || null,
    maxOccupancy: Number(editForm.value.guests),
    basePrice,
    discountedPrice: editForm.value.promotionEnabled ? discountedPrice : null,
    bedType: editForm.value.bedType,
    roomSizeSqm: roomSize,
    amenities,
    mainImageUrl: editForm.value.roomMainImageUrl.trim(),
    galleryImageUrls: [...editForm.value.roomGalleryUrls],
  }
}

async function onCreateRoom() {
  createError.value = ""
  const payload = buildRoomPayloadFromForm()
  if (!payload) return

  isSubmittingCreate.value = true
  try {
    await api.post("/api/v1/admin/rooms", payload)
    await loadRooms()
    closeModal()
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status
      if (status === 403) {
        createError.value = "You do not have permission to create rooms. Please sign in with an admin account."
      } else if (status === 401) {
        createError.value = "Your session has expired. Please sign in again."
      } else {
        createError.value = error.response?.data?.message || "Create room failed."
      }
    } else {
      createError.value = "Create room failed."
    }
  } finally {
    isSubmittingCreate.value = false
  }
}

async function loadRoomDetail(roomId: string) {
  isLoadingEditDetail.value = true
  createError.value = ""
  try {
    const { data } = await api.get<unknown>(`/api/v1/admin/rooms/${roomId}`)
    const detail = adminRoomDetailSchema.parse(data)
    editForm.value = {
      ...editForm.value,
      roomType: detail.roomTypeName,
      roomSize: String(detail.roomSizeSqm),
      bedType: detail.bedType,
      guests: String(detail.maxOccupancy),
      price: toEditFormPrice(detail.basePrice),
      promotionEnabled: detail.discountedPrice !== null && detail.discountedPrice !== undefined,
      promotionPrice: detail.discountedPrice !== null && detail.discountedPrice !== undefined
        ? toEditFormPrice(detail.discountedPrice)
        : "",
      roomDescription: detail.description ?? "",
      roomMainImageUrl: detail.mainImageUrl ?? "",
      roomGalleryUrls: detail.galleryImageUrls ?? [],
      amenities: detail.amenities.length > 0 ? detail.amenities : [""],
    }
  } catch (error) {
    createError.value = extractApiErrorMessage(error, "Unable to load room details.")
  } finally {
    isLoadingEditDetail.value = false
  }
}

async function onUpdateRoom() {
  if (!selectedRoom.value) return
  createError.value = ""
  const payload = buildRoomPayloadFromForm()
  if (!payload) return

  isSubmittingUpdate.value = true
  try {
    await api.put(`/api/v1/admin/rooms/${selectedRoom.value.roomId}`, payload)
    await loadRooms()
    closeModal()
  } catch (error) {
    createError.value = extractApiErrorMessage(error, "Update room failed.")
  } finally {
    isSubmittingUpdate.value = false
  }
}

async function onDeleteRoom() {
  if (!selectedRoom.value) return

  createError.value = ""
  isSubmittingDelete.value = true
  try {
    await api.delete(`/api/v1/admin/rooms/${selectedRoom.value.roomId}`)
    await loadRooms()
    isDeleteModalOpen.value = false
    closeModal()
  } catch (error) {
    createError.value = extractApiErrorMessage(error, "Delete room failed.")
  } finally {
    isSubmittingDelete.value = false
  }
}

function formatMoney(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatRoomSize(value: number | null | undefined): string {
  if (value === null || value === undefined) return "-"
  return `${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })} sqm`
}

function extractApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  if (!error.response) {
    return "Cannot reach the server. Check that the API is running and your network connection."
  }
  const status = error.response.status
  const data = error.response.data
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === "string" && msg.trim()) return msg
  }
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You do not have permission to view rooms. Please sign in with an admin account."
  if (status === 404) return "Room list API was not found. Is the backend running the latest version?"
  if (status && status >= 500) return "Server error while loading rooms. Please try again later."
  return fallback
}

async function loadRooms() {
  isLoadingRows.value = true
  rowsError.value = ""
  try {
    const { data } = await api.get<unknown>("/api/v1/admin/rooms")
    if (!Array.isArray(data)) {
      rows.value = []
      rowsError.value = "Unexpected data format from room list API."
      return
    }
    rows.value = data.map((raw, index) => {
      const room = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : {}
      const roomId = typeof room.roomId === "string" && room.roomId.trim() ? room.roomId : `row-${index}`
      const roomType = typeof room.roomType === "string" && room.roomType.trim() ? room.roomType : "-"
      const bedType = typeof room.bedType === "string" && room.bedType.trim() ? room.bedType : "-"
      const imageUrl = typeof room.imageUrl === "string" && room.imageUrl.trim() ? room.imageUrl : "/loginimage.svg"

      const guestsNum = Number(room.guests)
      const priceNum = Number(room.price)
      const promotionNum = room.promotionPrice === null || room.promotionPrice === undefined
        ? null
        : Number(room.promotionPrice)
      const roomSizeNum = room.roomSizeSqm === null || room.roomSizeSqm === undefined
        ? null
        : Number(room.roomSizeSqm)

      return {
        roomId,
        roomType,
        roomSize: Number.isFinite(roomSizeNum) ? formatRoomSize(roomSizeNum) : "-",
        bedType,
        guests: Number.isFinite(guestsNum) ? String(guestsNum) : "-",
        price: Number.isFinite(priceNum) ? formatMoney(priceNum) : "-",
        promotionPrice: Number.isFinite(promotionNum) ? formatMoney(promotionNum) : "-",
        imageUrl,
      }
    })
  } catch (error) {
    rows.value = []
    rowsError.value = extractApiErrorMessage(error, "Unable to load room data.")
  } finally {
    isLoadingRows.value = false
  }
}

onMounted(() => {
  void loadRooms()
})
</script>

<template>
  <section v-if="!isEditOpen" class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <header
      class="box-border flex h-[80px] w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1
        class="min-w-0 flex-1 font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#2A2E3F]"
      >
        Room &amp; Property
      </h1>

      <div class="flex items-center gap-4">
        <div class="relative flex w-[320px] items-center" role="search">
          <label class="sr-only" for="room-search">Search</label>
          <div class="flex h-12 w-full items-center gap-2.5 rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3">
            <Search class="size-6 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
            <input
              id="room-search"
              v-model="searchQuery"
              type="search"
              placeholder="Search..."
              class="w-full border-0 bg-transparent p-0 font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none placeholder:text-[#9AA1B9]"
            />
          </div>
        </div>

        <button
          type="button"
          class="h-12 w-[178px] rounded-[4px] bg-[#C14817] text-sm font-semibold text-white transition-colors hover:bg-[#8B3210]"
          aria-label="Create room"
          @click="openCreate"
        >
          <span class="inline-flex items-center gap-2">
            <Plus class="size-5" aria-hidden="true" />
            <span class="font-[Open Sans] text-[16px] leading-[16px] font-semibold">Create Room</span>
          </span>
        </button>
      </div>
    </header>

    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <p v-if="rowsError" class="mb-3 font-[Inter] text-[14px] leading-[21px] text-red-700">{{ rowsError }}</p>
      <p v-else-if="isLoadingRows" class="mb-3 font-[Inter] text-[14px] leading-[21px] text-[#646D89]">Loading rooms...</p>
      <article class="w-full overflow-x-auto rounded-[4px] border border-transparent bg-transparent">
        <table class="w-full min-w-[1080px] table-fixed border-collapse">
          <thead>
            <tr class="bg-[#E4E6ED]">
              <th
                class="w-[153px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Image
              </th>
              <th
                class="w-[240px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Room type
              </th>
              <th
                class="w-[136px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Price
              </th>
              <th
                class="w-[136px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Promotion Price
              </th>
              <th
                class="w-[94px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Guest(s)
              </th>
              <th
                class="w-[167px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Bed Type
              </th>
              <th
                class="w-[128px] px-4 py-2.5 text-justify font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#424C6B]"
              >
                Room Size
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="row in filteredRows"
              :key="row.roomId"
              class="cursor-pointer border-b border-[#E4E6ED] bg-white transition-colors hover:bg-[#F6F7FC]"
              @click="openEdit(row)"
            >
              <td class="align-middle px-4 py-6">
                <img
                  :src="row.imageUrl"
                  alt="Room image placeholder"
                  class="h-[72px] w-[120px] rounded-[4px] border border-[#E4E6ED] bg-white object-cover"
                />
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.roomType }}
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.price }}
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.promotionPrice }}
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.guests }}
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.bedType }}
              </td>
              <td class="align-middle px-4 py-6 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-justify text-black">
                {{ row.roomSize }}
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <nav class="mt-10 flex w-full items-center justify-center gap-2" aria-label="Pagination">
        <button type="button" class="flex size-8 items-center justify-center rounded-[4px] opacity-50" aria-label="Previous page">
          <span class="text-[#D6D9E4]" aria-hidden="true">‹</span>
        </button>

        <button
          type="button"
          class="size-8 rounded-[4px] border border-[#D5DFDA] bg-white text-center text-base font-semibold leading-4 text-[#5D7B6A]"
          aria-current="page"
        >
          1
        </button>

        <button
          v-for="n in [2, 3, 4, 5]"
          :key="n"
          type="button"
          class="size-8 rounded-[4px] text-center text-base font-semibold leading-4 text-[#C8CCDB]"
        >
          {{ n }}
        </button>

        <button type="button" class="flex size-8 items-center justify-center rounded-[4px]" aria-label="Next page">
          <span class="text-[#9AA1B9]" aria-hidden="true">›</span>
        </button>
      </nav>
    </main>
  </section>

  <section v-else class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <header
      class="box-border flex min-h-[80px] w-full shrink-0 flex-wrap items-center gap-3 border-b border-[#E4E6ED] bg-white px-4 py-4 sm:gap-4 sm:px-8 sm:py-0 lg:px-[60px]"
    >
      <template v-if="isCreating">
        <h2 class="min-w-0 flex-1 font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#2A2E3F]">
          Create New Room
        </h2>
        <button
          type="button"
          class="h-12 rounded-[4px] border border-[#E76B39] px-8 font-[Open Sans] text-[16px] leading-[16px] font-semibold text-[#E76B39] transition-colors hover:bg-[#F6E9E5]"
          aria-label="Cancel create room"
          @click="closeModal"
        >
          Cancel
        </button>
        <button
          type="button"
          class="h-12 rounded-[4px] bg-[#C14817] px-8 font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
          aria-label="Create room"
          :disabled="isSubmittingCreate"
          @click="onCreateRoom"
        >
          {{ isSubmittingCreate ? "Creating..." : "Create" }}
        </button>
      </template>

      <template v-else>
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-[4px] hover:bg-[#F6F7FC]"
          aria-label="Back"
          @click="closeModal"
        >
          <ArrowLeft class="size-6 text-[#9AA1B9]" :stroke-width="2" aria-hidden="true" />
        </button>
        <h2 class="min-w-0 flex-1 font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#2A2E3F]">
          {{ selectedRoom?.roomType || "Room & Property" }}
        </h2>
        <button
          type="button"
          class="h-12 w-[121px] rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
          aria-label="Update room"
          :disabled="isSubmittingUpdate || isSubmittingDelete || isLoadingEditDetail"
          @click="onUpdateRoom"
        >
          {{ isSubmittingUpdate ? "Updating..." : "Update" }}
        </button>
      </template>
    </header>

    <section class="px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <section class="w-full max-w-[1080px] rounded-[4px] border border-[#E4E6ED] bg-[#FFFFFF]">
        <form class="flex flex-col gap-[40px] px-4 py-8 sm:px-8 lg:px-20 lg:py-10 lg:pb-[60px]" @submit.prevent>
        <input
          ref="mainImageInputRef"
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp"
          tabindex="-1"
          @change="onMainImageFileChange"
        />
        <input
          ref="galleryImageInputRef"
          type="file"
          class="sr-only"
          accept="image/jpeg,image/png,image/webp"
          tabindex="-1"
          @change="onGalleryImageFileChange"
        />
        <p v-if="createError" class="body-2 text-red-700">{{ createError }}</p>
        <p v-if="imageUploadError" class="body-2 text-red-700">{{ imageUploadError }}</p>
        <p v-if="isLoadingEditDetail && !isCreating" class="body-2 text-[#646D89]">Loading room details...</p>
        <section class="flex w-full flex-col gap-[12px]">
          <h3 class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
            Basic Information
          </h3>

          <!-- Layout per spec: inner width = 920px = 440 + gap(40) + 440 -->
          <section class="flex w-full flex-col gap-[24px]">
            <!-- Room Type (full width) -->
            <section class="flex flex-col gap-[4px] w-full">
              <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-room-type">
                Room Type *
              </label>
              <input
                id="edit-room-type"
                v-model="editForm.roomType"
                type="text"
                class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
              />
            </section>

            <!-- Room size + Bed type -->
            <section class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-10">
              <section class="flex w-full flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-room-size">
                  Room size(sqm) *
                </label>
                <input
                  id="edit-room-size"
                  v-model="editForm.roomSize"
                  type="number"
                  step="0.01"
                  min="0"
                  class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                />
              </section>

              <section class="flex w-full flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-bed-type">
                  Bed type *
                </label>
                <div class="relative">
                  <select
                    id="edit-bed-type"
                    v-model="editForm.bedType"
                    class="h-[48px] w-full appearance-none rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-10 font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                  >
                    <option value="single bed">Single bed</option>
                    <option value="double bed">Double bed</option>
                    <option value="double bed (king size)">Double bed (king size)</option>
                    <option value="twin bed">Twin bed</option>
                  </select>
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#646D89]" aria-hidden="true">
                    <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.83 8.33L10 12.5L14.17 8.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </section>
            </section>

            <!-- Guest(s) -->
            <section class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-10">
              <section class="flex w-full flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-guests">
                  Guest(s) *
                </label>
                <div class="relative">
                  <select
                    id="edit-guests"
                    v-model="editForm.guests"
                    class="h-[48px] w-full appearance-none rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-10 font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                  >
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                  <span class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#646D89]" aria-hidden="true">
                    <svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5.83 8.33L10 12.5L14.17 8.33" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                  </span>
                </div>
              </section>
              <div class="hidden lg:block" aria-hidden="true" />
            </section>

            <!-- Price + Promotion -->
            <section class="grid w-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-10">
              <section class="flex w-full flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-price">
                  Price per Night(THB) *
                </label>
                <input
                  id="edit-price"
                  v-model="editForm.price"
                  type="text"
                  class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                />
              </section>

              <section class="flex w-full items-end gap-4">
                <label class="flex items-center gap-3 pb-3 font-[Inter] text-[16px] leading-[24px] font-normal text-[#646D89]" for="promotion-enabled">
                  <input
                    id="promotion-enabled"
                    v-model="editForm.promotionEnabled"
                    type="checkbox"
                    class="promotion-checkbox size-6 appearance-none rounded-[4px]"
                  />
                  Promotion Price
                </label>
                <input
                  id="edit-promotion-price"
                  v-model="editForm.promotionPrice"
                  type="text"
                  :disabled="!editForm.promotionEnabled"
                  class="h-[48px] flex-1 rounded-[4px] border border-[#D6D9E4] pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9] disabled:bg-[#F1F2F6] disabled:text-[#9AA1B9]"
                />
              </section>
            </section>
          </section>
        </section>

        <section class="flex w-full flex-col gap-[12px]">
          <section class="flex flex-col gap-[4px]">
            <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-room-description">
              Room Description *
            </label>
            <textarea id="edit-room-description" v-model="editForm.roomDescription" class="min-h-[96px] w-full resize-none rounded-[4px] border border-[#D6D9E4] bg-white px-[12px] py-[12px] outline-none focus:border-[#9AA1B9]" />
          </section>

          <section class="flex flex-col gap-[24px] border-t border-[#E4E6ED] pt-[24px]">
            <section class="flex flex-col gap-[16px]">
              <h3 class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
                Room Image
              </h3>

              <section class="relative w-fit">
                <template v-if="editForm.roomMainImageUrl">
                  <img :src="editForm.roomMainImageUrl" alt="Main room image preview" class="h-[240px] w-[240px] rounded-[4px] border border-[#E4E6ED] bg-[#F1F2F6] object-cover" />
                  <button
                    type="button"
                    class="absolute -right-2 -top-2 flex size-[24px] items-center justify-center rounded-full bg-[#B61515] text-white"
                    aria-label="Remove main image"
                    @click="editForm.roomMainImageUrl = ''"
                  >
                    <X class="size-[14px]" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    class="mt-3 font-[Nunito] text-[14px] font-medium leading-[21px] text-[#E76B39] underline-offset-2 hover:underline"
                    :disabled="isUploadingRoomImage"
                    @click="openMainImagePicker"
                  >
                    Change photo
                  </button>
                </template>
                <button
                  v-else
                  type="button"
                  class="flex h-[240px] w-[240px] flex-col items-center justify-center gap-2 rounded-[4px] bg-[#F1F2F6] disabled:opacity-60"
                  aria-label="Upload main image"
                  :disabled="isUploadingRoomImage"
                  @click="openMainImagePicker"
                >
                  <span class="text-2xl leading-none text-[#E76B39]">{{ isUploadingRoomImage ? "…" : "+" }}</span>
                  <span class="font-[Nunito] text-[14px] leading-[21px] font-medium text-[#E76B39]">{{
                    isUploadingRoomImage ? "Uploading…" : "Upload photo"
                  }}</span>
                </button>
              </section>
            </section>

            <section class="flex flex-col gap-[16px]">
              <h4 class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
                Image Gallery(At least 4 pictures) *
              </h4>
              <section class="flex flex-wrap gap-[24px]">
                <section
                  v-for="(url, idx) in editForm.roomGalleryUrls"
                  :key="idx"
                  class="flex w-[167px] flex-col items-center gap-1"
                >
                  <section
                    class="relative inline-flex"
                    draggable="true"
                    @dragstart="onGalleryDragStart(idx)"
                    @dragover.prevent
                    @drop.prevent="onGalleryDrop(idx)"
                  >
                    <img :src="url" :alt="`Gallery image ${idx + 1}`" class="h-[167px] w-[167px] rounded-[4px] border border-[#E4E6ED] bg-[#F1F2F6] object-cover" />
                    <button
                      type="button"
                      class="absolute -right-2 -top-2 flex size-[24px] items-center justify-center rounded-full bg-[#AF2758] text-white"
                      aria-label="Remove gallery image"
                      @click="removeGalleryImage(idx)"
                    >
                      <X class="size-[14px]" aria-hidden="true" />
                    </button>
                  </section>
                  <button
                    type="button"
                    class="font-[Nunito] text-[12px] font-medium leading-[18px] text-[#E76B39] underline-offset-2 hover:underline disabled:opacity-60"
                    :disabled="isUploadingRoomImage"
                    @click="openGalleryPickerForReplace(idx)"
                  >
                    Change photo
                  </button>
                </section>

                <button
                  type="button"
                  class="flex h-[167px] w-[167px] flex-col items-center justify-center gap-2 rounded-[4px] bg-[#F1F2F6] disabled:opacity-60"
                  aria-label="Upload gallery image"
                  :disabled="isUploadingRoomImage"
                  @click="openGalleryPickerForNew"
                >
                  <span class="text-2xl leading-none text-[#E76B39]">{{ isUploadingRoomImage ? "…" : "+" }}</span>
                  <span class="font-[Nunito] text-[14px] leading-[21px] font-medium text-[#E76B39]">{{
                    isUploadingRoomImage ? "Uploading…" : "Upload photo"
                  }}</span>
                </button>
              </section>
            </section>
          </section>
        </section>

        <section class="flex w-full flex-col gap-[16px] border-t border-[#E4E6ED] pt-[24px]">
          <h3 class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
            Room Amenities
          </h3>

          <section class="flex flex-col gap-[24px]">
            <section class="flex flex-col gap-[12px]">
              <section
                v-for="(_, idx) in editForm.amenities"
                :key="`amenity-row-${idx}`"
                class="flex items-end gap-[24px]"
              >
                <span class="hidden shrink-0 mb-[12px] text-[#E76B39] lg:inline" aria-hidden="true">::</span>
                <section class="flex min-w-0 w-full flex-1 flex-col gap-1">
                  <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" :for="`amenity-input-${idx}`">Amenitiy *</label>
                  <input
                    :id="`amenity-input-${idx}`"
                    type="text"
                    :aria-label="`Amenity ${idx + 1}`"
                    class="box-border h-[48px] w-full min-w-0 rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                    v-model="editForm.amenities[idx]"
                  />
                </section>
                <button
                  type="button"
                  class="mb-[12px] flex h-[24px] w-[67px] items-center justify-center rounded-[4px] text-[16px] font-semibold text-[#E76B39] hover:bg-[#F6E9E5]"
                  aria-label="Delete amenity"
                  @click="removeAmenity(idx)"
                >
                  Delete
                </button>
              </section>
            </section>

            <button
              type="button"
              class="self-start rounded-[4px] border border-[#E76B39] bg-white px-[12px] py-[8px] text-[16px] font-semibold text-[#E76B39] transition-colors hover:bg-[#F6E9E5]"
              aria-label="Add Amenity"
              @click="addAmenity"
            >
              + Add Amenity
            </button>
          </section>
        </section>

        <section v-if="!isCreating" class="flex justify-end">
          <button
            type="button"
            class="h-12 w-[121px] rounded-[4px] border border-[#E76B39] bg-white font-[Open Sans] text-[16px] leading-[16px] font-semibold text-[#E76B39] transition-colors hover:bg-[#F6E9E5]"
            aria-label="Delete room"
            :disabled="isSubmittingDelete || isSubmittingUpdate || isLoadingEditDetail"
            @click="openDeleteModal"
          >
            {{ isSubmittingDelete ? "Deleting..." : "Delete Room" }}
          </button>
        </section>
        </form>
      </section>
    </section>

    <section
      v-if="isDeleteModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-room-modal-title"
    >
      <article class="w-full max-w-[631px] overflow-hidden rounded-[4px] bg-white shadow-[2px_2px_12px_rgba(64,50,133,0.12)]">
        <header class="flex h-[56px] items-center border-b border-[#E4E6ED] px-6 py-2">
          <h3 id="delete-room-modal-title" class="flex-1 font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-black">
            Delete Room
          </h3>
          <button
            type="button"
            class="flex h-10 w-[41px] items-center justify-center rounded-[4px] text-[#C8CCDB] transition-colors hover:bg-[#F6F7FC]"
            aria-label="Close delete confirmation"
            :disabled="isSubmittingDelete"
            @click="closeDeleteModal"
          >
            <X class="size-5" :stroke-width="2" aria-hidden="true" />
          </button>
        </header>

        <section class="flex flex-col items-end gap-6 p-6">
          <section class="w-full">
            <p class="font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#646D89]">
              Are you sure you want to delete this room?
            </p>
          </section>

          <section class="flex w-full max-w-[380px] gap-4">
            <button
              type="button"
              class="h-12 w-[220px] rounded-[4px] border border-[#E76B39] bg-white px-8 font-[Open Sans] text-[16px] leading-[16px] font-semibold text-[#E76B39] transition-colors hover:bg-[#F6E9E5]"
              :disabled="isSubmittingDelete"
              @click="closeDeleteModal"
            >
              Cancel
            </button>
            <button
              type="button"
              class="h-12 w-[144px] rounded-[4px] bg-[#C14817] px-8 font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
              :disabled="isSubmittingDelete"
              @click="onDeleteRoom"
            >
              {{ isSubmittingDelete ? "Deleting..." : "Delete" }}
            </button>
          </section>
        </section>
      </article>
    </section>
  </section>
</template>

<style scoped>
.promotion-checkbox {
  border: 1px solid #f3b59c;
  background-color: #ffffff;
}

.promotion-checkbox:checked {
  border-color: #f3b59c;
  background-color: #e76b39;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='none' stroke='white' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 8.5l3 3L13 4.5'/%3E%3C/svg%3E");
  background-position: center;
  background-repeat: no-repeat;
}
</style>

