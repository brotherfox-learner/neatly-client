<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useChatStore } from '@/stores/chat'
import { useChatWebSocket } from '@/composables/useChatWebSocket'
import { getSupabase } from '@/lib/supabase'
import ChatWindow from './ChatWindow.vue'

const route = useRoute()
const store = useChatStore()
useChatWebSocket()

let unsubscribeAuth: (() => void) | undefined

onMounted(() => {
  void store.tryRestoreFromBrowserSession()
  void store.refreshChatAuthSession()
  const sb = getSupabase()
  if (sb) {
    const { data } = sb.auth.onAuthStateChange((event) => {
      void store.refreshChatAuthSession()
      if (event === 'SIGNED_IN') {
        void store.tryRestoreFromBrowserSession()
      }
    })
    unsubscribeAuth = () => data.subscription.unsubscribe()
  }
})

onUnmounted(() => {
  unsubscribeAuth?.()
})

const showWidget = computed(() => {
  // Hide on admin pages
  return !route.meta.hideNavbar
})
</script>

<template>
  <div v-if="showWidget" class="chat-widget">
    <!-- Chat Window -->
    <Transition name="chat-window">
      <ChatWindow v-if="store.isOpen" />
    </Transition>

    <!-- Floating Button -->
    <button
      type="button"
      class="chat-fab"
      :class="{ 'chat-fab--open': store.isOpen }"
      :aria-label="store.isOpen ? 'Close chat' : 'Open chat'"
      @click="store.toggleChat()"
    >
      <!-- Chat icon -->
      <img
        v-if="!store.isOpen"
        src="/LandingPagePic/icon.svg"
        alt=""
        class="chat-fab__icon"
        width="48"
        height="48"
      />
      <!-- Close icon -->
      <svg
        v-else
        class="chat-fab__close"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </button>
  </div>
</template>

<style scoped>
.chat-widget {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 16px;
}

.chat-fab {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: 1px solid rgba(192, 78, 29, 0.35);
  background: white;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
}

.chat-fab:hover {
  box-shadow: 0 6px 28px rgba(0, 0, 0, 0.18);
  transform: scale(1.05);
}

.chat-fab--open {
  background: #5d7b6a;
  border-color: #5d7b6a;
}

.chat-fab__icon {
  width: 48px;
  height: 48px;
}

.chat-fab__close {
  width: 28px;
  height: 28px;
  color: white;
}

/* Chat window transition */
.chat-window-enter-active {
  animation: chat-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.chat-window-leave-active {
  animation: chat-slide-up 0.2s cubic-bezier(0.4, 0, 0.2, 1) reverse;
}

@keyframes chat-slide-up {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
