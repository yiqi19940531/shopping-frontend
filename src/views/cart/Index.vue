<template>
  <div class="cart-container" v-loading="cartStore.loading">
    <div class="page-container">
      <el-card class="cart-card">
        <template #header>
          <div class="card-header">
            <h2>购物车</h2>
            <span class="cart-count">{{ cartStore.cartCount }} 件商品</span>
          </div>
        </template>

        <!-- 购物车列表 -->
        <div v-if="cartStore.items.length > 0">
          <el-table :data="cartStore.items" style="width: 100%">
            <!-- 选择框 -->
            <el-table-column width="55" align="center">
              <template #header>
                <el-checkbox
                  :model-value="isAllSelected"
                  @change="handleSelectAll"
                />
              </template>
              <template #default="{ row }">
                <el-checkbox
                  :model-value="row.isSelected"
                  @change="handleSelectItem(row.id, $event)"
                />
              </template>
            </el-table-column>

            <!-- 商品信息 -->
            <el-table-column label="商品信息" min-width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <img
                    :src="row.productCoverImageUrl"
                    :alt="row.productName"
                    class="product-image"
                    @click="goToProductDetail(row.productId)"
                  />
                  <div class="product-name" @click="goToProductDetail(row.productId)">
                    {{ row.productName }}
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 单价 -->
            <el-table-column label="单价" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.productPrice" />
              </template>
            </el-table-column>

            <!-- 数量 -->
            <el-table-column label="数量" width="180" align="center">
              <template #default="{ row }">
                <el-input-number
                  :model-value="row.quantity"
                  :min="1"
                  :max="row.productStock"
                  @change="handleQuantityChange(row.id, $event)"
                />
              </template>
            </el-table-column>

            <!-- 小计 -->
            <el-table-column label="小计" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.subtotal" class="subtotal" />
              </template>
            </el-table-column>

            <!-- 操作 -->
            <el-table-column label="操作" width="100" align="center">
              <template #default="{ row }">
                <el-button
                  type="danger"
                  link
                  @click="handleRemoveItem(row.id)"
                >
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 底部操作栏 -->
          <div class="cart-footer">
            <div class="footer-left">
              <el-checkbox
                :model-value="isAllSelected"
                @change="handleSelectAll"
              >
                全选
              </el-checkbox>
              <el-button
                type="danger"
                plain
                :disabled="cartStore.selectedCount === 0"
                @click="handleBatchRemove"
              >
                批量删除
              </el-button>
            </div>
            <div class="footer-right">
              <div class="selected-info">
                已选 <span class="highlight">{{ cartStore.selectedCount }}</span> 件
              </div>
              <div class="total-amount">
                合计：<MoneyText :amount="cartStore.totalAmount" size="large" />
              </div>
              <el-button
                type="primary"
                size="large"
                :disabled="cartStore.selectedCount === 0"
                @click="handleCheckout"
              >
                结算
              </el-button>
            </div>
          </div>
        </div>

        <!-- 空购物车 -->
        <el-empty v-else description="购物车是空的">
          <el-button type="primary" @click="goToProducts">去购物</el-button>
        </el-empty>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useCartStore } from '@/stores/cart'
import MoneyText from '@/components/MoneyText.vue'

const router = useRouter()
const cartStore = useCartStore()

// 是否全选
const isAllSelected = computed(() => {
  if (cartStore.items.length === 0) return false
  return cartStore.items.every(item => item.isSelected)
})

// 处理全选/取消全选
const handleSelectAll = (checked: boolean) => {
  cartStore.items.forEach(item => {
    cartStore.toggleSelect(item.id, checked)
  })
}

// 处理单个商品选择
const handleSelectItem = (id: number, checked: boolean) => {
  cartStore.toggleSelect(id, checked)
}

// 处理数量变化
const handleQuantityChange = async (id: number, quantity: number) => {
  if (!quantity || quantity < 1) return
  
  try {
    await cartStore.updateQuantity(id, quantity)
  } catch (error: any) {
    ElMessage.error(error.message || '更新数量失败')
  }
}

// 处理删除单个商品
const handleRemoveItem = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cartStore.removeItem(id)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 处理批量删除
const handleBatchRemove = async () => {
  const selectedIds = cartStore.selectedItems.map(item => item.id)
  if (selectedIds.length === 0) return

  try {
    await ElMessageBox.confirm(`确定要删除选中的 ${selectedIds.length} 件商品吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cartStore.batchRemove(selectedIds)
    ElMessage.success('删除成功')
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

// 去商品详情页
const goToProductDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 去商品列表页
const goToProducts = () => {
  router.push('/products')
}

// 去结算
const handleCheckout = () => {
  if (cartStore.selectedCount === 0) {
    ElMessage.warning('请选择要结算的商品')
    return
  }
  router.push('/order/confirm')
}

onMounted(() => {
  cartStore.fetchCart()
})
</script>

<style scoped>
.cart-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.cart-card {
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.cart-count {
  color: #909399;
  font-size: 14px;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-image:hover {
  transform: scale(1.05);
}

.product-name {
  flex: 1;
  color: #303133;
  cursor: pointer;
  transition: color 0.3s;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-name:hover {
  color: #409eff;
}

.subtotal {
  font-weight: 600;
  color: #f56c6c;
}

.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding: 20px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.footer-right {
  display: flex;
  align-items: center;
  gap: 30px;
}

.selected-info {
  color: #606266;
  font-size: 14px;
}

.highlight {
  color: #409eff;
  font-weight: 600;
  font-size: 16px;
}

.total-amount {
  color: #303133;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

@media (max-width: 768px) {
  .cart-footer {
    flex-direction: column;
    gap: 15px;
  }
  
  .footer-left,
  .footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
