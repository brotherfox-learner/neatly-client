<script setup lang="ts">
import axios from "axios"
import { ChevronDown, Plus, Search } from "lucide-vue-next"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"
import { RouterLink } from "vue-router"

import AdminTablePagination from "@/components/admin/AdminTablePagination.vue"
import { usePagedList } from "@/composables/usePagedList"
import { api } from "@/lib/api"
import { adminRoomListItemSchema } from "@/schemas/adminRoom"

type StatusKey =
  | "Vacant"
  | "Occupied"
  | "Assign Clean"
  | "Assign Dirty"
  | "Vacant Clean"
  | "Vacant Clean Inspected"
  | "Vacant Clean Pick Up"
  | "Occupied Clean"
  | "Occupied Clean Inspected"
  | "Occupied Dirty"
  | "Out of Order"
  | "Out of Service"
  | "Out of Inventory"

type RoomRow = {
  roomId: string
  roomNo: string
  roomType: string
  bedType: string
  status: string
}

type StatusOption = {
  key: StatusKey
  label: string
  chipClass: string
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    key: "Vacant",
    label: "Vacant",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#F0F2F8] text-[#006753]",
  },
  {
    key: "Occupied",
    label: "Occupied",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#E4ECFF] text-[#084BAF]",
  },
  {
    key: "Assign Clean",
    label: "Assign Clean",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#E6FFFA] text-[#006753]",
  },
  {
    key: "Assign Dirty",
    label: "Assign Dirty",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#FFE6E6] text-[#A50606]",
  },
  {
    key: "Vacant Clean",
    label: "Vacant Clean",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#E6FFFA] text-[#006753]",
  },
  {
    key: "Vacant Clean Inspected",
    label: "Vacant Clean Inspected",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#FFF9E6] text-[#766A00]",
  },
  {
    key: "Vacant Clean Pick Up",
    label: "Vacant Clean Pick Up",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#E6FFFA] text-[#006753]",
  },
  {
    key: "Occupied Clean",
    label: "Occupied Clean",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#E6FFFA] text-[#084BAF]",
  },
  {
    key: "Occupied Clean Inspected",
    label: "Occupied Clean Inspected",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#FFF9E6] text-[#766A00]",
  },
  {
    key: "Occupied Dirty",
    label: "Occupied Dirty",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#FFE6E6] text-[#A50606]",
  },
  {
    key: "Out of Order",
    label: "Out of Order",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#F0F1F8] text-[#6E7288]",
  },
  {
    key: "Out of Service",
    label: "Out of Service",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#F0F1F8] text-[#6E7288]",
  },
  {
    key: "Out of Inventory",
    label: "Out of Inventory",
    chipClass:
      "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#F0F1F8] text-[#6E7288]",
  },
]

const DEFAULT_UNKNOWN_CHIP_CLASS =
  "flex h-[29px] items-start gap-[8px] px-[12px] py-[4px] rounded-[4px] bg-[#F0F1F8] text-[#6E7288]"

function chipClassFor(status: string): string {
  const opt = STATUS_OPTIONS.find((o) => o.key === status)
  return opt?.chipClass ?? DEFAULT_UNKNOWN_CHIP_CLASS
}

function chipLabelFor(status: string): string {
  const opt = STATUS_OPTIONS.find((o) => o.key === status)
  return opt?.label ?? status
}

function formatBedType(raw: string | null | undefined): string {
  const s = String(raw ?? "").trim()
  if (!s) return "-"
  return s
    .split(/\s+/)
    .map((w) => (w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : w))
    .join(" ")
}

const rows = ref<RoomRow[]>([])
const searchQuery = ref("")
const isLoadingRows = ref(false)
const listError = ref("")
const statusSaveError = ref("")

const filteredRows = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return rows.value
  return rows.value.filter((r) =>
    [r.roomNo, r.roomType, r.bedType, r.status].some((x) => x.toLowerCase().includes(q)),
  )
})

const { currentPage, totalPages, totalItems, pagedItems, setPage } = usePagedList(filteredRows, [
  searchQuery,
])

const statusDropdownOpenFor = ref<string | null>(null)
const statusSearch = ref("")
const dropdownRef = ref<HTMLElement | null>(null)

const filteredStatusOptions = computed(() => {
  const q = statusSearch.value.trim().toLowerCase()
  if (!q) return STATUS_OPTIONS
  return STATUS_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(q))
})

function openStatusDropdown(roomId: string) {
  statusSearch.value = ""
  statusDropdownOpenFor.value = roomId
}

function closeStatusDropdown() {
  statusDropdownOpenFor.value = null
}

