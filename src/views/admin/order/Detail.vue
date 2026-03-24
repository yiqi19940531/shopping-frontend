<template>
  <div class="order-detail">
    <el-card v-loading="loading">
      <template #header>
        <div class="header">
          <h3>订单详情</h3>
          <el-button @click="handleBack">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
        </div>
      </template>

      <div v-if="order" class="detail-content">
        <!-- 订单状态和基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="订单状态" :span="2">
            <OrderStatusTag :status="order.status" />
          </el-descriptions-item>
          <el-descriptions-item label="订单号">
            {{ order.orderNo }}
          </el-descriptions-item>
          <el-descriptions-item label="用户ID">
            {{ order.userId }}
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDate(order.createTime) }}
          </el-descriptions-item>
          <el-descriptions-item label="支付时间">
            {{ order.paymentTime ? formatDate(order.paymentTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="发货时间">
            {{ order.shipTime ? formatDate(order.shipTime) : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="完成时间">
            {{ order.completeTime ? formatDate(order.completeTime) : '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 收货信息 -->
        <h4 class="section-title">收货信息</h4>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="收货人">
            {{ order.receiverName }}
          </el-descriptions-item>
          <el-descriptions-item label="联系电话">
            {{ order.receiverPhone }}
          </el-descriptions-item>
          <el-descriptions-item label="收货地址" :span="2">
            {{ order.receiverAddress }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 物流信息 -->
        <h4 class="section-title">物流信息</h4>
        <el-descriptions :column="1" border>
          <el-descriptions-item label="物流单号">
            {{ order.trackingNo || '-' }}
          </el-descriptions-item>
        </el-descriptions>

        <!-- 订单商品 -->
        <h4 class="section-title">订单商品</h4>
        <el-table :data="order.orderItems" border>
          <el-table-column label="商品图片" width="100" align="center">
            <template #default="{ row }">
              <el-image
                v-if="row.productImageUrl"
                :src="getFileUrl(row.productImageUrl)"
                :preview-src-list="[getFileUrl(row.productImageUrl)]"
                style="width: 60px; height: 60px"
                fit="cover"
              />
            </template>
          </el-table-column>

          <el-table-column prop="productName" label="商品名称" min-width="200" />

          <el-table-column label="单价" width="120" align="right">
            <template #default="{ row }">
              <MoneyText :amount="row.price" />
            </template>
          </el-table-column>

          <el-table-column prop="quantity" label="数量" width="100" align="center" />

          <el-table-column label="小计" width="120" align="right">
            <template #default="{ row }">
              <MoneyText :amount="row.totalAmount" />
            </template>
          </el-table-column>
        </el-table>

        <!-- 订单金额 -->
        <div class="amount-summary">
          <div class="amount-row">
            <span class="amount-label">订单总额：</span>
            <MoneyText :amount="order.totalAmount" class="amount-value" />
          </div>
        </div>

        <!-- 备注 -->
        <div v-if="order.remark" class="remark-section">
          <h4 class="section-title">订单备注</h4>
          <div class="remark-content">{{ order.remark }}</div>
        </div>

        <!-- 发货按钮 -->
        <div v-if="order.status === 'PAID'" class="action-bar">
          <el-button type="primary" @click="handleShip">
            <el-icon><Van /></el-icon>
            发货
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 发货对话框 -->
    <el-dialog
      v-model="shipDialogVisible"
      title="订单发货"
      width="500px"
      @close="resetShipForm"
    >
      <el-form
        ref="shipFormRef"
        :model="shipForm"
        :rules="shipRules"
        label-width="100px"
      >
        <el-form-item label="订单号">
          <el-input v-model="orderNo" disabled />
        </el-form-item>

        <el-form-item label="物流单号" prop="trackingNo">
          <el-input
            v-model="shipForm.trackingNo"
            placeholder="请输入物流单号"
            maxlength="100"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="shipDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="shipping" @click="handleConfirmShip">
          确定发货
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { ArrowLeft, Van } from '@element-plus/icons-vue'
import { getAdminOrderDetail, shipOrder } from '@/api/admin/order'
import { getFileUrl } from '@/api/file'
import type { OrderVO } from '@/types/order'
import { formatDate } from '@/utils/format'
import MoneyText from '@/components/MoneyText.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'

const router = useRouter()
const route = useRoute()
const loading = ref(false)
const order = ref<OrderVO>()
const shipDialogVisible = ref(false)
const shipping = ref(false)
const shipFormRef = ref<FormInstance>()
const orderNo = route.params.orderNo as string

const shipForm = reactive({
  trackingNo: ''
})

const shipRules: FormRules = {
  trackingNo: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

const fetchOrderDetail = async () => {
  loading.value = true
  try {
    const res = await getAdminOrderDetail(orderNo)
    order.value = res.data
  } catch (error) {
    ElMessage.error('获取订单详情失败')
    router.back()
  } finally {
    loading.value = false
  }
}

const handleBack = () => {
  router.back()
}

const handleShip = () => {
  shipDialogVisible.value = true
}

const handleConfirmShip = async () => {
  if (!shipFormRef.value) return

  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return

    shipping.value = true
    try {
      await shipOrder(orderNo, {
        trackingNo: shipForm.trackingNo
      })
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      await fetchOrderDetail()
    } catch (error) {
      ElMessage.error('发货失败')
    } finally {
      shipping.value = false
    }
  })
}

const resetShipForm = () => {
  shipFormRef.value?.resetFields()
  shipForm.trackingNo = ''
}

onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h3 {
  margin: 0;
}

.detail-content {
  padding: 20px;
}

.section-title {
  margin: 30px 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.section-title:first-child {
  margin-top: 0;
}

.amount-summary {
  margin-top: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 4px;
  text-align: right;
}

.amount-row {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 16px;
}

.amount-label {
  font-weight: 600;
  color: #303133;
}

.amount-value {
  margin-left: 10px;
  font-size: 20px;
  font-weight: bold;
}

.remark-section {
  margin-top: 20px;
}

.remark-content {
  padding: 15px;
  background: #f5f7fa;
  border-radius: 4px;
  color: #606266;
  line-height: 1.6;
}

.action-bar {
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #dcdfe6;
  text-align: center;
}
</style>
