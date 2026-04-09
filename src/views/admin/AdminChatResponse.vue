<script setup lang="ts">
import { RouterLink } from "vue-router"
</script>

<template>
  <section class="flex min-h-0 flex-1 flex-col bg-gray-100">
    <header
      class="box-border flex h-20 w-full shrink-0 items-center gap-4 border-b border-gray-300 bg-white px-4 sm:px-8 lg:px-[60px]"
    >
      <h1 class="headline-5 min-w-0 flex-1 text-gray-900">Chat responses</h1>
    </header>

    <main
      class="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 py-8 sm:px-8 lg:px-[60px] lg:pt-12 lg:pb-16"
    >
      <article class="max-w-2xl rounded border border-gray-300 bg-white p-8">
        <p class="body-1 text-gray-700">
          Greeting, auto-reply, suggestion topics, and search keywords are all configured under
          <RouterLink
            to="/admin/chatbot-setup"
            class="font-semibold text-orange-600 underline-offset-2 hover:underline"
          >
            Chatbot Setup
          </RouterLink>
          .
        </p>
        <p class="body-2 mt-4 text-gray-600">
          This view is reserved for a future “responses-only” admin page (for example, a read-only
          answer list). Add a separate route in the router when you need it.
        </p>
      </article>
    </main>
  </section>
</template>
