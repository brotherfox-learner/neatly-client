<script setup lang="ts">
import type { PaymentOption } from '@/stores/chat'
import { useChatStore } from '@/stores/chat'

defineProps<{
  intro: string
  options: PaymentOption[]
}>()

const store = useChatStore()
</script>

<template>
  <section class="payment-panel" aria-label="Payment methods">
    <p class="payment-panel-intro">{{ intro }}</p>
    <div class="payment-panel-rule" role="separator" />
    <template v-for="(opt, index) in options" :key="opt.key">
      <button
        type="button"
        class="payment-panel-row"
        :disabled="store.isTyping"
        @click="store.handleOptionClick(opt)"
      >
        {{ opt.label }}
      </button>
      <div v-if="index < options.length - 1" class="payment-panel-rule" role="separator" />
    </template>
  </section>
</template>

<style scoped>
.payment-panel {
  width: 100%;
  max-width: 100%;
  background: #ffffff;
  border: 1px solid #e4e6ed;
  border-radius: 14px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
  overflow: hidden;
  margin: 4px 0 12px;
}

.payment-panel-intro {
  margin: 0;
  padding: 14px 16px;
  font-size: 14px;
  line-height: 1.5;
  color: #1e293b;
}

.payment-panel-rule {
  height: 0;
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 0;
}

.payment-panel-row {
  display: block;
  width: 100%;
  text-align: left;
  padding: 14px 16px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  background: #ffffff;
  border: none;
  cursor: pointer;
  transition: background 0.15s;
}

.payment-panel-row:hover:not(:disabled) {
  background: #f8fafc;
}

.payment-panel-row:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
