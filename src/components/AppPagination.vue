<script setup lang="ts">
interface Props {
  total: number
  page: number
  pageSize?: number
  pageSizes?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  pageSize: 10,
  pageSizes: () => [10, 20, 50]
})

const emit = defineEmits<{
  'update:page': [page: number]
  'update:pageSize': [pageSize: number]
  'change': []
}>()

const handleCurrentChange = (page: number) => {
  emit('update:page', page)
  emit('change')
}

const handleSizeChange = (pageSize: number) => {
  emit('update:pageSize', pageSize)
  emit('change')
}
</script>

<template>
  <div class="app-pagination">
    <el-pagination
      background
      layout="total, sizes, prev, pager, next, jumper"
      :total="props.total"
      :current-page="props.page"
      :page-size="props.pageSize"
      :page-sizes="props.pageSizes"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<style scoped>
.app-pagination {
  text-align: center;
  margin-top: 20px;
}
</style>
