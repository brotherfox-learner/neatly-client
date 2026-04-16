<script setup lang="ts">
import AdminPageHeader from "@/components/admin/AdminPageHeader.vue"
import { ArrowLeft } from "lucide-vue-next"
import { computed, ref } from "vue"

type BookingRow = {
  customer: string
  guests: string
  room: string
  amount: string
  bed: string
  checkIn: string
  checkOut: string
  stayTotal: string
  bookingDate: string
}

const rows: BookingRow[] = Array.from({ length: 10 }, (_, i) => {
  const roomTypes = ["Superior Garden View", "Premier Sea View", "Deluxe", "Superior"] as const
  const bedTypes = ["Single bed", "Double bed"] as const
  const customers = ["Kate Cho", "John Doe", "Ava Johnson", "Michael Lee"] as const

  const room = roomTypes[i % roomTypes.length] ?? roomTypes[0]!
  const bed = bedTypes[i % bedTypes.length] ?? bedTypes[0]!
  const customer = customers[i % customers.length] ?? customers[0]!

  return {
    customer,
    guests: i % 3 === 0 ? "2" : "1",
    room,
    amount: "1 room",
    bed,
    checkIn: "Th, 19 Oct 2022",
    checkOut: "Fri, 20 Oct 2022",
    stayTotal: i % 2 === 0 ? "1 night" : "2 nights",
    bookingDate: "Tue, 16 Oct 2022",
  }
})

const selected = ref<BookingRow | null>(null)
const isDetailView = computed(() => selected.value !== null)
const searchCustomer = ref("")
const filteredRows = computed(() => {
  const keyword = searchCustomer.value.trim().toLowerCase()
  if (!keyword) return rows
  return rows.filter((row) => row.customer.toLowerCase().includes(keyword))
})

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
    creditCard: "Credit Card - *888",
    packageItems: [
      { label: `${row.room} Room`, value: "2,500.00" },
      { label: "Airport tranfer", value: "200.00" },
      { label: "Promotion Code", value: "-400.00" },
    ],
    total: "THB 2,300.00",
    additionalLabel: "Additional Request",
    additionalText: "Can i have some chocolate?",
  }
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
        <article class="overflow-x-auto rounded-[4px] border border-transparent bg-transparent">
          <table class="w-full min-w-[1080px] table-fixed border-collapse">
            <thead>
              <tr class="bg-[#E4E6ED]">
                <th class="body-2 w-[180px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Customer name
                </th>
                <th class="body-2 w-[96px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Guest(s)
                </th>
                <th class="body-2 w-[200px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Room type
                </th>
                <th class="body-2 w-[86px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Amount
                </th>
                <th class="body-2 w-[167px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Bed Type
                </th>
                <th class="body-2 w-[165px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Check-in
                </th>
                <th class="body-2 w-[186px] px-4 py-2.5 text-left font-medium tracking-[-0.02em] text-[#424C6B]" scope="col">
                  Check-out
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(row, index) in filteredRows"
                :key="index"
                class="cursor-pointer border-b border-[#E4E6ED] bg-white transition-colors hover:bg-[#F6F7FC]"
                @click="openDetail(row)"
              >
                <td class="body-1 px-4 py-6 text-black">{{ row.customer }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.guests }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.room }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.amount }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.bed }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.checkIn }}</td>
                <td class="body-1 px-4 py-6 text-black">{{ row.checkOut }}</td>
              </tr>
              <tr v-if="filteredRows.length === 0" class="border-b border-[#E4E6ED] bg-white">
                <td class="body-1 px-4 py-8 text-[#9AA1B9]" colspan="7">No customer found.</td>
              </tr>
            </tbody>
          </table>
        </article>

        <nav class="mt-10 flex w-full items-center justify-center gap-2" aria-label="Pagination">
          <button type="button" class="flex size-8 items-center justify-center rounded-[4px] opacity-50" aria-label="Previous page">
            <span class="text-[#D6D9E4]" aria-hidden="true">‹</span>
          </button>
          <button type="button" class="font-open-sans size-8 rounded-[4px] border border-[#D5DFDA] bg-white text-center text-base font-semibold leading-4 text-[#5D7B6A]" aria-current="page">
            1
          </button>
          <button v-for="n in [2, 3, 4, 5]" :key="n" type="button" class="font-open-sans size-8 rounded-[4px] text-center text-base font-semibold leading-4 text-[#C8CCDB]">
            {{ n }}
          </button>
          <button type="button" class="flex size-8 items-center justify-center rounded-[4px]" aria-label="Next page">
            <span class="text-[#9AA1B9]" aria-hidden="true">›</span>
          </button>
        </nav>
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
                { label: 'Amount', value: detail?.amount ?? '' },
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
