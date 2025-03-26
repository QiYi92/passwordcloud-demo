<script setup lang="ts">
import { useColumns } from "./columns";

const {
  loading,
  columns,
  dataList,
  pagination,
  loadingConfig,
  adaptiveConfig,
  searchField,
  searchQuery,
  fetchData
} = useColumns();
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择字段"
        style="width: 180px; margin-right: 10px"
      >
        <el-option label="用户名" value="username" />
        <el-option label="真实姓名" value="real_name" />
        <el-option label="登录IP" value="login_ip" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入关键词"
        style="width: 300px; margin-right: 10px"
      />
    </div>

    <!-- 表格 -->
    <div style="overflow-x: auto">
      <pure-table
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="id"
        alignWhole="center"
        showOverflowTooltip
        :loading="loading"
        :loading-config="loadingConfig"
        :data="
          dataList.slice(
            (pagination.currentPage - 1) * pagination.pageSize,
            pagination.currentPage * pagination.pageSize
          )
        "
        :columns="columns"
        :pagination="pagination"
      />
    </div>
  </div>
</template>
