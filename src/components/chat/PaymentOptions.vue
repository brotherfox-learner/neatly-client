<script setup lang="ts">
import type { PaymentOption } from '@/stores/chat'
import { useChatStore } from '@/stores/chat'

defineProps<{
  options: PaymentOption[]
}>()

const store = useChatStore()
</script>

<template>
  <div class="payment-options">
    <button
      v-for="opt in options"
      :key="opt.key"
      type="button"
      class="payment-option-row"
      @click="store.handleOptionClick(opt)"
      :disabled="store.isTyping"
    >
      <span class="option-label">{{ opt.label }}</span>
      <span v-if="opt.detail" class="option-hint">Tap for details</span>
    </button>
  </div>
</template>

<style scoped>
.payment-options {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 8px;
  width: 100%;
}

.payment-option-row {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  width: 100%;
  text-align: left;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 14px 16px;
  cursor: pointer;
  transition:
    border-color 0.2s,
    box-shadow 0.2s;
}

.payment-option-row:hover:not(:disabled) {
  border-color: #c04e1d;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.06);
}

.payment-option-row:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.option-label {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.option-hint {
  font-size: 12px;
  color: #64748b;
}
</style>
