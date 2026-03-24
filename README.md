# Shopping Frontend

一个基于 Vue 3 + TypeScript 的电商前端项目，提供完整的购物体验和后台管理功能。

## 技术栈

- **前端框架**: Vue 3 + Composition API
- **开发语言**: TypeScript
- **构建工具**: Vite
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由管理**: Vue Router 4
- **HTTP 客户端**: Axios

## 功能特性

### 前台用户端

- 用户注册/登录认证
- 商品浏览与搜索
- 商品分类筛选
- 购物车管理
- 订单创建与管理
- 收货地址管理
- 用户个人中心

### 后台管理端

- 仪表盘数据概览
- 商品管理（增删改查）
- 分类管理
- 订单管理
- 数据统计分析

## 项目结构

```
src/
├── api/           # API 接口定义
├── assets/        # 静态资源
├── components/    # 公共组件
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型定义
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发环境运行

```bash
pnpm dev
```

### 生产环境构建

```bash
pnpm build
```

### 类型检查

```bash
pnpm typecheck
```

## 环境配置

- `.env.development` - 开发环境配置
- `.env.production` - 生产环境配置

## 浏览器支持

- Chrome >= 80
- Firefox >= 75
- Safari >= 13
- Edge >= 80

## 许可证

MIT
