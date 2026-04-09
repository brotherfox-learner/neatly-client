<script setup lang="ts">
import type { PromotionCard } from '@/stores/chat'

defineProps<{
  cards: PromotionCard[]
}>()
</script>

<template>
  <div class="promotion-cards-container">
    <div v-for="promo in cards" :key="promo.id" class="promo-card">
      <div class="promo-header">
        <span class="promo-code">{{ promo.code }}</span>
      </div>
      <div class="promo-body">
        <p class="promo-discount">
          Get 
          <span v-if="promo.discountType === 'PERCENTAGE'">{{ promo.discountValue }}% OFF</span>
          <span v-else>{{ promo.discountValue }} THB OFF</span>
        </p>
        <p class="promo-detail" v-if="promo.minSpend > 0">Min. spend: {{ promo.minSpend }} THB</p>
        <p class="promo-detail" v-if="promo.maxDiscount">Max discount: {{ promo.maxDiscount }} THB</p>
        <p class="promo-dates" v-if="promo.startDate || promo.endDate">
          Valid: {{ promo.startDate || 'Now' }} - {{ promo.endDate || 'Ongoing' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.promotion-cards-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
  margin-bottom: 8px;
}

.promo-card {
  background: white;
  border: 1px dashed #c4956a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.promo-header {
  background: #fdf8f4;
  padding: 8px 12px;
  border-bottom: 1px dashed #e2e8f0;
  display: flex;
  justify-content: center;
}

.promo-code {
  font-family: monospace;
  font-size: 14px;
  font-weight: 700;
  color: #c4956a;
  letter-spacing: 1px;
}

.promo-body {
  padding: 12px;
  text-align: center;
}

.promo-discount {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 600;
  color: #2f3e35;
}

.promo-detail {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.promo-dates {
  margin: 8px 0 0;
  font-size: 11px;
  color: #94a3b8;
  background: #f1f5f9;
  display: inline-block;
  padding: 2px 8px;
  border-radius: 10px;
}
</style>
