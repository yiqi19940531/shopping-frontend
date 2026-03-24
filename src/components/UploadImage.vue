<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { getUploadAction, getUploadHeaders, getFileUrl } from '@/api/file'
import type { UploadProps } from 'element-plus'

interface Props {
  modelValue: string
  multiple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  multiple: false
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const beforeUpload: UploadProps['beforeUpload'] = (file) => {
  const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)
  const isLt5M = file.size / 1024 / 1024 < 5

  if (!isValidType) {
    ElMessage.error('只能上传 JPG/PNG/GIF/WEBP 格式的图片!')
    return false
  }
  if (!isLt5M) {
    ElMessage.error('图片大小不能超过 5MB!')
    return false
  }
  return true
}

const handleSuccess: UploadProps['onSuccess'] = (response) => {
  if (response.data && response.data.fileId) {
    emit('update:modelValue', response.data.fileId)
    ElMessage.success('上传成功')
  }
}

const handleError: UploadProps['onError'] = () => {
  ElMessage.error('上传失败')
}
</script>

<template>
  <div class="upload-image">
    <el-upload
      :action="getUploadAction()"
      :headers="getUploadHeaders()"
      :before-upload="beforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
      :show-file-list="false"
      list-type="picture-card"
      :limit="props.multiple ? undefined : 1"
    >
      <template v-if="props.modelValue">
        <el-image
          :src="getFileUrl(props.modelValue)"
          fit="cover"
          style="width: 100%; height: 100%"
          :preview-src-list="[getFileUrl(props.modelValue)]"
        />
      </template>
      <template v-else>
        <el-icon class="upload-icon"><Plus /></el-icon>
      </template>
    </el-upload>
  </div>
</template>

<style scoped>
.upload-image :deep(.el-upload) {
  width: 148px;
  height: 148px;
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: border-color 0.3s;
}

.upload-image :deep(.el-upload:hover) {
  border-color: var(--primary-color);
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
}
</style>
