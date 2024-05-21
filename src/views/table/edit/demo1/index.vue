<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit/demo1/NewDialog.vue";

const tableRef = ref();
const selectedRow = ref(null); // 响应式变量存储选中的行数据

const {
  loading,
  columns,
  dataList,
  pagination,
  loadingConfig,
  adaptiveConfig,
  onSizeChange,
  onCurrentChange,
  searchField,
  searchQuery,
  showMouseMenu,
  editDialogVisible,
  editRowData,
  deleteDialogVisible,
  deleteProjectId,
  fetchData
} = useColumns();
</script>

<template>
  <div>
    <!-- 搜索控件区域 -->
    <div class="search-controls mb-4">
      <!-- mb-4 为 margin-bottom 的样式，用于添加一些间距 -->
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="项目ID" value="project_id" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="项目科室" value="project_room" />
        <el-option label="项目类型" value="project_type" />
        <el-option label="项目备注" value="project_remark" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>
    <pure-table
      ref="tableRef"
      border
      adaptive
      :adaptiveConfig="adaptiveConfig"
      row-key="project_id"
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
      @page-size-change="onSizeChange"
      @page-current-change="onCurrentChange"
      @row-contextmenu="showMouseMenu"
    />
    <!-- 添加数据更新按钮 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />
    <!-- 其他内容 -->
    <DeleteDialog
      :visible="deleteDialogVisible"
      :projectId="deleteProjectId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>
