<script setup lang="ts">
import { computed } from 'vue'
import { formatMoney } from '@/utils/format'

interface Props {
  amount: number
  prefix?: string
  size?: 'small' | 'default' | 'large'
}

const props = withDefaults(defineProps<Props>(), {
  prefix: '¥',
  size: 'default'
})
</script>

<template>
  <span class="money-text" :class="props.size">{{ props.prefix }}{{ formatMoney(props.amount) }}</span>
</template>

<style scoped>
.money-text {
  color: var(--price-color, #ff4d4f);
  font-weight: bold;
}

.money-text.small {
  font-size: 12px;
}

.money-text.default {
  font-size: 14px;
}

.money-text.large {
  font-size: 20px;
}
</style>
