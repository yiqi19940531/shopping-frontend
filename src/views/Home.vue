<template>
  <div class="home-container" v-loading="loading">
    <div class="page-container">
      <!-- 推荐商品 -->
      <section class="product-section">
        <div class="section-header">
          <h2 class="section-title">推荐商品</h2>
        </div>
        <el-row :gutter="20">
          <el-col
            v-for="product in recommendProducts"
            :key="product.id"
            :span="6"
            :xs="12"
          >
            <ProductCard :product="product" />
          </el-col>
        </el-row>
        <el-empty v-if="!loading && recommendProducts.length === 0" description="暂无推荐商品" />
      </section>

      <!-- 热门商品 -->
      <section class="product-section">
        <div class="section-header">
          <h2 class="section-title">热门商品</h2>
        </div>
        <el-row :gutter="20">
          <el-col
            v-for="product in hotProducts"
            :key="product.id"
            :span="6"
            :xs="12"
          >
            <ProductCard :product="product" />
          </el-col>
        </el-row>
        <el-empty v-if="!loading && hotProducts.length === 0" description="暂无热门商品" />
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRecommendProducts, getHotProducts } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import type { ProductVO } from '@/types/product'

const loading = ref(false)
const recommendProducts = ref<ProductVO[]>([])
const hotProducts = ref<ProductVO[]>([])

const fetchProducts = async () => {
  loading.value = true
  try {
    const [recommendRes, hotRes] = await Promise.all([
      getRecommendProducts(8),
      getHotProducts(8)
    ])
    recommendProducts.value = recommendRes
    hotProducts.value = hotRes
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品数据失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.product-section {
  margin-bottom: 40px;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}

.section-header {
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.section-title {
  margin: 0;
  font-size: 24px;
  color: #303133;
  font-weight: 600;
}

.el-row {
  margin-left: -10px !important;
  margin-right: -10px !important;
}

.el-col {
  padding-left: 10px !important;
  padding-right: 10px !important;
  margin-bottom: 20px;
}
</style>
