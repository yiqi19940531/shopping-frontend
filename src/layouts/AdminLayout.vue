<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'
import { Odometer, Goods, Menu as IconMenu, Document } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const currentTitle = computed(() => route.meta.title as string || '管理后台')
const adminNickname = computed(() => userStore.nickname)

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const handleBackToFront = () => {
  router.push('/')
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="220px" class="aside">
      <div class="logo-area">商城管理后台</div>
      <el-menu
        :default-active="route.path"
        mode="vertical"
        router
      >
        <el-menu-item index="/admin/dashboard">
          <el-icon><Odometer /></el-icon>
          <span>仪表板</span>
        </el-menu-item>
        <el-menu-item index="/admin/products">
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/categories">
          <el-icon><IconMenu /></el-icon>
          <span>分类管理</span>
        </el-menu-item>
        <el-menu-item index="/admin/orders">
          <el-icon><Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    
    <el-container>
      <el-header class="header">
        <div class="header-left">
          <h2 class="title">{{ currentTitle }}</h2>
        </div>
        <div class="header-right">
          <span class="admin-name">{{ adminNickname }}</span>
          <el-button type="primary" size="small" @click="handleLogout">退出登录</el-button>
          <a href="javascript:void(0)" class="back-link" @click="handleBackToFront">返回前台</a>
        </div>
      </el-header>
      
      <el-main class="main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style scoped>
.admin-layout {
  height: 100vh;
}

.aside {
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
}

.logo-area {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
  border-bottom: 1px solid #e6e6e6;
}

.el-menu {
  border-right: none;
}

.header {
  height: 60px;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-left {
  flex: 1;
}

.title {
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-primary);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 15px;
}

.admin-name {
  font-size: 14px;
  color: var(--text-regular);
}

.back-link {
  font-size: 14px;
  color: var(--primary-color);
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.main {
  padding: 20px;
  background: #f5f5f5;
}
</style>
