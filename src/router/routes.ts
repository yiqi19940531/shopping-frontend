import type { RouteRecordRaw } from 'vue-router'
import Layout from '@/layouts/Layout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'

const routes: RouteRecordRaw[] = [
  // ========== 前台路由 ==========
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', name: 'Home', component: () => import('@/views/Home.vue'), meta: { title: '首页' } },
      { path: 'login', name: 'Login', component: () => import('@/views/Login.vue'), meta: { title: '登录' } },
      { path: 'register', name: 'Register', component: () => import('@/views/Register.vue'), meta: { title: '注册' } },
      { path: 'products', name: 'ProductList', component: () => import('@/views/product/List.vue'), meta: { title: '商品列表' } },
      { path: 'products/:id', name: 'ProductDetail', component: () => import('@/views/product/Detail.vue'), meta: { title: '商品详情' } },
      { path: 'cart', name: 'Cart', component: () => import('@/views/cart/Index.vue'), meta: { title: '购物车', requiresAuth: true } },
      { path: 'order/confirm', name: 'OrderConfirm', component: () => import('@/views/order/Confirm.vue'), meta: { title: '确认订单', requiresAuth: true } },
      { path: 'order/list', name: 'OrderList', component: () => import('@/views/order/List.vue'), meta: { title: '我的订单', requiresAuth: true } },
      { path: 'order/:orderNo', name: 'OrderDetail', component: () => import('@/views/order/Detail.vue'), meta: { title: '订单详情', requiresAuth: true } },
      { path: 'payment/:orderNo', name: 'Payment', component: () => import('@/views/payment/Index.vue'), meta: { title: '支付', requiresAuth: true } },
      { path: 'user/profile', name: 'UserProfile', component: () => import('@/views/user/Profile.vue'), meta: { title: '个人信息', requiresAuth: true } },
      { path: 'user/address', name: 'UserAddress', component: () => import('@/views/user/Address.vue'), meta: { title: '地址管理', requiresAuth: true } },
    ],
  },
  // ========== 后台路由 ==========
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    redirect: '/admin/dashboard',
    children: [
      { path: 'dashboard', name: 'AdminDashboard', component: () => import('@/views/admin/Dashboard.vue'), meta: { title: '管理后台' } },
      { path: 'products', name: 'AdminProductList', component: () => import('@/views/admin/product/List.vue'), meta: { title: '商品管理' } },
      { path: 'products/create', name: 'AdminProductCreate', component: () => import('@/views/admin/product/Create.vue'), meta: { title: '新建商品' } },
      { path: 'products/:id/edit', name: 'AdminProductEdit', component: () => import('@/views/admin/product/Edit.vue'), meta: { title: '编辑商品' } },
      { path: 'categories', name: 'AdminCategories', component: () => import('@/views/admin/category/Index.vue'), meta: { title: '分类管理' } },
      { path: 'orders', name: 'AdminOrderList', component: () => import('@/views/admin/order/List.vue'), meta: { title: '订单管理' } },
      { path: 'orders/:orderNo', name: 'AdminOrderDetail', component: () => import('@/views/admin/order/Detail.vue'), meta: { title: '订单详情' } },
    ],
  },
  // 404
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default routes
