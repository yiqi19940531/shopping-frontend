<template>
  <div class="payment-container">
    <div class="page-container">
      <el-card class="payment-card" v-loading="loading">
        <template #header>
          <h2>订单支付</h2>
        </template>

        <div v-if="order" class="payment-content">
          <!-- 订单信息 -->
          <div class="order-info">
            <div class="info-item">
              <span class="label">订单号：</span>
              <span class="value">{{ order.orderNo }}</span>
            </div>
            <div class="info-item amount">
              <span class="label">支付金额：</span>
              <MoneyText :amount="order.totalAmount" size="large" />
            </div>
          </div>

          <!-- 支付按钮 -->
          <div class="payment-actions">
            <el-button
              type="primary"
              size="large"
              :loading="paying"
              @click="handlePay"
            >
              {{ paying ? '支付处理中...' : '确认支付' }}
            </el-button>
            <el-button size="large" @click="goBack">
              返回订单
            </el-button>
          </div>
        </div>

        <!-- 支付处理中的遮罩层 -->
        <div v-if="processing" class="processing-overlay">
          <div class="processing-content">
            <el-icon class="loading-icon" :size="60">
              <Loading />
            </el-icon>
            <p class="processing-text">支付处理中...</p>
            <p class="processing-tip">请稍候，正在确认支付结果</p>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading } from '@element-plus/icons-vue'
import { getOrderDetail } from '@/api/order'
import { pay } from '@/api/payment'
import MoneyText from '@/components/MoneyText.vue'
import type { OrderVO } from '@/types/order'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const paying = ref(false)
const processing = ref(false)
const order = ref<OrderVO | null>(null)

let pollTimer: NodeJS.Timeout | null = null
let pollCount = 0
const MAX_POLL_COUNT = 15 // 最多轮询15次，每次2秒，共30秒

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
    
    // 如果订单已支付，跳转到订单详情
    if (order.value.status !== 'PENDING_PAYMENT') {
      ElMessage.info('该订单已支付')
      router.push(`/order/${orderNo}`)
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取订单详情失败')
    router.push('/order/list')
  } finally {
    loading.value = false
  }
}

// 轮询订单状态
const pollOrderStatus = async () => {
  if (!order.value || pollCount >= MAX_POLL_COUNT) {
    stopPolling()
    if (pollCount >= MAX_POLL_COUNT) {
      processing.value = false
      ElMessage.warning('支付确认中，请稍后查看订单')
      router.push('/order/list')
    }
    return
  }

  pollCount++
  
  try {
    const latestOrder = await getOrderDetail(order.value.orderNo)
    
    if (latestOrder.status !== 'PENDING_PAYMENT') {
      stopPolling()
      processing.value = false
      ElMessage.success('支付成功')
      router.push(`/order/${order.value.orderNo}`)
    }
  } catch (error) {
    // 轮询失败不提示，继续下一次轮询
  }
}

// 开始轮询
const startPolling = () => {
  pollCount = 0
  pollTimer = setInterval(pollOrderStatus, 2000)
}

// 停止轮询
const stopPolling = () => {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// 处理支付
const handlePay = async () => {
  if (!order.value) return

  paying.value = true
  try {
    await pay(order.value.orderNo)
    paying.value = false
    
    // 显示支付处理中的界面
    processing.value = true
    
    // 等待3秒后开始轮询
    setTimeout(() => {
      startPolling()
    }, 3000)
  } catch (error: any) {
    paying.value = false
    ElMessage.error(error.message || '支付失败')
  }
}

// 返回
const goBack = () => {
  if (order.value) {
    router.push(`/order/${order.value.orderNo}`)
  } else {
    router.push('/order/list')
  }
}

onMounted(() => {
  fetchOrderDetail()
})

onUnmounted(() => {
  stopPolling()
})
</script>

<style scoped>
.payment-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.payment-card {
  border-radius: 8px;
  position: relative;
}

.payment-card h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.payment-content {
  padding: 20px 0;
}

.order-info {
  background-color: #f5f7fa;
  padding: 30px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  font-size: 16px;
}

.info-item:last-child {
  margin-bottom: 0;
}

.info-item.amount {
  font-size: 18px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #dcdfe6;
}

.info-item .label {
  color: #606266;
  min-width: 100px;
}

.info-item .value {
  color: #303133;
  font-weight: 500;
}

.payment-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.processing-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
  border-radius: 8px;
}

.processing-content {
  text-align: center;
}

.loading-icon {
  color: #409eff;
  animation: rotate 1.5s linear infinite;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.processing-text {
  margin: 20px 0 10px;
  font-size: 20px;
  color: #303133;
  font-weight: 600;
}

.processing-tip {
  margin: 0;
  font-size: 14px;
  color: #909399;
}

@media (max-width: 768px) {
  .payment-actions {
    flex-direction: column;
  }
  
  .payment-actions .el-button {
    width: 100%;
  }
}
</style>
