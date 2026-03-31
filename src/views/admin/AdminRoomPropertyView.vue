<script setup lang="ts">
import { computed, ref } from "vue"
import { ArrowLeft, Plus, Search, Trash2, X } from "lucide-vue-next"

type RoomRow = {
  roomType: string
  roomSize: string
  bedType: string
  guests: string
  price: string
  promotionPrice: string
  imageUrl: string
}

const searchQuery = ref("")

// Mock table rows. Later replace with backend data.
const rows = ref<RoomRow[]>(
  Array.from({ length: 8 }, (_, i) => {
    const base = i % 4
    const roomTypes = ["Superior Garden View", "Deluxe", "Superior", "Premier Sea View"] as const
    const roomType = roomTypes[base] ?? roomTypes[0]

    return {
      roomType,
      roomSize: "32 sqm",
      bedType: "Double Bed",
      guests: "2",
      price: "3,000.00",
      promotionPrice: "2,500.00",
      imageUrl: "/loginimage.svg",
    }
  }),
)

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

const editForm = ref({
  roomType: "",
  roomSize: "32 sqm",
  bedType: "Double bed",
  guests: "2",
  price: "3,000.00",
  promotionPrice: "2,500.00",
  roomDescription: "Rooms (36sqm) with full garden views, 1 single bed, bathroom with bathtub & shower.",
  roomMainImageUrl: "/loginimage.svg",
  roomGalleryUrls: ["/loginimage.svg", "/loginimage.svg", "/loginimage.svg", "/loginimage.svg"],
  amenities: ["Safe in Room", "Air Conditioning", "High speed internet connection", "Hairdryer", "Shower"],
})

function openEdit(row: RoomRow) {
  isCreating.value = false
  selectedRoom.value = row
  editForm.value = {
    ...editForm.value,
    roomType: row.roomType,
    roomSize: row.roomSize,
    bedType: row.bedType,
    guests: row.guests,
    price: row.price,
    promotionPrice: row.promotionPrice,
    roomMainImageUrl: row.imageUrl,
  }
  isEditOpen.value = true
}

function openCreate() {
  isCreating.value = true
  selectedRoom.value = null
  editForm.value = {
    ...editForm.value,
    roomType: "",
    roomSize: "32 sqm",
    bedType: "Double bed",
    guests: "2",
    price: "3,000.00",
    promotionPrice: "2,500.00",
    roomDescription: "",
    roomMainImageUrl: "/loginimage.svg",
    roomGalleryUrls: ["/loginimage.svg", "/loginimage.svg", "/loginimage.svg", "/loginimage.svg"],
    amenities: ["Safe in Room", "Air Conditioning"],
  }
  isEditOpen.value = true
}

function closeModal() {
  isEditOpen.value = false
  selectedRoom.value = null
}

