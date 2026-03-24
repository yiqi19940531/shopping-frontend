<template>
  <div class="order-list">
    <div class="filter-bar">
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="订单号">
          <el-input
            v-model="searchParams.orderNo"
            placeholder="请输入订单号"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="用户ID">
          <el-input
            v-model="searchParams.userId"
            placeholder="请输入用户ID"
            clearable
            style="width: 150px"
          />
        </el-form-item>

        <el-form-item label="订单状态">
          <el-select
            v-model="searchParams.status"
            placeholder="请选择状态"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="(label, value) in ORDER_STATUS_MAP"
              :key="value"
              :label="label"
              :value="value"
            />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="orders"
      border
    >
      <el-table-column prop="orderNo" label="订单号" width="200" />
      
      <el-table-column prop="userId" label="用户ID" width="100" />

      <el-table-column label="订单状态" width="120" align="center">
        <template #default="{ row }">
          <OrderStatusTag :status="row.status" />
        </template>
      </el-table-column>

      <el-table-column label="订单金额" width="120" align="right">
        <template #default="{ row }">
          <MoneyText :amount="row.totalAmount" />
        </template>
      </el-table-column>

      <el-table-column label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createTime) }}
        </template>
      </el-table-column>

      <el-table-column label="操作" width="200" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleViewDetail(row.orderNo)">
            查看详情
          </el-button>
          <el-button
            v-if="row.status === 'PAID'"
            link
            type="success"
            @click="handleShip(row)"
          >
            发货
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <AppPagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      @change="fetchOrders"
    />

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
          <el-input v-model="currentOrderNo" disabled />
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
import { useRouter } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Search, RefreshLeft } from '@element-plus/icons-vue'
import { getAdminOrders, shipOrder } from '@/api/admin/order'
import type { OrderVO, OrderStatus } from '@/types/order'
import { ORDER_STATUS_MAP } from '@/utils/constants'
import { formatDate } from '@/utils/format'
import MoneyText from '@/components/MoneyText.vue'
import OrderStatusTag from '@/components/OrderStatusTag.vue'
import AppPagination from '@/components/AppPagination.vue'

const router = useRouter()
const loading = ref(false)
const orders = ref<OrderVO[]>([])
const shipDialogVisible = ref(false)
const shipping = ref(false)
const shipFormRef = ref<FormInstance>()
const currentOrderNo = ref('')

const searchParams = reactive({
  orderNo: '',
  userId: undefined as number | undefined,
  status: undefined as OrderStatus | undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

const shipForm = reactive({
  trackingNo: ''
})

const shipRules: FormRules = {
  trackingNo: [
    { required: true, message: '请输入物流单号', trigger: 'blur' }
  ]
}

const fetchOrders = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await getAdminOrders(params)
    orders.value = res.data.records
    pagination.total = res.data.total
    pagination.current = res.data.current
  } catch (error) {
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchOrders()
}

const handleReset = () => {
  searchParams.orderNo = ''
  searchParams.userId = undefined
  searchParams.status = undefined
  pagination.current = 1
  fetchOrders()
}

const handleViewDetail = (orderNo: string) => {
  router.push(`/admin/orders/${orderNo}`)
}

const handleShip = (row: OrderVO) => {
  currentOrderNo.value = row.orderNo
  shipDialogVisible.value = true
}

const handleConfirmShip = async () => {
  if (!shipFormRef.value) return

  await shipFormRef.value.validate(async (valid) => {
    if (!valid) return

    shipping.value = true
    try {
      await shipOrder(currentOrderNo.value, {
        trackingNo: shipForm.trackingNo
      })
      ElMessage.success('发货成功')
      shipDialogVisible.value = false
      await fetchOrders()
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
  currentOrderNo.value = ''
}

onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.order-list {
  padding: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}
</style>
