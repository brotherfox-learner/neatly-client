<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import PromoDayPicker from '@/components/admin/PromoDayPicker.vue'
import Button from '@/components/ui/button/Button.vue'
import { createPromotion } from '@/api/promotion'
import { promotionFormSchema } from '@/schemas/promotionForm'

const router = useRouter()

// form state
const code = ref('')
const discountType = ref<'FIXED' | 'PERCENTAGE'>('FIXED')
const fixedValue = ref<number | null>(null)
const percentValue = ref<number | null>(null)
const maxDiscount = ref<number | null>(null)
const minSpend = ref<number | null>(null)
const usageLimit = ref<number | null>(null)
const validFrom = ref<Date | null>(null)
const validTo = ref<Date | null>(null)

const isLoading = ref(false)
const errors = ref<Record<string, string>>({})

// บังคับ uppercase ตอนพิมพ์
function onCodeInput(e: Event) {
  const input = e.target as HTMLInputElement
  code.value = input.value.toUpperCase()
}

watch(discountType, () => {
  fixedValue.value = null
  percentValue.value = null
})

function formatDate(date: Date | null): string {
  if (!date) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function onFixedInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  fixedValue.value = isNaN(val) ? null : val
}

function onPercentInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  percentValue.value = isNaN(val) ? null : val
}

function onMaxDiscountInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  maxDiscount.value = isNaN(val) ? null : val
}

function onMinSpendInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  minSpend.value = isNaN(val) ? null : val
}

function onUsageLimitInput(e: Event) {
  const val = parseFloat((e.target as HTMLInputElement).value)
  usageLimit.value = isNaN(val) ? null : val
}

async function handleSubmit() {
  errors.value = {}

  const result = promotionFormSchema.safeParse({
    code: code.value,
    discountType: discountType.value,
    discountValue: discountType.value === 'FIXED' ? fixedValue.value : percentValue.value,
    maxDiscount: maxDiscount.value,
    minSpend: minSpend.value,
    usageLimit: usageLimit.value,
    startDate: formatDate(validFrom.value),
    endDate: formatDate(validTo.value),
  })

  if (!result.success) {
    const fieldErrors: Record<string, string> = {}
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as string
      if (!fieldErrors[field]) fieldErrors[field] = issue.message
    })
    errors.value = fieldErrors
    console.log('errors:', errors.value)
    return
  }

  try {
    isLoading.value = true
    await createPromotion(result.data)
    router.push('/admin/promocode')
  } catch (err: unknown) {
    const e = err as { response?: { data?: { message?: string } } }
    errors.value.general = e.response?.data?.message ?? 'Something went wrong'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div>
    <header
      class="box-border flex h-20 w-full flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-[#2A2E3F]">Promocode Management</h1>
    </header>

    <div class="min-h-[calc(100vh-5rem)] p-10">
      <section class="bg-white rounded-sm border border-gray-300 px-[100px] pt-[40px] pb-[60px]">
        <form class="flex flex-col gap-10" @submit.prevent="handleSubmit">
          <!-- General Error -->
          <p v-if="errors.general" class="text-red-600 text-body-1 text-center">
            {{ errors.general }}
          </p>

          <!-- Row 1 -->
          <div class="grid grid-cols-2 gap-10">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900"
                >Set promo code <span class="text-[#C82A2A]">*</span></label
              >
              <input
                :value="code"
                @input="onCodeInput"
                type="text"
                placeholder="Enter promo code"
                class="p-3 border rounded-sm text-black"
                :class="errors.code ? 'border-red-500' : 'border-gray-400'"
              />
              <p v-if="errors.code" class="text-red-500 text-body-1">{{ errors.code }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">Minimum purchase amount (THB)</label>
              <input
                :value="minSpend"
                @input="onMinSpendInput"
                type="number"
                placeholder="0"
                class="p-3 border border-gray-400 text-black rounded-sm"
              />
              <p v-if="errors.minSpend" class="text-red-500 text-body-1">{{ errors.minSpend }}</p>
            </div>
          </div>

          <!-- Row 2 -->
          <div class="flex flex-col gap-2">
            <label class="body-1 text-gray-900"
              >Select discount type <span class="text-[#C82A2A]">*</span></label
            >
            <div class="flex flex-row gap-10">
              <div class="flex items-center gap-2">
                <input
                  type="radio"
                  v-model="discountType"
                  value="FIXED"
                  name="discountType"
                  class="cursor-pointer"
                />
                <label class="body-1 text-gray-900">Fixed amount (THB)</label>
                <div class="flex flex-col gap-1">
                  <input
                    :value="fixedValue"
                    @input="onFixedInput"
                    type="number"
                    placeholder="THB"
                    :disabled="discountType !== 'FIXED'"
                    class="p-2 border rounded-sm text-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    :class="
                      errors.discountValue && discountType === 'FIXED'
                        ? 'border-red-500'
                        : 'border-gray-400'
                    "
                  />
                </div>
              </div>
              <div class="flex items-center gap-2">
                <input
                  type="radio"
                  v-model="discountType"
                  value="PERCENTAGE"
                  name="discountType"
                  class="cursor-pointer"
                />
                <label class="body-1 text-gray-900">Percent ( % )</label>
                <div class="flex flex-col gap-1">
                  <input
                    :value="percentValue"
                    @input="onPercentInput"
                    type="number"
                    placeholder="0"
                    :disabled="discountType !== 'PERCENTAGE'"
                    class="p-2 border rounded-sm text-black disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
                    :class="
                      errors.discountValue && discountType === 'PERCENTAGE'
                        ? 'border-red-500'
                        : 'border-gray-400'
                    "
                  />
                </div>
              </div>
            </div>
            <p v-if="errors.discountValue" class="text-red-500 text-body-1">
              {{ errors.discountValue }}
            </p>
          </div>

          <!-- Row 3 -->
          <div class="flex flex-col gap-1 shrink-0">
            <label class="body-1 text-gray-900">Maximum discount amount (THB)</label>
            <input
              :value="maxDiscount"
              @input="onMaxDiscountInput"
              type="number"
              placeholder="0"
              class="p-3 border border-gray-400 text-black rounded-sm"
            />
            <p v-if="errors.maxDiscount" class="text-red-500 text-body-1">
              {{ errors.maxDiscount }}
            </p>
          </div>

          <!-- Row 4 -->
          <div class="grid grid-cols-2 gap-10">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900"
                >Valid From <span class="text-[#C82A2A]">*</span></label
              >
              <PromoDayPicker v-model="validFrom" placeholder="Valid From" />
              <p v-if="errors.startDate" class="text-red-500 text-body-1">{{ errors.startDate }}</p>
            </div>
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900"
                >Valid To <span class="text-[#C82A2A]">*</span></label
              >
              <PromoDayPicker
                v-model="validTo"
                placeholder="Valid To"
                :disable-before-date="validFrom ?? undefined"
              />
              <p v-if="errors.endDate" class="text-red-500 text-body-1">{{ errors.endDate }}</p>
            </div>
          </div>

          <!-- Row 5 -->
          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900">Usage Limit (leave empty for unlimited)</label>
            <input
              :value="usageLimit"
              @input="onUsageLimitInput"
              type="number"
              placeholder="Unlimited"
              class="p-3 border border-gray-400 text-black rounded-sm self-start"
            />
            <p v-if="errors.usageLimit" class="text-red-500 text-body-1">{{ errors.usageLimit }}</p>
          </div>

          <Button type="submit" variant="primary" class="self-end" :disabled="isLoading">
            {{ isLoading ? 'Saving...' : 'Save' }}
          </Button>
        </form>
      </section>
    </div>
  </div>
</template>
