<script setup lang="ts">
import { useChatStore } from '@/stores/chat'

const store = useChatStore()
</script>

<template>
  <div class="preset-buttons" v-if="store.presetQuestions.length > 0">
    <button
      v-for="preset in store.presetQuestions"
      :key="preset.id"
      class="preset-btn"
      @click="store.handlePresetClick(preset)"
      :disabled="store.isTyping"
    >
      {{ preset.question }}
    </button>
  </div>
</template>

<style scoped>
.preset-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  margin-bottom: 8px;
}

.preset-btn {
  background: #e0e8e3;
  border: 1px solid #94a3b8;
  color: #1e293b;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.preset-btn:hover:not(:disabled) {
  border-color: #64748b;
  background-color: #d2ddd6;
}

.preset-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
