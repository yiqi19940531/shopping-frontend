<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useCartStore } from '@/stores/cart'
import { useUserStore } from '@/stores/user'
import { ShoppingCart, Search, User, ArrowDown } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()
const cartStore = useCartStore()
const userStore = useUserStore()

const searchKeyword = ref('')

const isLoggedIn = computed(() => authStore.isLoggedIn)
const cartCount = computed(() => cartStore.cartCount)
const nickname = computed(() => userStore.nickname)
const isAdmin = computed(() => userStore.isAdmin)

const handleCommand = (command: string) => {
  if (command === 'logout') {
    handleLogout()
  } else {
    router.push(command)
  }
}

const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    router.push(`/products?keyword=${encodeURIComponent(searchKeyword.value.trim())}`)
  }
}

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

onMounted(() => {
  if (isLoggedIn.value) {
    cartStore.fetchCart()
  }
})
</script>

<template>
  <div class="layout">
    <header class="header">
      <div class="header-content">
        <div class="header-left">
          <router-link to="/" class="logo">购物商城</router-link>
        </div>
        
        <div class="header-center">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索商品"
            class="search-input"
            @keyup.enter="handleSearch"
          >
            <template #suffix>
              <el-icon class="search-icon" @click="handleSearch">
                <Search />
              </el-icon>
            </template>
          </el-input>
        </div>
        
        <div class="header-right">
          <template v-if="isLoggedIn">
            <router-link to="/cart" class="cart-link">
              <el-badge :value="cartCount" :hidden="cartCount === 0">
                <el-icon :size="24">
                  <ShoppingCart />
                </el-icon>
              </el-badge>
            </router-link>
            
            <el-dropdown @command="handleCommand">
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                <span class="nickname">{{ nickname }}</span>
                <el-icon><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="/order/list">我的订单</el-dropdown-item>
                  <el-dropdown-item command="/user/profile">个人中心</el-dropdown-item>
                  <el-dropdown-item command="/user/address">地址管理</el-dropdown-item>
                  <el-dropdown-item v-if="isAdmin" command="/admin">管理后台</el-dropdown-item>
                  <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </template>
          
          <template v-else>
            <router-link to="/login" class="auth-link">登录</router-link>
            <router-link to="/register" class="auth-link">注册</router-link>
          </template>
        </div>
      </div>
    </header>
    
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--header-height);
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.header-content {
  max-width: var(--content-width);
  height: 100%;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  flex-shrink: 0;
}

.logo {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.header-center {
  flex: 1;
  max-width: 500px;
  margin: 0 40px;
}

.search-input {
  width: 100%;
}

.search-icon {
  cursor: pointer;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 20px;
}

.cart-link {
  display: flex;
  align-items: center;
  cursor: pointer;
  color: var(--text-primary);
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  color: var(--text-primary);
}

.nickname {
  font-size: 14px;
}

.auth-link {
  color: var(--text-primary);
  font-size: 14px;
}

.auth-link:hover {
  color: var(--primary-color);
}

.main-content {
  margin-top: var(--header-height);
  min-height: calc(100vh - var(--header-height));
}
</style>
