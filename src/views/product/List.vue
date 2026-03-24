<template>
  <div class="product-list-container" v-loading="loading">
    <div class="page-container">
      <!-- 搜索栏 -->
      <div class="search-bar">
        <el-input
          v-model="searchParams.keyword"
          placeholder="搜索商品"
          clearable
          size="large"
          @keyup.enter="handleSearch"
        >
          <template #suffix>
            <el-icon class="search-icon" @click="handleSearch">
              <Search />
            </el-icon>
          </template>
        </el-input>
      </div>

      <div class="content-wrapper">
        <!-- 左侧分类 -->
        <aside class="category-sidebar">
          <div class="category-title">商品分类</div>
          <ul class="category-list">
            <li
              class="category-item"
              :class="{ active: !searchParams.categoryId }"
              @click="handleCategoryChange(undefined)"
            >
              全部分类
            </li>
            <li
              v-for="category in categories"
              :key="category.id"
              class="category-item"
              :class="{ active: searchParams.categoryId === category.id }"
              @click="handleCategoryChange(category.id)"
            >
              {{ category.name }}
            </li>
          </ul>
        </aside>

        <!-- 右侧商品列表 -->
        <main class="product-main">
          <!-- 排序选项 -->
          <div class="sort-bar">
            <el-radio-group v-model="sortType" @change="handleSortChange">
              <el-radio-button label="default">综合</el-radio-button>
              <el-radio-button label="priceAsc">价格升序</el-radio-button>
              <el-radio-button label="priceDesc">价格降序</el-radio-button>
              <el-radio-button label="sales">销量</el-radio-button>
            </el-radio-group>
          </div>

          <!-- 商品网格 -->
          <div v-if="products.length > 0" class="product-grid">
            <el-row :gutter="20">
              <el-col
                v-for="product in products"
                :key="product.id"
                :span="6"
                :xs="12"
              >
                <ProductCard :product="product" />
              </el-col>
            </el-row>
          </div>
          <el-empty v-else description="暂无商品" />

          <!-- 分页 -->
          <div v-if="total > 0" class="pagination-wrapper">
            <AppPagination
              :total="total"
              :page="searchParams.pageNum"
              :page-size="searchParams.pageSize"
              @update:page="handlePageChange"
              @update:page-size="handlePageSizeChange"
            />
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { getCategories, getProducts } from '@/api/product'
import ProductCard from '@/components/ProductCard.vue'
import AppPagination from '@/components/AppPagination.vue'
import type { Category, ProductVO, ProductSearchParams } from '@/types/product'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const categories = ref<Category[]>([])
const products = ref<ProductVO[]>([])
const total = ref(0)
const sortType = ref('default')

const searchParams = reactive<ProductSearchParams & { pageNum: number; pageSize: number }>({
  keyword: (route.query.keyword as string) || '',
  categoryId: route.query.categoryId ? Number(route.query.categoryId) : undefined,
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  sortBy: (route.query.sortBy as string) || undefined,
  sortOrder: (route.query.sortOrder as 'ASC' | 'DESC') || undefined,
  pageNum: route.query.pageNum ? Number(route.query.pageNum) : 1,
  pageSize: route.query.pageSize ? Number(route.query.pageSize) : 20
})

// 初始化排序类型
if (searchParams.sortBy === 'price' && searchParams.sortOrder === 'ASC') {
  sortType.value = 'priceAsc'
} else if (searchParams.sortBy === 'price' && searchParams.sortOrder === 'DESC') {
  sortType.value = 'priceDesc'
} else if (searchParams.sortBy === 'sales') {
  sortType.value = 'sales'
}

// 获取分类列表
const fetchCategories = async () => {
  try {
    categories.value = await getCategories()
  } catch (error: any) {
    ElMessage.error(error.message || '获取分类失败')
  }
}

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  try {
    const res = await getProducts(searchParams)
    products.value = res.records
    total.value = res.total
  } catch (error: any) {
    ElMessage.error(error.message || '获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 更新路由查询参数
const updateQuery = () => {
  const query: any = {}
  if (searchParams.keyword) query.keyword = searchParams.keyword
  if (searchParams.categoryId) query.categoryId = searchParams.categoryId
  if (searchParams.minPrice) query.minPrice = searchParams.minPrice
  if (searchParams.maxPrice) query.maxPrice = searchParams.maxPrice
  if (searchParams.sortBy) query.sortBy = searchParams.sortBy
  if (searchParams.sortOrder) query.sortOrder = searchParams.sortOrder
  if (searchParams.pageNum !== 1) query.pageNum = searchParams.pageNum
  if (searchParams.pageSize !== 20) query.pageSize = searchParams.pageSize
  
  router.push({ query })
}

// 处理搜索
const handleSearch = () => {
  searchParams.pageNum = 1
  updateQuery()
}

// 处理分类切换
const handleCategoryChange = (categoryId?: number) => {
  searchParams.categoryId = categoryId
  searchParams.pageNum = 1
  updateQuery()
}

// 处理排序切换
const handleSortChange = (value: string) => {
  searchParams.pageNum = 1
  switch (value) {
    case 'priceAsc':
      searchParams.sortBy = 'price'
      searchParams.sortOrder = 'ASC'
      break
    case 'priceDesc':
      searchParams.sortBy = 'price'
      searchParams.sortOrder = 'DESC'
      break
    case 'sales':
      searchParams.sortBy = 'sales'
      searchParams.sortOrder = 'DESC'
      break
    default:
      searchParams.sortBy = undefined
      searchParams.sortOrder = undefined
  }
  updateQuery()
}

// 处理分页
const handlePageChange = (page: number) => {
  searchParams.pageNum = page
  updateQuery()
}

const handlePageSizeChange = (pageSize: number) => {
  searchParams.pageSize = pageSize
  searchParams.pageNum = 1
  updateQuery()
}

// 监听路由变化
watch(
  () => route.query,
  () => {
    searchParams.keyword = (route.query.keyword as string) || ''
    searchParams.categoryId = route.query.categoryId ? Number(route.query.categoryId) : undefined
    searchParams.minPrice = route.query.minPrice ? Number(route.query.minPrice) : undefined
    searchParams.maxPrice = route.query.maxPrice ? Number(route.query.maxPrice) : undefined
    searchParams.sortBy = (route.query.sortBy as string) || undefined
    searchParams.sortOrder = (route.query.sortOrder as 'ASC' | 'DESC') || undefined
    searchParams.pageNum = route.query.pageNum ? Number(route.query.pageNum) : 1
    searchParams.pageSize = route.query.pageSize ? Number(route.query.pageSize) : 20
    
    fetchProducts()
  }
)

onMounted(() => {
  fetchCategories()
  fetchProducts()
})
</script>

<style scoped>
.product-list-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.search-bar {
  margin-bottom: 20px;
}

.search-icon {
  cursor: pointer;
  font-size: 18px;
}

.content-wrapper {
  display: flex;
  gap: 20px;
}

.category-sidebar {
  width: 200px;
  flex-shrink: 0;
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.category-title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
}

.category-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.category-item {
  padding: 10px 15px;
  cursor: pointer;
  border-radius: 4px;
  color: #606266;
  transition: all 0.3s;
}

.category-item:hover {
  background-color: #ecf5ff;
  color: #409eff;
}

.category-item.active {
  background-color: #409eff;
  color: #fff;
}

.product-main {
  flex: 1;
  min-width: 0;
}

.sort-bar {
  background-color: #fff;
  padding: 15px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.product-grid {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .content-wrapper {
    flex-direction: column;
  }
  
  .category-sidebar {
    width: 100%;
  }
}
</style>
