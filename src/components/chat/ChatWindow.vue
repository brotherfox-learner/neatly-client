<script setup lang="ts">
import { ref, onMounted, nextTick, watch } from 'vue'
import { useChatStore, type ChatMsg, type PaymentOption } from '@/stores/chat'
import ChatBubble from './ChatBubble.vue'
import PresetButtons from './PresetButtons.vue'
import RoomCardSlider from './RoomCardSlider.vue'
import PaymentOptions from './PaymentOptions.vue'
import PaymentMethodPanel from './PaymentMethodPanel.vue'
import PromotionCards from './PromotionCards.vue'
import TypingIndicator from './TypingIndicator.vue'
import ContactAdminButton from './ContactAdminButton.vue'

const store = useChatStore()
const messagesContainer = ref<HTMLElement | null>(null)
const inputMessage = ref('')

const scrollToBottom = async () => {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

watch(
  () => store.messages.length,
  () => {
    scrollToBottom()
  }
)

watch(
  () => store.isTyping,
  () => {
    scrollToBottom()
  }
)

onMounted(() => {
  scrollToBottom()
})

function contactAdminOption(msg: ChatMsg): PaymentOption | null {
  if (msg.type !== 'bot-options' || !msg.options || msg.options.length !== 1) return null
  const opt = msg.options[0]
  return opt?.key === 'contact_admin' ? opt : null
}

const handleSend = () => {
  const text = inputMessage.value.trim()
  if (!text) return

  if (store.mode === 'live_chat' || store.mode === 'waiting_agent') {
    store.sendLiveMessage(text)
  } else {
    store.handleFreeText(text)
  }

  inputMessage.value = ''
}
</script>

<template>
  <div class="chat-window">
    <!-- Header -->
    <header class="chat-header">
      <div class="chat-header-content">
        <span class="chat-header-mark" aria-hidden="true">
          <svg class="chat-header-bubble chat-header-bubble--back" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 10c0-3.314 2.686-6 6-6h6a4 4 0 014 4v6a4 4 0 01-4 4h-2l-4 3v-3H10a6 6 0 01-6-6v-2z"
              fill="#81A08F"
            />
          </svg>
          <svg class="chat-header-bubble chat-header-bubble--front" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 12c0-2.761 2.239-5 5-5h5a3 3 0 013 3v5a3 3 0 01-3 3h-1.5L12 20v-2H11a5 5 0 01-5-5v-1z"
              fill="#cbd5e1"
            />
          </svg>
          <span class="chat-header-plus">+</span>
        </span>
        <h3 class="chat-title">Neatly Assistant</h3>
      </div>
      <div class="chat-header-actions">
        <button
          type="button"
          class="chat-new"
          :disabled="store.isRestoring"
          @click="store.startNewChat()"
        >
          New chat
        </button>
        <button type="button" class="chat-close" @click="store.toggleChat()">
          <span class="sr-only">Close chat</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
    </header>

    <!-- Messages Area -->
    <div ref="messagesContainer" class="chat-messages">
      <div v-for="msg in store.messages" :key="msg.id" class="message-wrapper">
        <template v-if="msg.type === 'preset-buttons'">
          <PresetButtons />
        </template>
        <template v-else-if="msg.type === 'bot-cards'">
          <RoomCardSlider :cards="msg.cards || []" :action="msg.action" />
        </template>
        <template v-else-if="msg.type === 'bot-promotions'">
          <PromotionCards :cards="msg.promotionCards || []" />
        </template>
        <template v-else-if="msg.type === 'bot-payment-panel'">
          <div class="bot-panel-wrap">
            <PaymentMethodPanel :intro="msg.text || ''" :options="msg.options || []" />
          </div>
        </template>
        <template v-else-if="msg.type === 'bot-options'">
          <!-- Special case for contact admin button -->
          <template v-if="contactAdminOption(msg)">
            <ContactAdminButton :option="contactAdminOption(msg)!" />
          </template>
          <template v-else>
            <PaymentOptions :options="msg.options || []" />
          </template>
        </template>
        <template v-else>
          <ChatBubble :message="msg" />
        </template>
      </div>
      
      <div v-if="store.isTyping" class="message-wrapper">
         <TypingIndicator />
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <form @submit.prevent="handleSend" class="chat-input-form relative">
        <input
          v-model="inputMessage"
          type="text"
          class="chat-input"
          placeholder="Write your message..."
        />
        <button
          type="submit"
          class="chat-send-btn"
          :disabled="!inputMessage.trim()"
          aria-label="Send message"
        >
          <svg
            class="chat-send-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.chat-window {
  width: 360px;
  height: 560px;
  max-height: calc(100vh - 120px);
  background: #f0f2f4;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow:
    0 12px 40px rgba(15, 23, 42, 0.12),
    0 0 0 1px rgba(15, 23, 42, 0.06);
}

