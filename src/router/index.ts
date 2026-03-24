import { createRouter, createWebHistory } from 'vue-router'
import { ElMessage } from 'element-plus'
import routes from './routes'
import { useAuthStore } from '@/stores/auth'
import { useUserStore } from '@/stores/user'

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach(async (to, _from) => {
  const authStore = useAuthStore()
  const userStore = useUserStore()

  // 需要登录但未登录 → 跳登录页
  const requiresAuth = to.matched.some((r) => r.meta.requiresAuth)
  if (requiresAuth && !authStore.isLoggedIn) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // 已登录但无用户信息 → 拉取
  if (authStore.isLoggedIn && !userStore.userInfo) {
    try {
      await userStore.fetchUserInfo()
    } catch {
      authStore.logout()
      return { path: '/login', query: { redirect: to.fullPath } }
    }
  }

  // 需要管理员但角色不符
  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  if (requiresAdmin && !userStore.isAdmin) {
    ElMessage.error('没有管理员权限')
    return '/'
  }

  // 已登录访问登录/注册页 → 回首页
  if (authStore.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
    return '/'
  }
})

router.afterEach((to) => {
  const title = (to.meta.title as string) || ''
  document.title = title ? `${title} - 购物商城` : '购物商城'
})

export default router
