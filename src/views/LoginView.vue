<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>

<template>
  <article class="bg-white lg:bg-green-700">
    <section
      class="mx-auto w-full max-w-[1440px] lg:grid lg:h-[min(924px,calc(100dvh-100px))] lg:min-h-[700px] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-cols-[minmax(0,708px)_minmax(0,732px)]"
    >
      <section class="relative h-[269px] w-full lg:hidden">
        <img src="/loginimage.svg" alt="Hotel exterior with pool" class="h-full w-full object-cover" />
        <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      </section>

      <section class="relative hidden h-full lg:block">
        <img src="/loginimage.svg" alt="Hotel exterior with pool" class="h-full w-full object-cover" />
        <div class="pointer-events-none absolute inset-0 bg-linear-to-b from-transparent to-black/40"></div>
      </section>

      <section class="bg-background flex min-h-[495px] items-end lg:h-full lg:items-start">
        <section
          class="flex w-full flex-col items-start gap-10 px-4 py-10 lg:w-[452px] lg:px-10 lg:pt-[120px] lg:pb-0 xl:ml-[min(120px,8.333333vw)] xl:px-0 xl:pt-[150px]"
        >
          <h1 class="headline-3 lg:headline-2 text-green-800 flex h-[55px] w-full items-center">
            Log In
          </h1>

          <form class="flex w-full flex-col gap-10" @submit.prevent>
            <section class="flex w-full flex-col gap-1">
              <label class="body-1 text-gray-900 flex h-6 w-full items-center" for="login-email">
                Username or Email
              </label>
              <input
                id="login-email"
                type="text"
                placeholder="Enter your username or email"
                class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-12 w-full rounded-[4px] border bg-white px-3 pr-4 outline-none focus:border-gray-500"
              />
            </section>

            <section class="flex w-full flex-col gap-1">
              <label class="body-1 text-gray-900 flex h-6 w-full items-center" for="login-password">
                Password
              </label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                class="body-1 text-gray-900 placeholder:text-gray-600 border-gray-400 h-12 w-full rounded-[4px] border bg-white px-3 pr-4 outline-none focus:border-gray-500"
              />
            </section>

            <section class="flex w-full flex-col gap-4">
              <button
                type="submit"
                class="font-open-sans text-[16px] leading-[16px] font-semibold h-12 w-full rounded-[4px] bg-orange-600 px-8 py-4 text-center text-white transition-colors hover:bg-orange-700"
              >
                Log In
              </button>
              <section class="flex h-6 w-full items-start">
                <p class="body-1 text-gray-700 mr-2 flex items-center">
                  Don&apos;t have an account yet?
                </p>
                <RouterLink
                  to="/register"
                  class="font-open-sans text-[16px] leading-[16px] font-semibold text-orange-500 h-6 px-2 py-1 text-center"
                >
                  Register
                </RouterLink>
              </section>
            </section>
          </form>
        </section>
      </section>
    </section>
  </article>
</template>
