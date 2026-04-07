<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { Search, Plus } from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { getPromotions, type PromotionResponse } from '@/api/promotion'
import { togglePromotionActive } from '@/api/promotion'
const router = useRouter()

type PromoStatus = 'Active' | 'Inactive' | 'Expired'

type PromoRow = PromotionResponse

const promos = ref<PromoRow[]>([])
const isLoading = ref(false)
const errorMsg = ref('')
const search = ref('')
const today = new Date().toISOString().split('T')[0]!
const togglingId = ref<string | null>(null)
const dropdownOpenFor = ref<string | null>(null)

async function handleSetActive(promo: PromoRow, isActive: boolean) {
  if (promo.isActive === isActive) {
    dropdownOpenFor.value = null
    return
  }
  try {
    togglingId.value = promo.id
    dropdownOpenFor.value = null
    const updated = await togglePromotionActive(promo.id)
    const idx = promos.value.findIndex((p) => p.id === promo.id)
    if (idx !== -1) promos.value[idx] = updated
  } catch {
    errorMsg.value = 'Failed to update promotion status'
  } finally {
    togglingId.value = null
  }
}

function getStatus(promo: PromoRow): PromoStatus {
  if (!promo.isActive) return 'Inactive'
  if (promo.endDate < today) return 'Expired'
  return 'Active'
}

const STATUS_CHIP: Record<PromoStatus, string> = {
  Active: 'bg-[#E6FFFA] text-[#006753]',
  Inactive: 'bg-gray-200 text-gray-700',
  Expired: 'bg-[#FFE6E6] text-[#A50606]',
}

function formatDiscount(promo: PromoRow): string {
  return promo.discountType === 'PERCENTAGE'
    ? `${promo.discountValue}%`
    : `฿${promo.discountValue.toLocaleString()}`
}

function formatTHB(value: number | null): string {
  if (value === null) return '—'
  return value === 0 ? '—' : `฿${value.toLocaleString()}`
}

function formatUsage(promo: PromoRow): string {
  const limit = promo.usageLimit === null ? '∞' : promo.usageLimit.toLocaleString()
  return `${promo.usedCount.toLocaleString()} / ${limit}`
}

function usagePercent(promo: PromoRow): number {
  if (!promo.usageLimit) return 0
  return Math.min((promo.usedCount / promo.usageLimit) * 100, 100)
}

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return promos.value
  return promos.value.filter((p) => p.code.toLowerCase().includes(q))
})

function onClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.relative')) {
    dropdownOpenFor.value = null
  }
}