function removeAmenity(idx: number) {
  editForm.value.amenities.splice(idx, 1)
}
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
              v-for="(row, index) in filteredRows"
              :key="index"
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
      class="box-border flex h-[80px] w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <button
        type="button"
        class="flex size-10 items-center justify-center rounded-[4px] hover:bg-[#F6F7FC]"
        aria-label="Back"
        @click="closeModal"
      >
        <ArrowLeft class="size-6 text-[#9AA1B9]" :stroke-width="2" aria-hidden="true" />
      </button>

      <h2 class="min-w-0 flex-1 font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#2A2E3F]">
        {{ isCreating ? "Room & Property" : selectedRoom?.roomType || "Room & Property" }}
      </h2>

      <button
        type="button"
        class="h-12 w-[121px] rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
        aria-label="Update room"
        @click="closeModal"
      >
        Update
      </button>
    </header>

    <section class="px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <section class="w-full max-w-[1080px] rounded-[4px] border border-[#E4E6ED] bg-[#FFFFFF]">
        <form class="flex flex-col gap-[40px] p-[40px_80px_60px]" @submit.prevent>
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
            <section class="flex w-full items-start gap-[40px]">
              <section class="flex w-[440px] flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-room-size">
                  Room size(sqm) *
                </label>
                <input
                  id="edit-room-size"
                  v-model="editForm.roomSize"
                  type="text"
                  class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                />
              </section>

              <section class="flex w-[440px] flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-bed-type">
                  Bed type *
                </label>
                <select
                  id="edit-bed-type"
                  v-model="editForm.bedType"
                  class="h-[48px] w-full appearance-none rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                >
                  <option>Double bed</option>
                  <option>Single bed</option>
                  <option>Triple bed</option>
                </select>
              </section>
            </section>

            <!-- Guest(s) -->
            <section class="flex w-full items-start gap-[40px]">
              <section class="flex w-[440px] flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-guests">
                  Guest(s) *
                </label>
                <input
                  id="edit-guests"
                  v-model="editForm.guests"
                  type="number"
                  min="1"
                  class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                />
              </section>
              <div class="w-[440px]" aria-hidden="true" />
            </section>

            <!-- Price + Promotion -->
            <section class="flex w-full items-start gap-[40px]">
              <section class="flex w-[440px] flex-col gap-[4px]">
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

              <section class="flex w-[440px] flex-col gap-[4px]">
                <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]" for="edit-promotion-price">
                  Promotion Price
                </label>
                <input
                  id="edit-promotion-price"
                  v-model="editForm.promotionPrice"
                  type="text"
                  class="h-[48px] w-full rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
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

              <section class="relative w-full">
                <img :src="editForm.roomMainImageUrl" alt="Main room image preview" class="h-[240px] w-[240px] rounded-[4px] border border-[#E4E6ED] bg-[#F1F2F6] object-cover" />
                <button
                  type="button"
                  class="absolute right-[20px] top-[-4px] flex size-[24px] items-center justify-center rounded-full bg-[#B61515] text-white"
                  aria-label="Remove main image"
                  @click="editForm.roomMainImageUrl = '/loginimage.svg'"
                >
                  <X class="size-[14px]" aria-hidden="true" />
                </button>
              </section>
            </section>

            <section class="flex flex-col gap-[16px]">
              <h4 class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
                Image Gallery(At least 4 pictures) *
              </h4>
              <section class="flex flex-wrap gap-[24px]">
                <section v-for="(url, idx) in editForm.roomGalleryUrls" :key="idx" class="relative">
                  <img :src="url" :alt="`Gallery image ${idx + 1}`" class="h-[167px] w-[167px] rounded-[4px] border border-[#E4E6ED] bg-[#F1F2F6] object-cover" />
                  <button
                    type="button"
                    class="absolute right-[20px] top-[-3px] flex size-[24px] items-center justify-center rounded-full bg-[#AF2758] text-white"
                    aria-label="Remove gallery image"
                    @click="editForm.roomGalleryUrls.splice(idx, 1, '/loginimage.svg')"
                  >
                    <X class="size-[14px]" aria-hidden="true" />
                  </button>
                </section>

                <button
                  type="button"
                  class="flex h-[167px] w-[167px] items-center justify-center rounded-[4px] border border-dashed border-[#E4E6ED] bg-[#FFFFFF]"
                  aria-label="Upload photo"
                >
                  <section class="flex h-[53px] w-[87px] flex-col items-center justify-between gap-[8px]">
                    <span class="flex size-[24px] items-center justify-center rounded-full border-2 border-[#E76B39] text-[#E76B39] font-bold leading-none">
                      +
                    </span>
                    <span class="font-[Nunito] text-[14px] leading-[21px] font-medium text-[#E76B39]">Upload photo</span>
                  </section>
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
            <label class="font-[Inter] text-[16px] leading-[24px] font-normal text-[#2A2E3F]">
              Amenitiy *
            </label>

            <section class="flex flex-col gap-[12px]">
              <section
                v-for="(amenity, idx) in editForm.amenities"
                :key="`${amenity}-${idx}`"
                class="flex items-center gap-[24px]"
              >
                <input
                  type="text"
                  :aria-label="`Amenity ${idx + 1}`"
                  class="h-[48px] flex-1 rounded-[4px] border border-[#D6D9E4] bg-white pl-[12px] pr-[16px] font-[Inter] text-[16px] leading-[24px] text-[#2A2E3F] outline-none focus:border-[#9AA1B9]"
                  v-model="editForm.amenities[idx]"
                />
                <button
                  type="button"
                  class="flex h-[24px] w-[67px] items-center justify-center rounded-[4px] text-[16px] font-semibold text-[#E76B39] hover:bg-[#F6F7FC]"
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
              @click="editForm.amenities.push('New Amenity')"
            >
              + Add Amenity
            </button>
          </section>
        </section>

        <section class="flex justify-end">
          <button
            type="button"
            class="h-12 w-[121px] rounded-[4px] border border-[#E76B39] bg-white font-[Open Sans] text-[16px] leading-[16px] font-semibold text-[#E76B39] transition-colors hover:bg-[#F6E9E5]"
            aria-label="Delete room"
            @click="closeModal"
          >
            Delete Room
          </button>
        </section>
        </form>
      </section>
    </section>
  </section>
</template>

