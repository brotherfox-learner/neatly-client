<script setup lang="ts">
import { ref } from 'vue'
import {
  Banknote,
  CreditCard,
  Smartphone,
  Briefcase,
  Building2,
  Package,
  LogOut,
} from 'lucide-vue-next'
import {
  BaseInput,
  BaseDropdown,
  BaseDatePicker,
  DateRangePicker,
  RoomsGuestsInput,
  PhotoUpload,
  PaymentOptionCard,
  BaseCheckbox,
  StepIndicator,
  MenuLinkItem,
} from '@/components/ui'

// --- Input state ---
const textValue = ref('')
const errorValue = ref('hello@')
const disabledValue = ref('Cannot edit this')
const dropdownValue = ref('')
const dropdownOptions = ['Deluxe Room', 'Superior Room', 'Standard Room', 'Suite']
const singleDate = ref('')
const checkIn = ref('2024-12-25')
const checkOut = ref('2024-12-26')
const rooms = ref(1)
const guests = ref(2)
const photoFile = ref<File | null>(null)

// --- Select state ---
const selectedPayment = ref('')
const checkA = ref(false)
const checkB = ref(true)
const checkDisabled = ref(false)
</script>

<template>
  <div class="min-h-screen bg-gray-100 py-10 px-6">
    <div class="max-w-5xl mx-auto space-y-16">

      <header>
        <h1 class="headline-1 text-gray-900">UI Components Preview</h1>
        <p class="body-1 text-gray-600 mt-1">
          Dev-only page — <code class="text-orange-500">/dev/preview</code>
        </p>
      </header>

      <!-- ───────────────────────────────────── INPUT COMPONENTS ── -->
      <section class="space-y-8">
        <h2 class="headline-3 text-gray-900 border-b border-gray-300 pb-2">Input Components</h2>

        <!-- BaseInput -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">BaseInput</h3>
          <div class="flex flex-wrap gap-6 items-start">
            <BaseInput
              v-model="textValue"
              label="Normal"
              placeholder="Enter value"
            />
            <BaseInput
              v-model="textValue"
              label="Success (filled)"
              placeholder="Enter value"
              status="success"
            />
            <BaseInput
              v-model="errorValue"
              label="Error"
              placeholder="Enter email"
              status="error"
              supporting-text="Invalid email format"
            />
            <BaseInput
              v-model="disabledValue"
              label="Disabled"
              status="disabled"
            />
          </div>
        </div>

        <!-- BaseDropdown -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">BaseDropdown</h3>
          <div class="flex flex-wrap gap-6 items-start">
            <BaseDropdown
              v-model="dropdownValue"
              label="Room Type"
              placeholder="Select room type"
              :options="dropdownOptions"
              class="w-[280px]"
            />
            <BaseDropdown
              v-model="dropdownValue"
              label="Disabled"
              :options="dropdownOptions"
              :disabled="true"
              class="w-[280px]"
            />
          </div>
        </div>

        <!-- BaseDatePicker -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">BaseDatePicker</h3>
          <div class="flex flex-wrap gap-6 items-start">
            <BaseDatePicker
              v-model="singleDate"
              label="Date of Birth"
              placeholder="Select a date"
              class="w-[280px]"
            />
          </div>
          <p v-if="singleDate" class="body-2 text-gray-600">Selected: {{ singleDate }}</p>
        </div>

        <!-- DateRangePicker -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">DateRangePicker</h3>
          <DateRangePicker
            v-model:check-in="checkIn"
            v-model:check-out="checkOut"
          />
          <p class="body-2 text-gray-600">Check In: {{ checkIn }} · Check Out: {{ checkOut }}</p>
        </div>

        <!-- RoomsGuestsInput -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">RoomsGuestsInput</h3>
          <RoomsGuestsInput
            v-model:rooms="rooms"
            v-model:guests="guests"
            class="w-[280px]"
          />
          <p class="body-2 text-gray-600">Rooms: {{ rooms }} · Guests: {{ guests }}</p>
        </div>

        <!-- PhotoUpload -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">PhotoUpload</h3>
          <div class="flex gap-6 items-start">
            <div>
              <p class="body-2 text-gray-600 mb-2">Empty state</p>
              <PhotoUpload v-model="photoFile" />
            </div>
          </div>
          <p v-if="photoFile" class="body-2 text-gray-600">File: {{ photoFile.name }}</p>
        </div>
      </section>

      <!-- ───────────────────────────────────── SELECT COMPONENTS ── -->
      <section class="space-y-8">
        <h2 class="headline-3 text-gray-900 border-b border-gray-300 pb-2">Select Components</h2>

        <!-- PaymentOptionCard -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">PaymentOptionCard</h3>
          <div class="flex flex-wrap gap-4 items-center">
            <PaymentOptionCard v-model="selectedPayment" value="cash" label="Cash">
              <template #icon>
                <Banknote :size="28" />
              </template>
            </PaymentOptionCard>
            <PaymentOptionCard v-model="selectedPayment" value="credit-card" label="Credit Card">
              <template #icon>
                <CreditCard :size="28" />
              </template>
            </PaymentOptionCard>
            <PaymentOptionCard v-model="selectedPayment" value="promptpay" label="PromptPay">
              <template #icon>
                <Smartphone :size="28" />
              </template>
            </PaymentOptionCard>
          </div>
          <p class="body-2 text-gray-600">Selected: {{ selectedPayment || '(none)' }}</p>
        </div>

        <!-- BaseCheckbox -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">BaseCheckbox</h3>
          <div class="flex flex-col gap-4">
            <BaseCheckbox v-model="checkA" label="Default (unchecked)" />
            <BaseCheckbox v-model="checkB" label="Checked" />
            <BaseCheckbox v-model="checkDisabled" label="Disabled" :disabled="true" />
            <BaseCheckbox :model-value="true" label="Disabled (checked)" :disabled="true" />
          </div>
        </div>

        <!-- StepIndicator -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">StepIndicator</h3>
          <div class="flex flex-col gap-4">
            <StepIndicator :step="1" label="Basic Information" status="finish" />
            <StepIndicator :step="2" label="Payment Method" status="current" />
            <StepIndicator :step="3" label="Confirm Booking" status="none" />
          </div>
        </div>

        <!-- MenuLinkItem -->
        <div class="space-y-3">
          <h3 class="headline-5 text-gray-800">MenuLinkItem</h3>
          <div class="w-[240px] flex flex-col bg-green-800 rounded overflow-hidden">
            <MenuLinkItem label="Customer Booking" :active="false">
              <template #icon><Briefcase :size="24" :stroke-width="1.5" /></template>
            </MenuLinkItem>
            <MenuLinkItem label="Room Management" :active="true">
              <template #icon><Building2 :size="24" :stroke-width="1.5" /></template>
            </MenuLinkItem>
            <MenuLinkItem label="Room & Property" :active="false">
              <template #icon><Package :size="24" :stroke-width="1.5" /></template>
            </MenuLinkItem>
            <MenuLinkItem label="Log Out">
              <template #icon><LogOut :size="24" /></template>
            </MenuLinkItem>
          </div>
        </div>
      </section>

    </div>
  </div>
</template>