onMounted(async () => {
  document.addEventListener('mousedown', onClickOutside)
  try {
    isLoading.value = true
    promos.value = await getPromotions()
  } catch {
    errorMsg.value = 'Failed to load promotions'
  } finally {
    isLoading.value = false
  }
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onClickOutside)
})
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-gray-100">
    <!-- Header -->
    <header
      class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-gray-300 bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-gray-900">Promocode Management</h1>
      <div class="flex items-center gap-4">
        <div
          class="flex w-[300px] items-center gap-2.5 rounded-[4px] border border-gray-400 bg-white px-4 py-3"
        >
          <Search class="size-5 shrink-0 text-gray-700" :stroke-width="1.5" />
          <input
            v-model="search"
            type="search"
            placeholder="Search promo code..."
            class="w-full border-0 bg-transparent p-0 body-1 text-gray-900 outline-none placeholder:text-gray-600"
          />
        </div>
        <button
          type="button"
          class="inline-flex h-12 items-center gap-2 rounded-[4px] bg-orange-600 px-5 font-semibold text-white transition-colors hover:bg-orange-500 active:bg-orange-700"
          @click="router.push('/admin/promocode/create')"
        >
          <Plus class="size-5" />
          <span class="body-1 font-semibold">Create Promo Code</span>
        </button>
      </div>
    </header>

    <!-- Content -->
    <main class="flex min-h-0 flex-1 flex-col px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-10 lg:pb-16">
      <!-- Summary chips -->
      <div class="mb-6 flex gap-3">
        <div
          class="flex items-center gap-2 rounded-[4px] border border-gray-300 bg-white px-4 py-2"
        >
          <span class="size-2 rounded-full bg-[#006753]"></span>
          <span class="body-2 text-gray-800"
            >Active: {{ promos.filter((p) => getStatus(p) === 'Active').length }}</span
          >
        </div>
        <div
          class="flex items-center gap-2 rounded-[4px] border border-gray-300 bg-white px-4 py-2"
        >
          <span class="size-2 rounded-full bg-gray-500"></span>
          <span class="body-2 text-gray-800"
            >Inactive: {{ promos.filter((p) => getStatus(p) === 'Inactive').length }}</span
          >
        </div>
        <div
          class="flex items-center gap-2 rounded-[4px] border border-gray-300 bg-white px-4 py-2"
        >
          <span class="size-2 rounded-full bg-[#A50606]"></span>
          <span class="body-2 text-gray-800"
            >Expired: {{ promos.filter((p) => getStatus(p) === 'Expired').length }}</span
          >
        </div>
      </div>

      <!-- Table -->
      <p v-if="errorMsg" class="mb-4 body-1 text-red-500">{{ errorMsg }}</p>
      <div v-if="isLoading" class="py-20 text-center body-1 text-gray-600">Loading...</div>
      <article v-else class="w-full overflow-x-auto rounded-[4px] shadow-1">
        <table class="w-full min-w-[1100px] table-fixed border-collapse">
          <thead>
            <tr class="bg-gray-300">
              <th class="body-2 w-[160px] px-4 py-3 text-left text-gray-800">Promo Code</th>
              <th class="body-2 w-[110px] px-4 py-3 text-left text-gray-800">Discount</th>
              <th class="body-2 w-[130px] px-4 py-3 text-left text-gray-800">Max Discount</th>
              <th class="body-2 w-[120px] px-4 py-3 text-left text-gray-800">Min Spend</th>
              <th class="body-2 w-[160px] px-4 py-3 text-left text-gray-800">Usage</th>
              <th class="body-2 w-[120px] px-4 py-3 text-left text-gray-800">Valid From</th>
              <th class="body-2 w-[120px] px-4 py-3 text-left text-gray-800">Valid To</th>
              <th class="body-2 w-[110px] px-4 py-3 text-left text-gray-800">Status</th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="promo in filtered"
              :key="promo.id"
              class="border-b border-gray-300 bg-white transition-colors hover:bg-gray-100"
            >
              <!-- Promo Code -->
              <td class="px-4 py-5">
                <span class="body-2 font-semibold text-gray-900">{{ promo.code }}</span>
              </td>

              <!-- Discount -->
              <td class="px-4 py-5">
                <span
                  class="body-2 inline-flex items-center rounded-[4px] px-2 py-0.5"
                  :class="
                    promo.discountType === 'PERCENTAGE'
                      ? 'bg-[#E4ECFF] text-[#084BAF]'
                      : 'bg-orange-100 text-orange-700'
                  "
                >
                  {{ formatDiscount(promo) }}
                </span>
              </td>

              <!-- Max Discount -->
              <td class="body-1 px-4 py-5 text-gray-800">{{ formatTHB(promo.maxDiscount) }}</td>

              <!-- Min Spend -->
              <td class="body-1 px-4 py-5 text-gray-800">{{ formatTHB(promo.minSpend) }}</td>

              <!-- Usage with progress bar -->
              <td class="px-4 py-5">
                <div class="flex flex-col gap-1">
                  <span class="body-2 text-gray-800">{{ formatUsage(promo) }}</span>
                  <div
                    v-if="promo.usageLimit"
                    class="h-1.5 w-full overflow-hidden rounded-full bg-gray-300"
                  >
                    <div
                      class="h-full rounded-full transition-all"
                      :class="
                        usagePercent(promo) >= 100
                          ? 'bg-[#A50606]'
                          : usagePercent(promo) >= 70
                            ? 'bg-orange-500'
                            : 'bg-[#006753]'
                      "
                      :style="{ width: `${usagePercent(promo)}%` }"
                    />
                  </div>
                  <span v-else class="body-3 text-gray-600">Unlimited</span>
                </div>
              </td>

              <!-- Valid From -->
              <td class="body-1 px-4 py-5 text-gray-800">{{ promo.startDate }}</td>

              <!-- Valid To -->
              <td class="body-1 px-4 py-5 text-gray-800">{{ promo.endDate }}</td>

              <!-- Status -->
              <td class="px-4 py-5">
                <div class="relative">
                  <!-- trigger button -->
                  <button
                    type="button"
                    :disabled="togglingId === promo.id || getStatus(promo) === 'Expired'"
                    @click="dropdownOpenFor = dropdownOpenFor === promo.id ? null : promo.id"
                    :class="[
                      STATUS_CHIP[getStatus(promo)],
                      'body-3 inline-flex h-[26px] items-center gap-1.5 rounded-[4px] px-3 transition-opacity',
                      getStatus(promo) !== 'Expired'
                        ? 'cursor-pointer hover:opacity-80'
                        : 'cursor-default',
                      togglingId === promo.id ? 'opacity-50 cursor-not-allowed' : '',
                    ]"
                  >
                    <span>{{ getStatus(promo) }}</span>
                    <svg
                      v-if="getStatus(promo) !== 'Expired'"
                      class="size-3"
                      viewBox="0 0 12 12"
                      fill="currentColor"
                    >
                      <path d="M6 8L1 3h10L6 8z" />
                    </svg>
                  </button>

                  <!-- dropdown -->
                  <div
                    v-if="dropdownOpenFor === promo.id"
                    class="absolute left-0 top-[calc(100%+4px)] z-50 w-[120px] rounded-[4px] border border-gray-300 bg-white shadow-1"
                  >
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left body-3 text-[#006753] hover:bg-[#E6FFFA] transition-colors"
                      @click="handleSetActive(promo, true)"
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      class="w-full px-3 py-2 text-left body-3 text-gray-700 hover:bg-gray-100 transition-colors"
                      @click="handleSetActive(promo, false)"
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </td>
            </tr>

            <tr v-if="filtered.length === 0">
              <td colspan="8" class="py-20 text-center body-1 text-gray-600">
                No promo codes found
              </td>
            </tr>
          </tbody>
        </table>
      </article>
    </main>
  </section>

  <Teleport to="body">
    <div v-if="togglingId" class="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div class="flex flex-col items-center gap-6 rounded-[4px] bg-gray-900 px-15 py-8 shadow-1">
        <div class="promo-loader"></div>
        <span class="body-1 text-white">Updating...</span>
      </div>
    </div>
  </Teleport>
</template>
