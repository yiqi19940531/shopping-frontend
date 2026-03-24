<template>
  <div class="product-edit">
    <el-card v-loading="pageLoading">
      <template #header>
        <h3>编辑商品</h3>
      </template>

      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="120px"
        style="max-width: 800px"
      >
        <el-form-item label="商品名称" prop="name">
          <el-input
            v-model="form.name"
            placeholder="请输入商品名称"
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="分类" prop="categoryId">
          <el-select
            v-model="form.categoryId"
            placeholder="请选择分类"
            style="width: 100%"
          >
            <el-option
              v-for="cat in flatCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="品牌" prop="brand">
          <el-input
            v-model="form.brand"
            placeholder="请输入品牌"
            maxlength="100"
          />
        </el-form-item>

        <el-form-item label="价格(元)" prop="price">
          <el-input-number
            v-model="form.price"
            :precision="2"
            :min="0"
            :max="999999"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="原价(元)" prop="originalPrice">
          <el-input-number
            v-model="form.originalPrice"
            :precision="2"
            :min="0"
            :max="999999"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="库存" prop="stock">
          <el-input-number
            v-model="form.stock"
            :min="0"
            :max="999999"
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="主图" prop="coverImageId">
          <UploadImage v-model="form.coverImageId" />
        </el-form-item>

        <el-form-item label="商品图片" prop="imageFileIds">
          <div class="image-list">
            <UploadImage
              v-for="(id, index) in form.imageFileIds"
              :key="index"
              v-model="form.imageFileIds[index]"
              @update:model-value="handleImageChange(index, $event)"
            />
            <el-button
              v-if="form.imageFileIds.length < 5"
              type="primary"
              plain
              @click="addImage"
            >
              <el-icon><Plus /></el-icon>
              添加图片
            </el-button>
          </div>
        </el-form-item>

        <el-form-item label="商品描述" prop="description">
          <el-input
            v-model="form.description"
            type="textarea"
            :rows="4"
            placeholder="请输入商品描述"
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="详情" prop="detail">
          <el-input
            v-model="form.detail"
            type="textarea"
            :rows="6"
            placeholder="请输入商品详情"
          />
        </el-form-item>

        <el-form-item label="推荐" prop="isRecommend">
          <el-switch
            v-model="form.isRecommend"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>

        <el-form-item label="热门" prop="isHot">
          <el-switch
            v-model="form.isHot"
            :active-value="1"
            :inactive-value="0"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" :loading="submitting" @click="handleSubmit">
            提交
          </el-button>
          <el-button @click="handleCancel">
            取消
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getAdminProduct, updateProduct, type AdminProductForm } from '@/api/admin/product'
import { getCategories } from '@/api/product'
import type { Category } from '@/types/product'
import UploadImage from '@/components/UploadImage.vue'

const router = useRouter()
const route = useRoute()
const formRef = ref<FormInstance>()
const pageLoading = ref(false)
const submitting = ref(false)
const categories = ref<Category[]>([])
const productId = Number(route.params.id)

const form = reactive<AdminProductForm>({
  name: '',
  categoryId: undefined as any,
  brand: '',
  price: 0,
  originalPrice: undefined,
  stock: 0,
  coverImageId: '',
  imageFileIds: [],
  description: '',
  detail: '',
  isRecommend: 0,
  isHot: 0
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' }
  ]
}

const flatCategories = computed(() => {
  const flatten = (list: Category[], prefix = ''): Array<{ id: number; name: string }> => {
    const result: Array<{ id: number; name: string }> = []
    list.forEach(item => {
      result.push({
        id: item.id,
        name: prefix + item.name
      })
      if (item.children && item.children.length > 0) {
        result.push(...flatten(item.children, prefix + item.name + ' / '))
      }
    })
    return result
  }
  return flatten(categories.value)
})

const fetchCategories = async () => {
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类失败')
  }
}

const fetchProductDetail = async () => {
  pageLoading.value = true
  try {
    const res = await getAdminProduct(productId)
    const product = res.data
    
    form.name = product.name
    form.categoryId = product.categoryId
    form.brand = product.brand || ''
    form.price = product.price
    form.originalPrice = product.originalPrice
    form.stock = product.stock
    form.coverImageId = product.coverImageId || ''
    form.imageFileIds = product.imageFileIds || []
    form.description = product.description || ''
    form.detail = product.detail || ''
    form.isRecommend = product.isRecommend || 0
    form.isHot = product.isHot || 0
  } catch (error) {
    ElMessage.error('获取商品详情失败')
    router.back()
  } finally {
    pageLoading.value = false
  }
}

const addImage = () => {
  if (form.imageFileIds.length < 5) {
    form.imageFileIds.push('')
  }
}

const handleImageChange = (index: number, value: string) => {
  if (!value && form.imageFileIds.length > 0) {
    form.imageFileIds.splice(index, 1)
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    submitting.value = true
    try {
      // 过滤掉空的图片ID
      const submitData = {
        ...form,
        imageFileIds: form.imageFileIds.filter(id => id)
      }
      
      await updateProduct(productId, submitData)
      ElMessage.success('更新成功')
      router.push('/admin/products')
    } catch (error) {
      ElMessage.error('更新失败')
    } finally {
      submitting.value = false
    }
  })
}

const handleCancel = () => {
  router.back()
}

onMounted(async () => {
  await fetchCategories()
  await fetchProductDetail()
})
</script>

<style scoped>
.product-edit {
  padding: 20px;
}

.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
</style>
