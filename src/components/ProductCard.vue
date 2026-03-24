<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { ProductVO } from '@/types/product'
import MoneyText from './MoneyText.vue'

interface Props {
  product: ProductVO
}

const props = defineProps<Props>()
const router = useRouter()

const handleClick = () => {
  router.push(`/products/${props.product.id}`)
}
</script>

<template>
  <el-card 
    class="product-card" 
    :body-style="{ padding: '0' }"
    shadow="hover"
    @click="handleClick"
  >
    <el-image
      :src="product.coverImageUrl"
      fit="cover"
      lazy
      class="product-image"
    >
      <template #placeholder>
        <div class="image-slot">加载中...</div>
      </template>
      <template #error>
        <div class="image-slot">加载失败</div>
      </template>
    </el-image>
    
    <div class="product-info">
      <p class="product-name">{{ product.name }}</p>
      <div class="product-price-row">
        <MoneyText :amount="product.price" size="default" />
        <span class="sales">已售 {{ product.sales }}</span>
      </div>
    </div>
  </el-card>
</template>

<style scoped>
.product-card {
  cursor: pointer;
  transition: transform 0.3s ease;
}

.product-card:hover {
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 220px;
}

.image-slot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: #f5f5f5;
  color: #999;
  font-size: 14px;
}

.product-info {
  padding: 12px;
}

.product-name {
  font-size: 14px;
  color: var(--text-primary);
  min-height: 40px;
  margin: 0 0 8px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-price-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sales {
  font-size: 12px;
  color: #999;
}
</style>
