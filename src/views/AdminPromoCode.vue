<template>
  <div>
    <!-- Header -->
    <header
      class="box-border flex h-20 w-full shrink-0 flex-row items-center gap-4 border-b border-[#E4E6ED] bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-[#2A2E3F]">Promocode Management</h1>
    </header>

    <div class="min-h-[calc(100vh-5rem)] p-10">
      <section
        class="bg-white rounded-sm border border-gray-300 px-[80px] pt-[40px] pb-[60px] mb-8"
      >
        <form class="flex flex-col gap-10">
          <!-- Row 1 -->
          <div class="grid grid-cols-2 gap-10">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">
                Set promo code <span class="text-[#C82A2A]">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter promo code"
                class="p-3 border border-gray-400 text-black rounded-sm"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900"> Minimum purchase amount (THB) </label>
              <input
                type="number"
                placeholder="0"
                class="p-3 border border-gray-400 text-black rounded-sm"
              />
            </div>
          </div>

          <!-- Row 2 -->
          <div class="flex flex-col gap-2">
            <label class="body-1 text-gray-900">
              Select discount type <span class="text-[#C82A2A]">*</span>
            </label>

            <div class="flex gap-10">
              <div class="flex items-center gap-2">
                <input type="radio" name="discountType" />
                <label class="body-1 text-gray-900">Fixed amount (THB)</label>
                <input
                  type="number"
                  placeholder="THB"
                  class="p-3 border border-gray-400 text-black rounded-sm"
                />
              </div>

              <div class="flex items-center gap-2">
                <input type="radio" name="discountType" />
                <label class="body-1 text-gray-900">Percent (%)</label>
                <input
                  type="number"
                  placeholder="0"
                  class="p-3 border border-gray-400 text-black rounded-sm"
                />
              </div>
            </div>
          </div>

          <!-- Row 4 -->
          <div class="grid grid-cols-2 gap-10">
            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">
                Valid From <span class="text-[#C82A2A]">*</span>
              </label>
              <input
                type="date"
                class="h-12 text-[15px] bg-white w-full ring-1 ring-slate-300 rounded-md px-3"
              />
            </div>

            <div class="flex flex-col gap-1">
              <label class="body-1 text-gray-900">
                Valid To <span class="text-[#C82A2A]">*</span>
              </label>
              <input
                type="date"
                class="h-12 text-[15px] bg-white w-full ring-1 ring-slate-300 rounded-md px-3"
              />
            </div>
          </div>

          <!-- Row 5 -->
          <div class="flex flex-col gap-1">
            <label class="body-1 text-gray-900"> Usage Limit (leave empty for unlimited) </label>
            <input
              type="number"
              placeholder="Unlimited"
              class="p-3 border border-gray-400 text-black rounded-sm self-start"
            />
          </div>
        </form>
      </section>
    </div>
  </div>
</template>

<script setup>
// ไม่มี logic ตามที่ขอ
</script>
