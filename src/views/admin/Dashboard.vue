<template>
  <div class="dashboard">
    <div class="welcome">
      <h2>欢迎回来，管理员</h2>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" class="stat-icon" color="#409EFF">
              <Goods />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">商品总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" class="stat-icon" color="#67C23A">
              <ShoppingCart />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">订单总数</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" class="stat-icon" color="#E6A23C">
              <TrendCharts />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">今日订单</div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <el-icon :size="40" class="stat-icon" color="#F56C6C">
              <Box />
            </el-icon>
            <div class="stat-info">
              <div class="stat-value">--</div>
              <div class="stat-label">待发货订单</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { Goods, ShoppingCart, TrendCharts, Box } from '@element-plus/icons-vue'
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.welcome {
  margin-bottom: 30px;
}

.welcome h2 {
  margin: 0;
  color: #303133;
  font-size: 24px;
  font-weight: 500;
}

.stats-row {
  margin-top: 20px;
}

.stat-card {
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 10px;
}

.stat-icon {
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}
</style>
