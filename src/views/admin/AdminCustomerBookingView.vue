<script setup lang="ts">
import axios from "axios"
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue"
import AdminTablePagination from "@/components/admin/AdminTablePagination.vue"
import { usePagedList } from "@/composables/usePagedList"
import { api } from "@/lib/api"
import {
  adminCustomerBookingListItemSchema,
  type AdminCustomerBookingListItem,
} from "@/schemas/adminBooking"
import { ArrowLeft } from "lucide-vue-next"
import { computed, onMounted, ref } from "vue"

type BookingRow = {
  bookingId: string
  /** ISO instant from API; used to keep “latest update first” if client re-sorts. */
  updatedAtIso: string
  customer: string
  guests: string
  room: string
  amount: string
  subtotal: string
  discount: string
  total: string
  bed: string
  checkIn: string
  checkOut: string
  stayTotal: string
  bookingDate: string
}

const rows = ref<BookingRow[]>([])
const isLoadingRows = ref(false)
const listError = ref("")

const selected = ref<BookingRow | null>(null)
const isDetailView = computed(() => selected.value !== null)
const searchCustomer = ref("")

const filteredRows = computed(() => {
  const keyword = searchCustomer.value.trim().toLowerCase()
  const list = rows.value
  if (!keyword) return list
  return list.filter((row) =>
    [
      row.customer,
      row.guests,
      row.room,
      row.amount,
      row.subtotal,
      row.discount,
      row.total,
      row.bed,
      row.checkIn,
      row.checkOut,
    ].some((x) => x.toLowerCase().includes(keyword)),
  )
})

const { currentPage, totalPages, totalItems, pagedItems, setPage } = usePagedList(filteredRows, [
  searchCustomer,
])

const emptyTableMessage = computed(() => {
  if (rows.value.length > 0 && searchCustomer.value.trim()) return "No customer found."
  return "No bookings yet."
})

function formatLocalDateDisplay(isoDate: string): string {
  const parts = isoDate.split("-").map((p) => Number(p))
  const y = parts[0]
  const m = parts[1]
  const d = parts[2]
  if (y === undefined || m === undefined || d === undefined || Number.isNaN(y + m + d)) return isoDate
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
}

function formatInstantDateOnly(iso: string): string {
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return iso
  return dt.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  })
}

