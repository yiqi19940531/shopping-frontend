<template>
  <div class="product-detail-container" v-loading="loading">
    <div class="page-container" v-if="product">
      <el-card class="detail-card">
        <div class="product-info">
          <!-- 左侧：商品图片轮播 -->
          <div class="product-images">
            <el-carousel
              v-if="imageList.length > 0"
              :height="carouselHeight"
              indicator-position="outside"
            >
              <el-carousel-item v-for="(image, index) in imageList" :key="index">
                <img :src="image" :alt="product.name" class="carousel-image" />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="no-image">
              <el-icon :size="80"><Picture /></el-icon>
              <p>暂无图片</p>
            </div>
          </div>

          <!-- 右侧：商品信息 -->
          <div class="product-details">
            <h1 class="product-name">{{ product.name }}</h1>
            
            <div class="price-section">
              <div class="current-price">
                <span class="price-label">价格</span>
                <MoneyText :amount="product.price" size="large" />
              </div>
              <div v-if="product.originalPrice && product.originalPrice > product.price" class="original-price">
                <span class="price-label">原价</span>
                <span class="old-price">¥{{ product.originalPrice.toFixed(2) }}</span>
              </div>
            </div>

            <div class="info-section">
              <div class="info-item">
                <span class="info-label">库存</span>
                <span class="info-value">{{ product.stock }} 件</span>
              </div>
              <div class="info-item">
                <span class="info-label">销量</span>
                <span class="info-value">{{ product.sales || 0 }} 件</span>
              </div>
            </div>

            <div class="quantity-section">
              <span class="quantity-label">数量</span>
              <el-input-number
                v-model="quantity"
                :min="1"
                :max="product.stock"
                :disabled="product.stock === 0"
              />
            </div>

            <div class="action-section">
              <el-button
                type="primary"
                size="large"
                :disabled="product.stock === 0"
                :loading="addingToCart"
                @click="handleAddToCart"
              >
                {{ product.stock === 0 ? '已售罄' : '加入购物车' }}
              </el-button>
            </div>
          </div>
        </div>

        <!-- 商品详情描述 -->
        <div class="product-description">
          <div class="description-header">
            <h2>商品详情</h2>
          </div>
          <div class="description-content" v-html="product.description || '暂无详情'"></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Picture } from '@element-plus/icons-vue'
import { getProductDetail } from '@/api/product'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'
import MoneyText from '@/components/MoneyText.vue'
import type { ProductDetail } from '@/types/product'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const authStore = useAuthStore()

const loading = ref(false)
const addingToCart = ref(false)
const product = ref<ProductDetail | null>(null)
const quantity = ref(1)
const carouselHeight = '400px'

// 图片列表
const imageList = computed(() => {
  if (!product.value) return []
  
  const images: string[] = []
  if (product.value.imageUrls && product.value.imageUrls.length > 0) {
    images.push(...product.value.imageUrls)
  } else if (product.value.coverImageUrl) {
    images.push(product.value.coverImageUrl)
  }
  return images
})

// 获取商品详情
const fetchProductDetail = async () => {
  const id = Number(route.params.id)
  if (!id) {
    ElMessage.error('商品ID无效')
    router.push('/products')
    return
  }

  loading.value = true
  try {
    product.value = await getProductDetail(id)
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品详情失败')
    router.push('/products')
  } finally {
    loading.value = false
  }
}

// 加入购物车
const handleAddToCart = async () => {
  if (!authStore.isLoggedIn) {
    ElMessageBox.confirm('请先登录', '提示', {
      confirmButtonText: '去登录',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      router.push({
        path: '/login',
        query: { redirect: route.fullPath }
      })
    }).catch(() => {})
    return
  }

  if (!product.value) return

  addingToCart.value = true
  try {
    await cartStore.addToCart({
      productId: product.value.id,
      quantity: quantity.value
    })
    ElMessage.success('加入购物车成功')
    quantity.value = 1 // 重置数量
  } catch (error: any) {
    ElMessage.error(error.message || '加入购物车失败')
  } finally {
    addingToCart.value = false
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.detail-card {
  border-radius: 8px;
}

.product-info {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.product-images {
  flex: 0 0 500px;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  height: 400px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f5f5;
  color: #909399;
  border-radius: 8px;
}

.product-details {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 24px;
  color: #303133;
  margin: 0 0 20px;
  line-height: 1.4;
}

.price-section {
  background-color: #fff5f5;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.current-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.price-label {
  color: #909399;
  font-size: 14px;
}

.original-price {
  display: flex;
  align-items: center;
  gap: 10px;
}

.old-price {
  color: #909399;
  text-decoration: line-through;
  font-size: 16px;
}

.info-section {
  display: flex;
  gap: 40px;
  margin-bottom: 30px;
  padding: 15px 0;
  border-top: 1px solid #ebeef5;
  border-bottom: 1px solid #ebeef5;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-label {
  color: #909399;
  font-size: 14px;
}

.info-value {
  color: #303133;
  font-size: 16px;
  font-weight: 500;
}

.quantity-section {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.quantity-label {
  color: #606266;
  font-size: 14px;
}

.action-section {
  display: flex;
  gap: 15px;
}

.action-section .el-button {
  min-width: 200px;
}

.product-description {
  border-top: 1px solid #ebeef5;
  padding-top: 30px;
}

.description-header {
  margin-bottom: 20px;
}

.description-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.description-content {
  color: #606266;
  line-height: 1.8;
  font-size: 14px;
}

@media (max-width: 768px) {
  .product-info {
    flex-direction: column;
  }
  
  .product-images {
    flex: none;
    width: 100%;
  }
  
  .action-section .el-button {
    min-width: auto;
    flex: 1;
  }
}
</style>
