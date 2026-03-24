<template>
  <div class="category-manage">
    <div class="toolbar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增分类
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="categories"
      row-key="id"
      :tree-props="{ children: 'children' }"
      border
    >
      <el-table-column prop="id" label="ID" width="80" />
      <el-table-column prop="name" label="分类名称" />
      <el-table-column label="操作" width="200" align="center">
        <template #default="{ row }">
          <el-button link type="primary" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="danger" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加/编辑分类对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="500px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="form"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入分类名称" />
        </el-form-item>

        <el-form-item label="父级分类" prop="parentId">
          <el-select
            v-model="form.parentId"
            placeholder="请选择父级分类"
            clearable
            style="width: 100%"
          >
            <el-option label="顶级分类" :value="0" />
            <el-option
              v-for="cat in flatCategories"
              :key="cat.id"
              :label="cat.name"
              :value="cat.id"
              :disabled="isCurrentOrChild(cat.id)"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="排序" prop="sortOrder">
          <el-input-number
            v-model="form.sortOrder"
            :min="0"
            :max="9999"
            style="width: 100%"
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
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getCategories } from '@/api/product'
import { createCategory, updateCategory, deleteCategory, type CategoryForm } from '@/api/admin/category'
import type { Category } from '@/types/product'

const loading = ref(false)
const categories = ref<Category[]>([])
const dialogVisible = ref(false)
const dialogTitle = ref('')
const submitting = ref(false)
const formRef = ref<FormInstance>()
const editingId = ref<number | null>(null)

const form = reactive<CategoryForm>({
  name: '',
  parentId: 0,
  sortOrder: 0
})

const rules: FormRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' }
  ]
}

// 扁平化分类列表用于父级选择
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

// 判断是否是当前编辑项或其子项
const isCurrentOrChild = (id: number): boolean => {
  if (!editingId.value) return false
  if (id === editingId.value) return true
  
  const findChildren = (list: Category[], targetId: number): number[] => {
    const ids: number[] = []
    list.forEach(item => {
      if (item.id === targetId) {
        const collectIds = (cat: Category): void => {
          ids.push(cat.id)
          if (cat.children) {
            cat.children.forEach(collectIds)
          }
        }
        collectIds(item)
      } else if (item.children) {
        ids.push(...findChildren(item.children, targetId))
      }
    })
    return ids
  }
  
  const childIds = findChildren(categories.value, editingId.value)
  return childIds.includes(id)
}

const fetchCategories = async () => {
  loading.value = true
  try {
    const res = await getCategories()
    categories.value = res.data
  } catch (error) {
    ElMessage.error('获取分类列表失败')
  } finally {
    loading.value = false
  }
}

const handleAdd = () => {
  editingId.value = null
  dialogTitle.value = '新增分类'
  dialogVisible.value = true
}

const handleEdit = (row: Category) => {
  editingId.value = row.id
  dialogTitle.value = '编辑分类'
  form.name = row.name
  form.parentId = row.parentId || 0
  form.sortOrder = row.sortOrder || 0
  dialogVisible.value = true
}

const handleDelete = async (row: Category) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除分类"${row.name}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await deleteCategory(row.id)
    ElMessage.success('删除成功')
    await fetchCategories()
  } catch (error: any) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSubmit = async () => {
  if (!formRef.value) return
  
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    
    submitting.value = true
    try {
      if (editingId.value) {
        await updateCategory(editingId.value, form)
        ElMessage.success('更新成功')
      } else {
        await createCategory(form)
        ElMessage.success('创建成功')
      }
      
      dialogVisible.value = false
      await fetchCategories()
    } catch (error) {
      ElMessage.error(editingId.value ? '更新失败' : '创建失败')
    } finally {
      submitting.value = false
    }
  })
}

const resetForm = () => {
  formRef.value?.resetFields()
  form.name = ''
  form.parentId = 0
  form.sortOrder = 0
  editingId.value = null
}

onMounted(() => {
  fetchCategories()
})
</script>

<style scoped>
.category-manage {
  padding: 20px;
}

.toolbar {
  margin-bottom: 20px;
}
</style>
