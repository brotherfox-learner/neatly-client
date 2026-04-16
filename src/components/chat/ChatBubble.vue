<script setup lang="ts">
import { computed } from 'vue'
import type { ChatMsg } from '@/stores/chat'

const props = defineProps<{
  message: ChatMsg
}>()

const isUser = computed(() => props.message.type === 'user')
const isSystem = computed(() => props.message.type === 'system')
const isAgent = computed(() => props.message.type === 'agent-text')
</script>

<template>
  <div
    class="chat-bubble-container"
    :class="{
      'is-user': isUser,
      'is-system': isSystem,
      'is-bot': !isUser && !isSystem && !isAgent,
      'is-agent': isAgent
    }"
  >
    <div v-if="isSystem" class="system-message">
      {{ message.text }}
    </div>
    
    <template v-else-if="isAgent">
      <div class="agent-profile">
         <img v-if="message.senderAvatarUrl" :src="message.senderAvatarUrl" class="agent-avatar" alt="Admin" />
         <div v-else class="agent-avatar-placeholder">{{ message.senderName?.[0]?.toUpperCase() ?? 'A' }}</div>
      </div>
      <div class="chat-bubble-wrapper">
         <span class="agent-name">{{ message.senderName || 'Admin' }}</span>
         <div class="chat-bubble">{{ message.text }}</div>
      </div>
    </template>
    
    <div v-else class="chat-bubble">
      {{ message.text }}
    </div>
  </div>
</template>

<style scoped>
.chat-bubble-container {
  display: flex;
  width: 100%;
  margin-bottom: 8px;
}

.chat-bubble-container:last-child {
  margin-bottom: 0;
}

.is-user {
  justify-content: flex-end;
}

.is-bot {
  justify-content: flex-start;
}

.is-system {
  justify-content: center;
}

.is-agent {
  justify-content: flex-start;
  align-items: flex-end; /* Align bottom to match text flow */
}

.agent-profile {
  margin-right: 8px;
  flex-shrink: 0;
}

.agent-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  object-fit: cover;
}

.agent-avatar-placeholder {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #5d7b6a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 12px;
}

.chat-bubble-wrapper {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 0;
  align-items: flex-start;
}

.agent-name {
  font-size: 11px;
  color: #64748b;
  margin-bottom: 2px;
  margin-left: 2px;
}

.chat-bubble {
  max-width: 85%;
  padding: 12px 16px;
  font-size: 14px;
  line-height: 1.5;
  overflow-wrap: break-word;
  word-break: normal;
  white-space: pre-wrap;
}

.is-bot .chat-bubble {
  background-color: #ffffff;
  color: #1e293b;
  border: 1px solid #e4e6ed;
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
}

.is-agent .chat-bubble {
  background-color: #ffffff;
  color: #1e293b;
  border: 1px solid #e4e6ed;
  /* top-left, top-right, bottom-right, bottom-left — sharp bottom-left toward avatar */
  border-radius: 16px 16px 16px 4px;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  /* Use full width of the text column so short words are not squeezed to 1–2 letters per line */
  max-width: 100%;
  width: max-content;
  overflow-wrap: normal;
}

.is-user .chat-bubble {
  background-color: #c04e1d;
  color: #ffffff;
  border-radius: 16px 16px 4px 16px;
}

.system-message {
  font-size: 12px;
  color: #64748b;
  text-align: center;
  padding: 4px 12px;
  background: #f1f5f9;
  border-radius: 12px;
  margin-top: 8px;
  margin-bottom: 8px;
}
</style>
