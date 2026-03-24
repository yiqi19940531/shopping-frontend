<script setup lang="ts">
import { ORDER_STATUS_MAP, ORDER_STATUS_TYPE_MAP } from '@/utils/constants'

interface Props {
  status: string
}

const props = defineProps<Props>()
</script>

<template>
  <el-tag :type="ORDER_STATUS_TYPE_MAP[props.status]" size="small">
    {{ ORDER_STATUS_MAP[props.status] || props.status }}
  </el-tag>
</template>
