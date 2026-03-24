<template>
  <div class="product-list">
    <div class="filter-bar">
      <el-form :inline="true" :model="searchParams">
        <el-form-item label="关键词">
          <el-input
            v-model="searchParams.keyword"
            placeholder="商品名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>

        <el-form-item label="分类">
          <el-select
            v-model="searchParams.categoryId"
            placeholder="请选择分类"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="cat in flatCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
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
          <el-button type="success" @click="handleCreate">
            <el-icon><Plus /></el-icon>
            新建商品
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-table
      v-loading="loading"
      :data="products"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      
      <el-table-column label="商品图片" width="100" align="center">
        <template #default="{ row }">
          <el-image
            v-if="row.coverImageUrl"
            :src="getFileUrl(row.coverImageUrl)"
            :preview-src-list="[getFileUrl(row.coverImageUrl)]"
            style="width: 60px; height: 60px"
            fit="cover"
          />
        </template>
      </el-table-column>

      <el-table-column prop="name" label="商品名称" min-width="200" />

      <el-table-column label="价格" width="120">
        <template #default="{ row }">
          <MoneyText :amount="row.price" />
        </template>
      </el-table-column>

      <el-table-column label="库存" width="150">
        <template #default="{ row }">
          <div class="stock-edit">
            <span v-if="!row.editing">{{ row.stock }}</span>
            <el-input-number
              v-else
              v-model="row.newStock"
              :min="0"
              size="small"
              style="width: 100px"
            />
            <el-button
              v-if="!row.editing"
              link
              type="primary"
              size="small"
              @click="startEditStock(row)"
            >
              <el-icon><Edit /></el-icon>
            </el-button>
            <template v-else>
              <el-button
                link
                type="success"
                size="small"
                @click="saveStock(row)"
              >
                <el-icon><Check /></el-icon>
              </el-button>
              <el-button
                link
                type="info"
                size="small"
                @click="cancelEditStock(row)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </template>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="sales" label="销量" width="100" />

      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-switch
            v-model="row.status"
            :active-value="1"
            :inactive-value="0"
            @change="handleStatusChange(row)"
          />
        </template>
      </el-table-column>

      <el-table-column label="操作" width="180" align="center" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row.id)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <AppPagination
      v-model:current-page="pagination.current"
      v-model:page-size="pagination.pageSize"
      :total="pagination.total"
      @change="fetchProducts"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, RefreshLeft, Plus, Edit, Check, Close } from '@element-plus/icons-vue'
import { getAdminProducts, deleteProduct, updateProductStatus, updateProductStock } from '@/api/admin/product'
import { getCategories } from '@/api/product'
import { getFileUrl } from '@/api/file'
import type { ProductVO, Category } from '@/types/product'
import MoneyText from '@/components/MoneyText.vue'
import AppPagination from '@/components/AppPagination.vue'

interface ProductRow extends ProductVO {
  editing?: boolean
  newStock?: number
}

const router = useRouter()
const loading = ref(false)
const products = ref<ProductRow[]>([])
const categories = ref<Category[]>([])

const searchParams = reactive({
  keyword: '',
  categoryId: undefined as number | undefined
})

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0
})

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

const fetchProducts = async () => {
  loading.value = true
  try {
    const params = {
      ...searchParams,
      pageNum: pagination.current,
      pageSize: pagination.pageSize
    }
    const res = await getAdminProducts(params)
    products.value = res.data.records.map(item => ({
      ...item,
      editing: false,
      newStock: item.stock
    }))
    pagination.total = res.data.total
    pagination.current = res.data.current
  } catch (error) {
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  pagination.current = 1
  fetchProducts()
}

const handleReset = () => {
  searchParams.keyword = ''
  searchParams.categoryId = undefined
  pagination.current = 1
  fetchProducts()
}

const handleCreate = () => {
  router.push('/admin/products/create')
}

const handleEdit = (id: number) => {
  router.push(`/admin/products/${id}/edit`)
}

const handleDelete = async (row: ProductRow) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除商品"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteProduct(row.id)
    ElMessage.success('删除成功')
    await fetchProducts()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleStatusChange = async (row: ProductRow) => {
  try {
    await updateProductStatus(row.id, row.status)
    ElMessage.success('状态更新成功')
  } catch (error) {
    ElMessage.error('状态更新失败')
    row.status = row.status === 1 ? 0 : 1
  }
}

const startEditStock = (row: ProductRow) => {
  row.editing = true
  row.newStock = row.stock
}

const cancelEditStock = (row: ProductRow) => {
  row.editing = false
  row.newStock = row.stock
}

const saveStock = async (row: ProductRow) => {
  try {
    await updateProductStock(row.id, row.newStock!)
    row.stock = row.newStock!
    row.editing = false
    ElMessage.success('库存更新成功')
  } catch (error) {
    ElMessage.error('库存更新失败')
  }
}

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.product-list {
  padding: 20px;
}

.filter-bar {
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 4px;
}

.stock-edit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
}
</style>
