<template>
  <div class="order-list-container" v-loading="loading">
    <div class="page-container">
      <el-card class="order-card">
        <template #header>
          <h2>我的订单</h2>
        </template>

        <!-- 订单状态标签页 -->
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="全部订单" name=""></el-tab-pane>
          <el-tab-pane
            v-for="(label, status) in ORDER_STATUS_MAP"
            :key="status"
            :label="label"
            :name="status"
          ></el-tab-pane>
        </el-tabs>

        <!-- 订单列表 -->
        <div v-if="orders.length > 0" class="order-list">
          <el-card
            v-for="order in orders"
            :key="order.id"
            class="order-item"
            shadow="hover"
          >
            <!-- 订单头部 -->
            <template #header>
              <div class="order-header">
                <div class="order-no">
                  <span class="label">订单号：</span>
                  <span class="value">{{ order.orderNo }}</span>
                </div>
                <div class="order-status">
                  <OrderStatusTag :status="order.status" />
                </div>
                <div class="order-time">
                  {{ formatDate(order.createTime) }}
                </div>
              </div>
            </template>

            <!-- 订单商品 -->
            <div class="order-products">
              <div
                v-for="item in order.orderItems"
                :key="item.id"
                class="product-item"
              >
                <img
                  :src="item.productCoverImageUrl"
                  :alt="item.productName"
                  class="product-image"
                  @click="goToProductDetail(item.productId)"
                />
                <div class="product-info">
                  <div
                    class="product-name"
                    @click="goToProductDetail(item.productId)"
                  >
                    {{ item.productName }}
                  </div>
                  <div class="product-meta">
                    <MoneyText :amount="item.price" />
                    <span class="quantity">x{{ item.quantity }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 订单底部 -->
            <div class="order-footer">
              <div class="order-amount">
                <span class="label">订单金额：</span>
                <MoneyText :amount="order.totalAmount" size="large" />
              </div>
              <div class="order-actions">
                <!-- 待支付：去支付 + 取消订单 -->
                <template v-if="order.status === 'PENDING_PAYMENT'">
                  <el-button type="primary" @click="goToPay(order.orderNo)">
                    去支付
                  </el-button>
                  <el-button @click="handleCancelOrder(order.orderNo)">
                    取消订单
                  </el-button>
                </template>
                <!-- 已发货：确认收货 -->
                <template v-else-if="order.status === 'SHIPPED'">
                  <el-button type="primary" @click="handleConfirmReceive(order.orderNo)">
                    确认收货
                  </el-button>
                </template>
                <!-- 查看详情 -->
                <el-button @click="goToOrderDetail(order.orderNo)">
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无订单" />

        <!-- 分页 -->
        <div v-if="total > 0" class="pagination-wrapper">
          <AppPagination
            :total="total"
            :page="pageNum"
            :page-size="pageSize"
            @update:page="handlePageChange"
            @update:page-size="handlePageSizeChange"
          />
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrders, cancelOrder, confirmReceive } from '@/api/order'
import MoneyText from '@/components/MoneyText.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import AppPagination from '@/components/AppPagination.vue'
import { ORDER_STATUS_MAP } from '@/utils/constants'
import { formatDate } from '@/utils/format'
import type { OrderVO } from '@/types/order'

const router = useRouter()

const loading = ref(false)
const activeTab = ref('')
const orders = ref<OrderVO[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 获取订单列表
const fetchOrders = async () => {
  loading.value = true
  try {
    const res = await getOrders({
      status: activeTab.value || undefined,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    })
    orders.value = res.records
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 处理标签页切换
const handleTabChange = () => {
  pageNum.value = 1
  fetchOrders()
}

// 处理分页
const handlePageChange = (page: number) => {
  pageNum.value = page
  fetchOrders()
}

const handlePageSizeChange = (size: number) => {
  pageSize.value = size
  pageNum.value = 1
  fetchOrders()
}

// 取消订单
const handleCancelOrder = async (orderNo: string) => {
  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelOrder(orderNo)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败')
    }
  }
}

// 确认收货
const handleConfirmReceive = async (orderNo: string) => {
  try {
    await ElMessageBox.confirm('确认已收到货物吗？', '提示', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmReceive(orderNo)
    ElMessage.success('确认收货成功')
    fetchOrders()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认收货失败')
    }
  }
}

// 去支付
const goToPay = (orderNo: string) => {
  router.push(`/payment/${orderNo}`)
}

// 去订单详情
const goToOrderDetail = (orderNo: string) => {
  router.push(`/order/${orderNo}`)
}

// 去商品详情
const goToProductDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.order-card {
  border-radius: 8px;
}

.order-card h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.order-list {
  margin-top: 20px;
}

.order-item {
  margin-bottom: 20px;
}

.order-item:last-child {
  margin-bottom: 0;
}

.order-header {
  display: flex;
  align-items: center;
  gap: 30px;
}

.order-no {
  flex: 1;
  font-size: 14px;
}

.order-no .label {
  color: #909399;
}

.order-no .value {
  color: #303133;
  font-weight: 500;
}

.order-time {
  color: #909399;
  font-size: 14px;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.product-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
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

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
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

.product-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity {
  color: #909399;
  font-size: 14px;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ebeef5;
}

.order-amount {
  display: flex;
  align-items: center;
  gap: 10px;
}

.order-amount .label {
  color: #606266;
  font-size: 14px;
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

@media (max-width: 768px) {
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .order-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .order-actions .el-button {
    width: 100%;
  }
}
</style>
