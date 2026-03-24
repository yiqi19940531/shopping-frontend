<template>
  <div class="profile-container" v-loading="loading">
    <div class="page-container">
      <el-card class="profile-card">
        <template #header>
          <h2>个人资料</h2>
        </template>

        <div v-if="userStore.userInfo" class="profile-content">
          <el-descriptions :column="1" border size="large">
            <el-descriptions-item label="用户名">
              {{ userStore.userInfo.username }}
            </el-descriptions-item>
            <el-descriptions-item label="昵称">
              {{ userStore.userInfo.nickname || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="手机号">
              {{ userStore.userInfo.phone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="邮箱">
              {{ userStore.userInfo.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="角色">
              <el-tag :type="userStore.isAdmin ? 'danger' : 'primary'">
                {{ userStore.isAdmin ? '管理员' : '普通用户' }}
              </el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const loading = ref(false)

// 获取用户信息
const fetchUserInfo = async () => {
  if (userStore.userInfo) return

  loading.value = true
  try {
    await userStore.fetchUserInfo()
  } catch (error: any) {
    ElMessage.error(error.message || '获取用户信息失败')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-container {
  min-height: calc(100vh - 60px);
  background-color: #f5f5f5;
  padding: 20px 0;
}

.page-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.profile-card {
  border-radius: 8px;
}

.profile-card h2 {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.profile-content {
  padding: 20px 0;
}
</style>
