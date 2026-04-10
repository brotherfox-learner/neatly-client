<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useChatStore, type PaymentOption } from '@/stores/chat'

const props = defineProps<{
  option: PaymentOption
}>()

const store = useChatStore()
const router = useRouter()
const route = useRoute()

const isWaitingOrLive = computed(() => store.mode === 'waiting_agent' || store.mode === 'live_chat')
const isDisabled = computed(() => isWaitingOrLive.value)

const label = computed(() => {
  if (isWaitingOrLive.value) return 'Connecting… / In conversation'
  if (!store.isLoggedInForChat) return 'Log in to contact us'
  return props.option.label
})

function onClick() {
  if (isWaitingOrLive.value) return
  if (!store.isLoggedInForChat) {
    if (store.isOpen) store.toggleChat()
    router.push({ name: 'login', query: { redirect: route.fullPath } })
    return
  }
  store.handleOptionClick(props.option)
}
</script>

<template>
  <div class="contact-admin-wrap">
    <button type="button" class="contact-btn" @click="onClick" :disabled="isDisabled">
      <span class="contact-icon" aria-hidden="true">
        <svg class="contact-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
          <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
        </svg>
      </span>
      <span class="contact-label">{{ label }}</span>
    </button>
  </div>
</template>

<style scoped>
.contact-admin-wrap {
  display: flex;
  justify-content: center;
  margin: 4px 0 12px;
}

.contact-btn {
  background: #c04e1d;
  border: none;
  border-radius: 20px;
  padding: 10px 22px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 2px 10px rgba(192, 78, 29, 0.35);
  cursor: pointer;
  transition:
    transform 0.2s,
    box-shadow 0.2s,
    background 0.2s;
}

.contact-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgba(192, 78, 29, 0.45);
  background: #a84319;
}

.contact-btn:disabled {
  opacity: 0.85;
  cursor: default;
  background: #64748b;
  box-shadow: none;
}

.contact-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
}

.contact-svg {
  width: 20px;
  height: 20px;
}

.contact-label {
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