function formatThb(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "—"
  return `THB ${Number(value).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function mapListItem(d: AdminCustomerBookingListItem): BookingRow {
  const guestNumbers = d.guestNumbers?.trim() ? d.guestNumbers : "-"
  const roomTypeName = d.roomTypeName?.trim() ? d.roomTypeName : "-"
  const amountLabel = d.amountLabel?.trim() ? d.amountLabel : "-"
  const bedType = d.bedType?.trim() ? d.bedType : "-"
  const checkIn = d.checkInDate ? formatLocalDateDisplay(d.checkInDate) : "-"
  const checkOut = d.checkOutDate ? formatLocalDateDisplay(d.checkOutDate) : "-"
  const stayTotal = d.stayTotalLabel?.trim() ? d.stayTotalLabel : "-"
  const bookingCreated = d.bookingCreatedAt?.trim() ? d.bookingCreatedAt : ""
  const updatedAt = d.updatedAt?.trim() ? d.updatedAt : "1970-01-01T00:00:00.000Z"

  return {
    bookingId: d.bookingId,
    updatedAtIso: updatedAt,
    customer: d.customerName,
    guests: guestNumbers,
    room: roomTypeName,
    amount: amountLabel,
    subtotal: formatThb(d.subtotal),
    discount: formatThb(d.discountAmount),
    total: formatThb(d.totalAmount),
    bed: bedType,
    checkIn,
    checkOut,
    stayTotal,
    bookingDate: bookingCreated ? formatInstantDateOnly(bookingCreated) : "-",
  }
}

function extractListError(error: unknown, fallback: string): string {
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
  if (status === 403) return "You do not have permission. Please sign in with an admin account."
  if (status === 404) return "Booking list was not found. Is the backend running the latest version?"
  if (status && status >= 500) return "Server error while loading bookings. Please try again later."
  return fallback
}

async function loadBookings() {
  isLoadingRows.value = true
  listError.value = ""
  try {
    const { data } = await api.get<unknown>("/api/v1/admin/bookings")
    if (!Array.isArray(data)) {
      rows.value = []
      listError.value = "Unexpected data format from booking list API."
      return
    }
    const next: BookingRow[] = []
    for (const raw of data) {
      const parsed = adminCustomerBookingListItemSchema.safeParse(raw)
      if (parsed.success) {
        next.push(mapListItem(parsed.data))
      }
    }
    next.sort((a, b) => new Date(b.updatedAtIso).getTime() - new Date(a.updatedAtIso).getTime())
    rows.value = next
    if (data.length > 0 && next.length === 0) {
      listError.value = "Received booking data but could not display rows. Check API response shape."
    }
  } catch (error) {
    rows.value = []
    listError.value = extractListError(error, "Unable to load bookings.")
  } finally {
    isLoadingRows.value = false
  }
}

function openDetail(row: BookingRow) {
  selected.value = row
}

function backToList() {
  selected.value = null
}

const detail = computed(() => {
  const row = selected.value
  if (!row) return null

  return {
    ...row,
    paymentSuccessVia: "Payment success via",
    creditCard: "Credit Card —",
    packageItems: [
      { label: "Subtotal", value: row.subtotal },
      { label: "Discount", value: row.discount },
    ],
    total: row.total,
    additionalLabel: "Additional Request",
    additionalText: "—",
  }
})

onMounted(() => {
  void loadBookings()
})
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-[#F6F7FC]">
    <template v-if="!isDetailView">
      <AdminPageHeader
        title="Customer Booking"
        :search-value="searchCustomer"
        search-placeholder="Search customer name"
        @update:search-value="searchCustomer = $event"
      />

      <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
        <p v-if="listError" class="mb-3 font-[Inter] text-[14px] leading-[21px] text-red-700">{{ listError }}</p>
        <p v-else-if="isLoadingRows" class="mb-3 font-[Inter] text-[14px] leading-[21px] text-[#646D89]">
          Loading bookings...
        </p>
        <article class="overflow-x-auto rounded-[4px] border border-transparent bg-transparent">
          <table class="w-full min-w-[1320px] table-fixed border-collapse">
            <thead>
              <tr class="bg-[#E4E6ED]">
                <th class="body-2 w-[160px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Customer name
                </th>
                <th class="body-2 w-[80px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Guest(s)
                </th>
                <th class="body-2 w-[180px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Room type
                </th>
                <th class="body-2 w-[80px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Rooms
                </th>
                <th class="body-2 w-[120px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Subtotal
                </th>
                <th class="body-2 w-[120px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Discount
                </th>
                <th class="body-2 w-[120px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Total
                </th>
                <th class="body-2 w-[140px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Bed Type
                </th>
                <th class="body-2 w-[140px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Check-in
                </th>
                <th class="body-2 w-[140px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Check-out
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="row in pagedItems"
                :key="row.bookingId"
                class="cursor-pointer border-b border-[#E4E6ED] bg-white transition-colors hover:bg-[#F6F7FC]"
                @click="openDetail(row)"
              >
                <td class="body-1 px-4 py-6 text-black">{{ row.customer }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.guests }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.room }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.amount }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.subtotal }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.discount }}</td>
                <td class="body-1 px-4 py-6 font-semibold text-black">{{ row.total }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.bed }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.checkIn }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.checkOut }}</td>
              </tr>
              <tr v-if="!isLoadingRows && !listError && filteredRows.length === 0" class="border-b border-[#E4E6ED] bg-white">
                <td class="body-1 px-4 py-8 text-[#9AA1B9]" colspan="10">{{ emptyTableMessage }}</td>
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
    </template>

    <template v-else>
      <header
        class="box-border flex min-h-20 w-full shrink-0 flex-wrap items-center gap-3 border-b border-[#E4E6ED] bg-white px-4 py-4 sm:gap-4 sm:px-8 sm:py-0 lg:px-[60px] min-[1441px]:h-20 min-[1441px]:flex-nowrap"
      >
        <button
          type="button"
          class="flex size-10 items-center justify-center rounded-[4px] hover:bg-[#F6F7FC]"
          aria-label="Back"
          @click="backToList"
        >
          <ArrowLeft class="size-6 text-[#9AA1B9]" :stroke-width="2" aria-hidden="true" />
        </button>

        <p class="min-w-0 flex-none truncate font-[Inter] text-[18px] leading-[28px] font-semibold tracking-[-0.02em] text-[#2A2E3F] sm:text-[20px] sm:leading-[30px]">
          {{ detail?.customer }}
        </p>
        <p class="min-w-0 basis-full truncate font-[Inter] text-[18px] leading-[28px] font-normal tracking-[-0.02em] text-[#2A2E3F] sm:basis-auto sm:flex-1 sm:text-[20px] sm:leading-[30px]">
          {{ detail?.room }}
        </p>
      </header>

      <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16">
        <article class="mx-auto w-full max-w-[1080px] rounded-[4px] border border-transparent bg-white p-5 sm:p-8 min-[1441px]:mx-0 min-[1441px]:max-w-none">
          <section class="flex flex-col gap-[40px]">
            <section class="flex flex-col gap-[20px] min-[1441px]:grid min-[1441px]:grid-cols-3 min-[1441px]:gap-5">
              <section v-for="(field, idx) in [
                { label: 'Customer name', value: detail?.customer ?? '' },
                { label: 'Guest(s)', value: detail?.guests ?? '' },
                { label: 'Room type', value: detail?.room ?? '' },
                { label: 'Rooms', value: detail?.amount ?? '' },
                { label: 'Bed type', value: detail?.bed ?? '' },
                { label: 'Check-in', value: detail?.checkIn ?? '' },
                { label: 'Check-out', value: detail?.checkOut ?? '' },
                { label: 'Stay (total)', value: detail?.stayTotal ?? '' },
                { label: 'Booking date', value: detail?.bookingDate ?? '' },
              ]" :key="idx" class="flex flex-col gap-[4px]">
                <p class="font-[Inter] text-[16px] leading-[24px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
                  {{ field.label }}
                </p>
                <p class="font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#2A2E3F]">
                  {{ field.value }}
                </p>
              </section>
            </section>

            <section class="rounded-[4px] bg-[#F6F7FC] px-6 py-6">
              <div class="flex w-full flex-col gap-2 pb-6 sm:flex-row sm:justify-end sm:gap-8">
                <p class="font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#9AA1B9]">
                  {{ detail?.paymentSuccessVia }}
                </p>
                <p class="font-[Inter] text-[16px] leading-[24px] font-semibold tracking-[-0.02em] text-[#9AA1B9]">
                  {{ detail?.creditCard }}
                </p>
              </div>

              <div class="flex flex-col gap-[16px] border-t border-[#E4E6ED] pt-6">
                <div
                  v-for="(item, idx) in detail?.packageItems ?? []"
                  :key="idx"
                  class="flex items-baseline justify-between"
                >
                  <p class="font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#2A2E3F]">
                    {{ item.label }}
                  </p>
                  <p class="font-[Inter] text-[16px] leading-[24px] font-semibold tracking-[-0.02em] text-[#2A2E3F]">
                    {{ item.value }}
                  </p>
                </div>

                <div class="flex items-baseline justify-between gap-4 border-t border-[#E4E6ED] pt-4">
                  <p class="font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#2A2E3F]">
                    Total
                  </p>
                  <p class="font-[Inter] text-[20px] leading-[30px] font-semibold tracking-[-0.02em] text-[#2A2E3F]">
                    {{ detail?.total }}
                  </p>
                </div>
              </div>
            </section>

            <section class="rounded-[4px] bg-[#E4E6ED] px-6 py-6">
              <p class="font-[Inter] text-[16px] leading-[24px] font-semibold tracking-[-0.02em] text-[#646D89]">
                {{ detail?.additionalLabel }}
              </p>
              <p class="mt-3 font-[Inter] text-[16px] leading-[24px] font-normal tracking-[-0.02em] text-[#646D89]">
                {{ detail?.additionalText }}
              </p>
            </section>
          </section>
        </article>
      </main>
    </template>
  </section>
</template>
