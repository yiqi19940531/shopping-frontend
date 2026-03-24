<template>
  <div class="address-container" v-loading="loading">
    <div class="page-container">
      <el-card class="address-card">
        <template #header>
          <div class="card-header">
            <h2>收货地址管理</h2>
            <el-button
              type="primary"
              :disabled="addresses.length >= MAX_ADDRESS_COUNT"
              @click="handleAdd"
            >
              <el-icon><Plus /></el-icon>
              新增地址
            </el-button>
          </div>
        </template>

        <!-- 地址列表 -->
        <div v-if="addresses.length > 0" class="address-list">
          <el-card
            v-for="address in addresses"
            :key="address.id"
            class="address-item"
            shadow="hover"
          >
            <div class="address-header">
              <div class="receiver-info">
                <span class="receiver-name">{{ address.receiverName }}</span>
                <span class="receiver-phone">{{ address.receiverPhone }}</span>
                <el-tag v-if="address.isDefault" type="danger" size="small">
                  默认
                </el-tag>
              </div>
              <div class="address-actions">
                <el-button type="primary" link @click="handleEdit(address)">
                  编辑
                </el-button>
                <el-button
                  v-if="!address.isDefault"
                  type="warning"
                  link
                  @click="handleSetDefault(address.id)"
                >
                  设为默认
                </el-button>
                <el-button
                  type="danger"
                  link
                  @click="handleDelete(address.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
            <div class="address-detail">
              {{ address.province }} {{ address.city }} {{ address.district }} {{ address.detailAddress }}
            </div>
          </el-card>
        </div>
        <el-empty v-else description="暂无收货地址">
          <el-button type="primary" @click="handleAdd">
            添加地址
          </el-button>
        </el-empty>

        <!-- 提示信息 -->
        <div v-if="addresses.length >= MAX_ADDRESS_COUNT" class="tip-message">
          <el-alert
            title="最多只能添加10个收货地址"
            type="warning"
            :closable="false"
          />
        </div>
      </el-card>
    </div>

    <!-- 新增/编辑地址对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑地址' : '新增地址'"
      width="600px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="90px"
      >
        <el-form-item label="收货人" prop="receiverName">
          <el-input
            v-model="form.receiverName"
            placeholder="请输入收货人姓名"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="receiverPhone">
          <el-input
            v-model="form.receiverPhone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="省份" prop="province">
          <el-input
            v-model="form.province"
            placeholder="请输入省份"
            clearable
          />
        </el-form-item>
        <el-form-item label="城市" prop="city">
          <el-input
            v-model="form.city"
            placeholder="请输入城市"
            clearable
          />
        </el-form-item>
        <el-form-item label="区/县" prop="district">
          <el-input
            v-model="form.district"
            placeholder="请输入区/县"
            clearable
          />
        </el-form-item>
        <el-form-item label="详细地址" prop="detailAddress">
          <el-input
            v-model="form.detailAddress"
            type="textarea"
            :rows="3"
            placeholder="请输入详细地址"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getAddresses,
  createAddress,
  updateAddress,
  setDefaultAddress,
  deleteAddress
} from '@/api/address'
import type { Address, AddressForm } from '@/types/address'

const MAX_ADDRESS_COUNT = 10

const loading = ref(false)
const submitting = ref(false)
const dialogVisible = ref(false)
const isEdit = ref(false)
const addresses = ref<Address[]>([])
const formRef = ref<FormInstance>()

const form = reactive<AddressForm & { id?: number }>({
  receiverName: '',
  receiverPhone: '',
  province: '',
  city: '',
  district: '',
  detailAddress: ''
})

// 手机号验证
const validatePhone = (rule: any, value: string, callback: any) => {
  if (!value) {
    callback(new Error('请输入手机号'))
  } else if (!/^1[3-9]\d{9}$/.test(value)) {
    callback(new Error('请输入正确的手机号'))
  } else {
    callback()
  }
}

const rules: FormRules = {
  receiverName: [
    { required: true, message: '请输入收货人姓名', trigger: 'blur' }
  ],
  receiverPhone: [
    { required: true, validator: validatePhone, trigger: 'blur' }
  ],
  province: [
    { required: true, message: '请输入省份', trigger: 'blur' }
  ],
  city: [
    { required: true, message: '请输入城市', trigger: 'blur' }
  ],
  district: [
    { required: true, message: '请输入区/县', trigger: 'blur' }
  ],
  detailAddress: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ]
}

// 获取地址列表
const fetchAddresses = async () => {
  loading.value = true
  try {
    addresses.value = await getAddresses()
  } catch (error: any) {
    ElMessage.error(error.message || '获取地址列表失败')
  } finally {
    loading.value = false
  }
}

// 重置表单
const resetForm = () => {
  form.id = undefined
  form.receiverName = ''
  form.receiverPhone = ''
  form.province = ''
  form.city = ''
  form.district = ''
  form.detailAddress = ''
  formRef.value?.clearValidate()
}

// 新增地址
const handleAdd = () => {
  if (addresses.value.length >= MAX_ADDRESS_COUNT) {
    ElMessage.warning(`最多只能添加${MAX_ADDRESS_COUNT}个收货地址`)
    return
  }
  isEdit.value = false
  resetForm()
  dialogVisible.value = true
}

// 编辑地址
const handleEdit = (address: Address) => {
  isEdit.value = true
  form.id = address.id
  form.receiverName = address.receiverName
  form.receiverPhone = address.receiverPhone
  form.province = address.province
  form.city = address.city
  form.district = address.district
  form.detailAddress = address.detailAddress
  dialogVisible.value = true
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      const { id, ...formData } = form
      if (isEdit.value && id) {
        await updateAddress(id, formData)
        ElMessage.success('更新地址成功')
      } else {
        await createAddress(formData)
        ElMessage.success('添加地址成功')
      }
      dialogVisible.value = false
      fetchAddresses()
    } catch (error: any) {
      ElMessage.error(error.message || '操作失败')
    } finally {
      submitting.value = false
    }
  })
}

// 设为默认地址
const handleSetDefault = async (id: number) => {
  try {
    await setDefaultAddress(id)
    ElMessage.success('设置成功')
    fetchAddresses()
  } catch (error: any) {
    ElMessage.error(error.message || '设置失败')
  }
}

// 删除地址
const handleDelete = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除该地址吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await deleteAddress(id)
    ElMessage.success('删除成功')
    fetchAddresses()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '删除失败')
    }
  }
}

onMounted(() => {
  fetchAddresses()
})
</script>

<style scoped>
.address-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.address-card {
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

.address-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.address-item {
  transition: all 0.3s;
}

.address-item:hover {
  transform: translateY(-2px);
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.receiver-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.receiver-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.receiver-phone {
  color: #606266;
}

.address-actions {
  display: flex;
  gap: 10px;
}

.address-detail {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.tip-message {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .address-list {
    grid-template-columns: 1fr;
  }
  
  .address-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .address-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