async function selectStatus(roomId: string, status: StatusKey) {
  const prev = rows.value.find((r) => r.roomId === roomId)?.status
  rows.value = rows.value.map((r) => (r.roomId === roomId ? { ...r, status } : r))
  closeStatusDropdown()
  statusSaveError.value = ""
  try {
    await api.patch(`/api/v1/admin/rooms/${roomId}/status`, { status })
  } catch (error) {
    if (prev !== undefined) {
      rows.value = rows.value.map((r) => (r.roomId === roomId ? { ...r, status: prev } : r))
    }
    if (axios.isAxiosError(error)) {
      const data = error.response?.data
      if (typeof data === "object" && data !== null && "message" in data) {
        const msg = (data as { message?: unknown }).message
        if (typeof msg === "string" && msg.trim()) {
          statusSaveError.value = msg
          return
        }
      }
    }
    statusSaveError.value = "Could not update status. Please try again."
  }
}

function onDocumentMouseDown(e: MouseEvent) {
  if (!dropdownRef.value) return
  const target = e.target as Node | null
  if (!target) return
  if (dropdownRef.value.contains(target)) return
  closeStatusDropdown()
}

function extractListError(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback
  if (!error.response) return "Cannot reach the server. Check that the API is running and your network connection."
  const status = error.response.status
  const data = error.response.data
  if (typeof data === "object" && data !== null && "message" in data) {
    const msg = (data as { message?: unknown }).message
    if (typeof msg === "string" && msg.trim()) return msg
  }
  if (status === 401) return "Your session has expired. Please sign in again."
  if (status === 403) return "You do not have permission to view rooms. Please sign in with an admin account."
  if (status >= 500) return "Server error while loading rooms. Please try again later."
  return fallback
}

function mapListItemLoose(raw: unknown): RoomRow | null {
  const room = typeof raw === "object" && raw !== null ? (raw as Record<string, unknown>) : null
  if (!room) return null
  const roomId = typeof room.roomId === "string" && room.roomId.trim() ? room.roomId.trim() : ""
  if (!roomId) return null
  const roomType = typeof room.roomType === "string" && room.roomType.trim() ? room.roomType.trim() : "-"
  const bedType = typeof room.bedType === "string" && room.bedType.trim() ? room.bedType.trim() : ""
  const roomNumber =
    typeof room.roomNumber === "string" && room.roomNumber.trim()
      ? room.roomNumber.trim()
      : typeof room.room_number === "string" && room.room_number.toString().trim()
        ? String(room.room_number).trim()
        : ""
  const statusRaw = typeof room.status === "string" && room.status.trim() ? room.status.trim() : "Vacant Clean"
  return {
    roomId,
    roomNo: roomNumber.length > 0 ? roomNumber : "-",
    roomType,
    bedType: formatBedType(bedType),
    status: statusRaw,
  }
}

async function loadRooms() {
  isLoadingRows.value = true
  listError.value = ""
  try {
    const { data } = await api.get<unknown>("/api/v1/admin/rooms")
    if (!Array.isArray(data)) {
      rows.value = []
      listError.value = "Unexpected data format from room list API."
      return
    }
    const next: RoomRow[] = []
    let parseFailures = 0
    for (let i = 0; i < data.length; i++) {
      const raw = data[i]
      const parsed = adminRoomListItemSchema.safeParse(raw)
      if (parsed.success) {
        const d = parsed.data
        next.push({
          roomId: d.roomId,
          roomNo: d.roomNumber && d.roomNumber.length > 0 ? d.roomNumber : "-",
          roomType: d.roomType.trim() ? d.roomType : "-",
          bedType: formatBedType(d.bedType ?? ""),
          status: d.status,
        })
        continue
      }
      parseFailures++
      const loose = mapListItemLoose(raw)
      if (loose) next.push(loose)
    }
    next.sort((a, b) => a.roomNo.localeCompare(b.roomNo, undefined, { numeric: true, sensitivity: "base" }))
    rows.value = next
    if (data.length > 0 && next.length === 0) {
      listError.value = "Received room data from the server but could not display any rows. Check API response shape."
    } else if (parseFailures > 0 && next.length > 0) {
      listError.value = ""
    }
  } catch (error) {
    rows.value = []
    listError.value = extractListError(error, "Unable to load room data.")
  } finally {
    isLoadingRows.value = false
  }
}

onMounted(() => {
  document.addEventListener("mousedown", onDocumentMouseDown)
  void loadRooms()
})