@media (max-width: 400px) {
  .chat-window {
    width: calc(100vw - 48px);
    height: 500px;
  }
}

.chat-header {
  height: 60px;
  background: #ffffff;
  padding: 0 16px 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #e4e6ed;
  flex-shrink: 0;
}

.chat-header-content {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.chat-header-mark {
  position: relative;
  width: 32px;
  height: 28px;
  flex-shrink: 0;
}

.chat-header-bubble {
  position: absolute;
  width: 22px;
  height: 22px;
}

.chat-header-bubble--back {
  left: 0;
  top: 2px;
}

.chat-header-bubble--front {
  left: 8px;
  top: 6px;
}

.chat-header-plus {
  position: absolute;
  right: -2px;
  top: -2px;
  font-size: 11px;
  font-weight: 700;
  color: #c04e1d;
  line-height: 1;
}

.chat-title {
  font-family: inherit;
  font-weight: 700;
  font-size: 16px;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.02em;
}

.chat-header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.chat-new {
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  background: none;
  border: none;
  padding: 6px 4px;
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.chat-new:hover:not(:disabled) {
  color: #c04e1d;
}

.chat-new:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-close {
  width: 28px;
  height: 28px;
  color: #94a3b8;
  transition: color 0.2s;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chat-close:hover {
  color: #1e293b;
}

.chat-messages {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: #eef1f3;
  background-image:
    radial-gradient(ellipse 120% 80% at 10% 20%, rgba(203, 213, 225, 0.45) 0%, transparent 55%),
    radial-gradient(ellipse 100% 70% at 90% 70%, rgba(224, 232, 227, 0.7) 0%, transparent 50%),
    radial-gradient(ellipse 80% 60% at 50% 100%, rgba(203, 213, 225, 0.35) 0%, transparent 45%);
}

.chat-messages::-webkit-scrollbar {
  width: 6px;
}
.chat-messages::-webkit-scrollbar-track {
  background: transparent;
}
.chat-messages::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 10px;
}

.message-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
}

.bot-panel-wrap {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  max-width: 100%;
}

.chat-input-area {
  padding: 16px;
  background: white;
  border-top: 1px solid #eef0f2;
}

.chat-input-form {
  position: relative;
  display: flex;
  align-items: center;
}

.chat-input {
  width: 100%;
  height: 48px;
  background: white;
  border: 1px solid #eef0f2;
  border-radius: 8px;
  padding: 0 48px 0 16px;
  font-size: 14px;
  color: #2f3e35;
  transition: border-color 0.2s;
  outline: none;
}

.chat-input:focus {
  border-color: #c04e1d;
}

.chat-input::placeholder {
  color: #94a3b8;
}

.chat-send-btn {
  position: absolute;
  right: 8px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #c04e1d;
  cursor: pointer;
  transition: opacity 0.2s;
  padding: 0;
}

.chat-send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.chat-send-icon {
  width: 18px;
  height: 18px;
}
</style>
