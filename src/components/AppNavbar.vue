<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>

<template>
  <header class="border-border bg-white border-b">
    <section class="mx-auto flex h-12 max-w-7xl items-center justify-between px-4 md:hidden">
      <RouterLink to="/" class="flex items-center" aria-label="Go to home">
        <img src="/logo.svg" alt="Neatly logo" class="h-6 w-auto" />
      </RouterLink>

      <nav class="flex items-center gap-4" aria-label="Mobile actions">
        <button
          type="button"
          class="text-gray-700 transition-colors hover:text-gray-900"
          aria-label="Notifications"
        >
          <img src="/Frame.svg" alt="Notification icon" class="size-6" />
        </button>
        <button
          type="button"
          class="text-gray-700 transition-colors hover:text-gray-900"
          aria-label="Open menu"
        >
          <img src="/hamburger.svg" alt="Menu icon" class="size-6" />
        </button>
      </nav>
    </section>

    <section class="mx-auto hidden h-25 max-w-7xl items-center justify-between px-10 md:flex">
      <section class="flex items-center gap-12">
        <RouterLink to="/" class="flex items-center" aria-label="Go to home">
          <img src="/logo.svg" alt="Neatly logo" class="h-11 w-auto" />
        </RouterLink>

        <nav class="flex items-center" aria-label="Main navigation">
          <RouterLink class="font-open-sans px-6 py-10 text-sm font-normal text-black transition-colors hover:text-green-700" to="/">
            About Neatly
          </RouterLink>
          <RouterLink
            class="font-open-sans px-6 py-10 text-sm font-normal text-black transition-colors hover:text-green-700"
            to="/about"
          >
            Service &amp; Facilities
          </RouterLink>
          <RouterLink
            class="font-open-sans px-6 py-10 text-sm font-normal text-black transition-colors hover:text-green-700"
            to="/dev/backend"
          >
            Rooms &amp; Suits
          </RouterLink>
        </nav>
      </section>

      <button
        type="button"
        class="font-open-sans text-accent px-6 py-10 text-sm font-semibold transition-colors hover:text-orange-600"
      >
        Log in
      </button>
    </section>
  </header>
</template>
