<template>
  <div class="order-confirm-container" v-loading="loading">
    <div class="page-container">
      <el-card class="confirm-card">
        <template #header>
          <h2>确认订单</h2>
        </template>

        <!-- 收货地址 -->
        <div class="section address-section">
          <div class="section-title">
            <span>收货地址</span>
            <el-button type="primary" link @click="goToAddressManagement">
              管理地址
            </el-button>
          </div>
          
          <div v-if="addresses.length > 0" class="address-list">
            <el-radio-group v-model="selectedAddressId" class="address-radio-group">
              <el-radio
                v-for="address in addresses"
                :key="address.id"
                :label="address.id"
                class="address-radio"
              >
                <div class="address-card">
                  <div class="address-header">
                    <span class="receiver-name">{{ address.receiverName }}</span>
                    <span class="receiver-phone">{{ address.receiverPhone }}</span>
                    <el-tag v-if="address.isDefault" type="danger" size="small">默认</el-tag>
                  </div>
                  <div class="address-detail">
                    {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
                  </div>
                </div>
              </el-radio>
            </el-radio-group>
          </div>
          <el-empty v-else description="暂无收货地址">
            <el-button type="primary" @click="goToAddressManagement">
              添加地址
            </el-button>
          </el-empty>
        </div>

        <!-- 商品列表 -->
        <div class="section product-section">
          <div class="section-title">商品清单</div>
          <el-table :data="selectedItems" border>
            <el-table-column label="商品信息" min-width="300">
              <template #default="{ row }">
                <div class="product-info">
                  <img
                    :src="row.productCoverImageUrl"
                    :alt="row.productName"
                    class="product-image"
                  />
                  <span class="product-name">{{ row.productName }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="单价" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.productPrice" />
              </template>
            </el-table-column>
            <el-table-column label="数量" width="100" align="center" prop="quantity" />
            <el-table-column label="小计" width="150" align="center">
              <template #default="{ row }">
                <MoneyText :amount="row.subtotal" />
              </template>
            </el-table-column>
          </el-table>
        </div>

        <!-- 备注 -->
        <div class="section remark-section">
          <div class="section-title">订单备注</div>
          <el-input
            v-model="remark"
            type="textarea"
            :rows="3"
            placeholder="选填，请先和商家协商一致"
            maxlength="200"
            show-word-limit
          />
        </div>

        <!-- 提交订单 -->
        <div class="section submit-section">
          <div class="total-info">
            <span class="label">商品总额：</span>
            <MoneyText :amount="totalAmount" />
          </div>
          <div class="total-info total">
            <span class="label">应付金额：</span>
            <MoneyText :amount="totalAmount" size="large" />
          </div>
          <el-button
            type="primary"
            size="large"
            :loading="submitting"
            :disabled="!selectedAddressId || selectedItems.length === 0"
            @click="handleSubmit"
          >
            提交订单
          </el-button>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getAddresses } from '@/api/address'
import { createOrder } from '@/api/order'
import { useCartStore } from '@/stores/cart'
import MoneyText from '@/components/MoneyText.vue'
import type { Address } from '@/types/address'

const router = useRouter()
const cartStore = useCartStore()

const loading = ref(false)
const submitting = ref(false)
const addresses = ref<Address[]>([])
const selectedAddressId = ref<number>()
const remark = ref('')

// 选中的购物车项
const selectedItems = computed(() => cartStore.selectedItems)

// 总金额
const totalAmount = computed(() => cartStore.totalAmount)

// 获取地址列表
const fetchAddresses = async () => {
  loading.value = true
  try {
    addresses.value = await getAddresses()
    // 默认选中默认地址
    const defaultAddress = addresses.value.find(addr => addr.isDefault)
    if (defaultAddress) {
      selectedAddressId.value = defaultAddress.id
    } else if (addresses.value.length > 0) {
      selectedAddressId.value = addresses.value[0].id
    }
  } catch (error: any) {
    ElMessage.error(error.message || '获取地址列表失败')
  } finally {
    loading.value = false
  }
}

// 去地址管理页面
const goToAddressManagement = () => {
  router.push('/user/address')
}

// 提交订单
const handleSubmit = async () => {
  if (!selectedAddressId.value) {
    ElMessage.warning('请选择收货地址')
    return
  }

  if (selectedItems.value.length === 0) {
    ElMessage.warning('请选择要购买的商品')
    return
  }

  submitting.value = true
  try {
    const orderNo = await createOrder({
      cartItemIds: selectedItems.value.map(item => item.id),
      addressId: selectedAddressId.value,
      remark: remark.value || undefined
    })
    
    ElMessage.success('订单创建成功')
    // 跳转到支付页面
    router.push(`/payment/${orderNo}`)
  } catch (error: any) {
    ElMessage.error(error.message || '创建订单失败')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  // 检查是否有选中的商品
  if (selectedItems.value.length === 0) {
    ElMessage.warning('请先选择要购买的商品')
    router.push('/cart')
    return
  }

  fetchAddresses()
})
</script>

<style scoped>
.order-confirm-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.confirm-card {
  border-radius: 8px;
}

.confirm-card h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.section {
  margin-bottom: 30px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.address-section {
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
}

.address-radio-group {
  width: 100%;
}

.address-radio {
  width: 100%;
  margin-right: 0 !important;
  margin-bottom: 15px;
  padding: 0;
}

.address-radio:last-child {
  margin-bottom: 0;
}

.address-card {
  flex: 1;
  padding: 15px;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
}

.address-radio.is-checked .address-card {
  border-color: #409eff;
  background-color: #ecf5ff;
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

.product-section {
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
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
}

.product-name {
  flex: 1;
  color: #303133;
}

.remark-section {
  padding-bottom: 30px;
  border-bottom: 1px solid #ebeef5;
}

.submit-section {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 15px;
}

.total-info {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.total-info.total {
  font-size: 18px;
  font-weight: 600;
  color: #f56c6c;
}

.total-info .label {
  color: #606266;
}

@media (max-width: 768px) {
  .submit-section {
    align-items: stretch;
  }
}
</style>