onBeforeUnmount(() => {
  document.removeEventListener("mousedown", onDocumentMouseDown)
})
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <header
      class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-[#2A2E3F]">Room Management</h1>

      <div class="flex items-center gap-4">
        <div class="relative flex w-[320px] items-center" role="search">
          <label class="sr-only" for="room-mgmt-search">Search</label>
          <div class="flex w-full items-center gap-2.5 rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3">
            <Search class="size-6 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
            <input
              id="room-mgmt-search"
              v-model="searchQuery"
              type="search"
              placeholder="Search..."
              class="w-full border-0 bg-transparent p-0 text-[#2A2E3F] outline-none placeholder:text-[#9AA1B9]"
            />
          </div>
        </div>

        <RouterLink
          :to="{ name: 'admin-room-property', query: { create: '1' } }"
          class="inline-flex h-12 w-[178px] items-center justify-center rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
          aria-label="Create room"
        >
          <span class="inline-flex items-center justify-center gap-2">
            <Plus class="size-5" aria-hidden="true" />
            Create Room
          </span>
        </RouterLink>
      </div>
    </header>

    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <p v-if="listError" class="body-2 mb-3 text-red-700">{{ listError }}</p>
      <p v-else-if="isLoadingRows" class="body-2 mb-3 text-[#646D89]">Loading rooms...</p>
      <p v-if="statusSaveError" class="body-2 mb-3 text-red-700">{{ statusSaveError }}</p>

      <article class="w-full overflow-x-auto overflow-y-visible rounded-[4px] border border-transparent bg-transparent">
        <table class="w-full min-w-[1080px] table-fixed border-collapse">
          <thead>
            <tr class="bg-[#E4E6ED]">
              <th class="body-2 w-[120px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]">
                Room no.
              </th>
              <th class="body-2 w-[367px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]">
                Room type
              </th>
              <th class="body-2 w-[300px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]">
                Bed Type
              </th>
              <th class="body-2 w-[293px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            <tr v-for="row in pagedItems" :key="row.roomId" class="border-b border-[#E4E6ED] bg-white">
              <td class="body-1 px-4 py-6 text-black">{{ row.roomNo }}</td>
              <td class="body-1 px-4 py-6 text-black">{{ row.roomType }}</td>
              <td class="body-1 px-4 py-6 text-black">{{ row.bedType }}</td>

              <td class="overflow-visible px-4 py-6 align-top">
                <div class="relative inline-flex flex-col items-end">
                  <button
                    type="button"
                    class="inline-flex items-center gap-1"
                    :disabled="isLoadingRows"
                    @mousedown.stop="openStatusDropdown(row.roomId)"
                    :aria-label="`Change status for room ${row.roomNo}`"
                    :aria-expanded="statusDropdownOpenFor === row.roomId"
                  >
                    <span
                      :class="[
                        chipClassFor(row.status),
                        'font-[Inter] text-[14px] leading-[150%] font-medium tracking-[-0.02em]',
                      ]"
                    >
                      {{ chipLabelFor(row.status) }}
                    </span>
                    <ChevronDown class="size-4 shrink-0 text-[#646D89]" aria-hidden="true" />
                  </button>

                  <section
                    v-if="statusDropdownOpenFor === row.roomId"
                    ref="dropdownRef"
                    class="absolute right-0 top-full z-50 mt-1 w-[212px] overflow-hidden rounded-[4px] bg-white filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                    @mousedown.stop
                    aria-label="Change status"
                    role="dialog"
                  >
                    <div
                      class="flex items-center gap-2.5 border-b border-[#D6D9E4] bg-white px-4 py-3"
                    >
                      <Search class="size-5 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
                      <input
                        v-model="statusSearch"
                        type="search"
                        placeholder="Search status..."
                        class="w-full border-0 bg-transparent p-0 font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#2A2E3F] outline-none placeholder:text-[#9AA1B9]"
                      />
                    </div>

                    <div
                      class="max-h-[min(240px,50vh)] overflow-y-auto overscroll-contain bg-white px-2 py-2"
                    >
                      <div class="flex flex-col gap-2">
                        <button
                          v-for="opt in filteredStatusOptions"
                          :key="opt.key"
                          type="button"
                          class="w-full shrink-0 text-left"
                          :aria-label="`Set status ${opt.label}`"
                          @click="selectStatus(row.roomId, opt.key)"
                        >
                          <span
                            :class="[
                              opt.chipClass,
                              'font-[Inter] text-[14px] leading-[150%] font-medium tracking-[-0.02em]',
                            ]"
                          >
                            {{ opt.label }}
                          </span>
                        </button>
                      </div>
                    </div>
                  </section>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <AdminTablePagination
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-items="totalItems"
        @update:current-page="setPage"
      />
    </main>
  </section>
</template>
