<template>
  <div class="order-detail-container" v-loading="loading">
    <div class="page-container">
      <el-card class="detail-card" v-if="order">
        <template #header>
          <div class="card-header">
            <h2>订单详情</h2>
            <OrderStatusTag :status="order.status" size="large" />
          </div>
        </template>

        <!-- 订单信息 -->
        <div class="section order-info-section">
          <div class="section-title">订单信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">
              {{ order.orderNo }}
            </el-descriptions-item>
            <el-descriptions-item label="订单状态">
              <OrderStatusTag :status="order.status" />
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">
              {{ formatDate(order.createTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="支付时间" v-if="order.payTime">
              {{ formatDate(order.payTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="发货时间" v-if="order.shipTime">
              {{ formatDate(order.shipTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="收货时间" v-if="order.receiveTime">
              {{ formatDate(order.receiveTime) }}
            </el-descriptions-item>
            <el-descriptions-item label="订单备注" :span="2" v-if="order.remark">
              {{ order.remark }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 收货地址 -->
        <div class="section address-section">
          <div class="section-title">收货地址</div>
          <div class="address-card">
            <div class="address-header">
              <span class="receiver-name">{{ order.receiverName }}</span>
              <span class="receiver-phone">{{ order.receiverPhone }}</span>
            </div>
            <div class="address-detail">
              {{ order.receiverAddress }}
            </div>
          </div>
        </div>

        <!-- 物流信息 -->
        <div class="section shipping-section" v-if="order.trackingNo">
          <div class="section-title">物流信息</div>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="物流单号">
              {{ order.trackingNo }}
            </el-descriptions-item>
            <el-descriptions-item label="发货时间">
              {{ formatDate(order.shipTime) }}
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 订单商品 -->
        <div class="section products-section">
          <div class="section-title">商品清单</div>
          <el-table :data="order.orderItems" border>
            <el-table-column label="商品信息" min-width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <img
                    :src="row.productCoverImageUrl"
                    :alt="row.productName"
                    class="product-image"
                    @click="goToProductDetail(row.productId)"
                  />
                  <span class="product-name" @click="goToProductDetail(row.productId)">
                    {{ row.productName }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.price" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100" align="center" prop="quantity" />
            <el-table-column label="小计" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.totalAmount" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 订单金额 -->
        <div class="section amount-section">
          <div class="amount-item">
            <span class="label">商品总额：</span>
            <MoneyText :amount="order.totalAmount" />
          </div>
          <div class="amount-item total">
            <span class="label">订单金额：</span>
            <MoneyText :amount="order.totalAmount" size="large" />
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="section actions-section">
          <!-- 待支付：去支付 + 取消订单 -->
          <template v-if="order.status === 'PENDING_PAYMENT'">
            <el-button type="primary" size="large" @click="goToPay">
              去支付
            </el-button>
            <el-button size="large" @click="handleCancelOrder">
              取消订单
            </el-button>
          </template>
          <!-- 已发货：确认收货 -->
          <template v-else-if="order.status === 'SHIPPED'">
            <el-button type="primary" size="large" @click="handleConfirmReceive">
              确认收货
            </el-button>
          </template>
          <el-button size="large" @click="goBack">
            返回订单列表
          </el-button>
        </div>

        <!-- 订单状态时间线 -->
        <div class="section timeline-section">
          <div class="section-title">订单流程</div>
          <el-timeline>
            <el-timeline-item
              v-if="order.createTime"
              :timestamp="formatDate(order.createTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">订单创建</div>
                <div class="timeline-desc">订单已创建，等待支付</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="order.payTime"
              :timestamp="formatDate(order.payTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">支付成功</div>
                <div class="timeline-desc">订单已支付，等待发货</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="order.shipTime"
              :timestamp="formatDate(order.shipTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">商品已发货</div>
                <div class="timeline-desc" v-if="order.trackingNo">
                  物流单号：{{ order.trackingNo }}
                </div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="order.receiveTime"
              :timestamp="formatDate(order.receiveTime)"
              placement="top"
            >
              <div class="timeline-content">
                <div class="timeline-title">确认收货</div>
                <div class="timeline-desc">订单已完成</div>
              </div>
            </el-timeline-item>
            <el-timeline-item
              v-if="order.status === 'CANCELLED' && order.cancelTime"
              :timestamp="formatDate(order.cancelTime)"
              placement="top"
              type="danger"
            >
              <div class="timeline-content">
                <div class="timeline-title">订单取消</div>
                <div class="timeline-desc">订单已取消</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getOrderDetail, cancelOrder, confirmReceive } from '@/api/order'
import MoneyText from '@/components/MoneyText.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import { formatDate } from '@/utils/format'
import type { OrderVO } from '@/types/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const order = ref<OrderVO | null>(null)

// 获取订单详情
const fetchOrderDetail = async () => {
  const orderNo = route.params.orderNo as string
  if (!orderNo) {
    ElMessage.error('订单号无效')
    router.push('/order/list')
    return
  }

  loading.value = true
  try {
    order.value = await getOrderDetail(orderNo)
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 取消订单
const handleCancelOrder = async () => {
  if (!order.value) return

  try {
    await ElMessageBox.confirm('确定要取消该订单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await cancelOrder(order.value.orderNo)
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '取消订单失败')
    }
  }
}

// 确认收货
const handleConfirmReceive = async () => {
  if (!order.value) return

  try {
    await ElMessageBox.confirm('确认已收到货物吗？', '提示', {
      confirmButtonText: '确认收货',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await confirmReceive(order.value.orderNo)
    ElMessage.success('确认收货成功')
    fetchOrderDetail()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '确认收货失败')
    }
  }
}

// 去支付
const goToPay = () => {
  if (order.value) {
    router.push(`/payment/${order.value.orderNo}`)
  }
}

// 去商品详情
const goToProductDetail = (productId: number) => {
  router.push(`/product/${productId}`)
}

// 返回
const goBack = () => {
  router.push('/order/list')
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
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

.section {
  margin-bottom: 30px;
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
}

.section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
}

.address-card {
  background-color: #f5f7fa;
  padding: 20px;
  border-radius: 8px;
}

.address-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.receiver-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.receiver-phone {
  color: #606266;
}

.address-detail {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.product-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.product-image {
  width: 60px;
  height: 60px;
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
}

.product-name:hover {
  color: #409eff;
}

.amount-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
}

.amount-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.amount-item.total {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.amount-item .label {
  color: #606266;
}

.actions-section {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.timeline-content {
  padding-left: 10px;
}

.timeline-title {
  font-weight: 600;
  color: #303133;
  margin-bottom: 5px;
}

.timeline-desc {
  color: #909399;
  font-size: 14px;
}

@media (max-width: 768px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .actions-section {
    flex-direction: column;
  }
  
  .actions-section .el-button {
    width: 100%;
  }
  
  .amount-section {
    align-items: flex-start;
  }
}
</style>
