<script setup lang="ts">
import { ChevronDown, Plus, Search } from "lucide-vue-next"
import { computed, onBeforeUnmount, onMounted, ref } from "vue"

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
  roomNo: string
  roomType: string
  bedType: string
  status: StatusKey
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

const statusByKey = computed(() => {
  const map: Record<StatusKey, StatusOption> = {} as Record<StatusKey, StatusOption>
  for (const opt of STATUS_OPTIONS) map[opt.key] = opt
  return map
})
const roomTypeOptions = ["Superior Garden View", "Deluxe", "Superior", "Premier Sea View", "Supreme", "Suite"]
const bedTypeOptions = ["Single Bed", "Double Bed"]
const mockStatusCycle: StatusKey[] = [
  "Occupied",
  "Assign Clean",
  "Vacant Clean Pick Up",
  "Assign Dirty",
  "Vacant Clean",
  "Occupied Clean",
  "Vacant Clean Inspected",
  "Occupied Dirty",
  "Out of Service",
  "Out of Inventory",
]

const rows = ref<RoomRow[]>(
  Array.from({ length: 10 }, (_, i) => {
    const roomNo = String(i + 1).padStart(4, "0")
    const roomType = roomTypeOptions[i % roomTypeOptions.length] ?? roomTypeOptions[0]!
    const bedType = bedTypeOptions[i % bedTypeOptions.length] ?? bedTypeOptions[0]!
    const status = mockStatusCycle[i % mockStatusCycle.length] ?? mockStatusCycle[0]!

    return {
      roomNo,
      roomType,
      bedType,
      status,
    }
  }),
)

const statusDropdownOpenFor = ref<string | null>(null)
const statusSearch = ref("")
const dropdownRef = ref<HTMLElement | null>(null)

const filteredStatusOptions = computed(() => {
  const q = statusSearch.value.trim().toLowerCase()
  if (!q) return STATUS_OPTIONS
  return STATUS_OPTIONS.filter((opt) => opt.label.toLowerCase().includes(q))
})

function openStatusDropdown(roomNo: string) {
  statusSearch.value = ""
  statusDropdownOpenFor.value = roomNo
}

function closeStatusDropdown() {
  statusDropdownOpenFor.value = null
}

function selectStatus(roomNo: string, status: StatusKey) {
  rows.value = rows.value.map((r) => (r.roomNo === roomNo ? { ...r, status } : r))
  closeStatusDropdown()
}

function chipText(statusKey: StatusKey) {
  return statusByKey.value[statusKey]?.label ?? statusKey
}

function onDocumentMouseDown(e: MouseEvent) {
  if (!dropdownRef.value) return
  const target = e.target as Node | null
  if (!target) return
  if (dropdownRef.value.contains(target)) return
  closeStatusDropdown()
}

onMounted(() => {
  document.addEventListener("mousedown", onDocumentMouseDown)
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
          <label class="sr-only" for="room-search">Search</label>
          <div class="flex w-full items-center gap-2.5 rounded-[4px] border border-[#D6D9E4] bg-white px-4 py-3">
            <Search class="size-6 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
            <input
              id="room-search"
              type="search"
              placeholder="Search..."
              class="w-full border-0 bg-transparent p-0 text-[#2A2E3F] outline-none placeholder:text-[#9AA1B9]"
            />
          </div>
        </div>

        <button
          type="button"
          class="h-12 w-[178px] rounded-[4px] bg-[#C14817] font-[Open Sans] text-[16px] leading-[16px] font-semibold text-white transition-colors hover:bg-[#8B3210]"
          aria-label="Create room"
        >
          <span class="inline-flex items-center justify-center gap-2">
            <Plus class="size-5" aria-hidden="true" />
            Create Room
          </span>
        </button>
      </div>
    </header>

    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
      <article class="w-full overflow-x-auto rounded-[4px] border border-transparent bg-transparent">
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
            <tr v-for="(row, idx) in rows" :key="`${row.roomNo}-${idx}`" class="border-b border-[#E4E6ED] bg-white">
              <td class="body-1 px-4 py-6 text-black">{{ row.roomNo }}</td>
              <td class="body-1 px-4 py-6 text-black">{{ row.roomType }}</td>
              <td class="body-1 px-4 py-6 text-black">{{ row.bedType }}</td>

              <td class="relative px-4 py-6">
                <button
                  type="button"
                  class="relative"
                  @mousedown.stop="openStatusDropdown(row.roomNo)"
                  :aria-label="`Change status for room ${row.roomNo}`"
                >
                  <span
                    :class="[
                      statusByKey[row.status].chipClass,
                      'font-[Inter] text-[14px] leading-[150%] font-medium tracking-[-0.02em]',
                    ]"
                  >
                    {{ chipText(row.status) }}
                  </span>
                </button>

                <section
                  v-if="statusDropdownOpenFor === row.roomNo"
                  ref="dropdownRef"
                  class="absolute right-0 top-[60px] z-50 h-[534px] w-[212px] rounded-[4px] bg-white filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.08)]"
                  @mousedown.stop
                  aria-label="Change status"
                  role="dialog"
                >
                  <div
                    class="flex h-[45px] items-center gap-2.5 border-b border-[#D6D9E4] bg-white px-4 rounded-t-[4px]"
                  >
                    <Search class="size-5 shrink-0 text-[#646D89]" :stroke-width="1.5" aria-hidden="true" />
                    <input
                      v-model="statusSearch"
                      type="search"
                      placeholder="Search status..."
                      class="w-full border-0 bg-transparent p-0 font-[Inter] text-[14px] leading-[21px] font-medium tracking-[-0.02em] text-[#9AA1B9] outline-none placeholder:text-[#9AA1B9]"
                    />
                  </div>

                  <div
                    class="flex h-[489px] flex-col gap-[8px] overflow-auto bg-white rounded-b-[4px] px-[8px] py-[8px]"
                  >
                    <button
                      v-for="opt in filteredStatusOptions"
                      :key="opt.key"
                      type="button"
                      class="w-full text-left"
                      :aria-label="`Set status ${opt.label}`"
                      @click="selectStatus(row.roomNo, opt.key)"
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
                </section>
              </td>
            </tr>
          </tbody>
        </table>
      </article>

      <nav class="mt-10 flex w-full items-center justify-center gap-2" aria-label="Pagination">
        <button type="button" class="flex size-8 items-center justify-center rounded-[4px] opacity-50" aria-label="Previous page">
          <span class="text-[#D6D9E4]" aria-hidden="true">‹</span>
        </button>
        <button type="button" class="size-8 rounded-[4px] border border-[#D5DFDA] bg-white text-center text-base font-semibold leading-4 text-[#5D7B6A]" aria-current="page">
          1
        </button>
        <button v-for="n in [2, 3, 4, 5]" :key="n" type="button" class="size-8 rounded-[4px] text-center text-base font-semibold leading-4 text-[#C8CCDB]">
          {{ n }}
        </button>
        <button type="button" class="flex size-8 items-center justify-center rounded-[4px]" aria-label="Next page">
          <span class="text-[#9AA1B9]" aria-hidden="true">›</span>
        </button>
      </nav>
    </main>
  </section>
</template>

