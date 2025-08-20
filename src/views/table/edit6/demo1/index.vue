<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit6/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit6/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit6/demo1/NewDialog.vue";

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
  deletePlanId,
  fetchData
} = useColumns();

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handleDelete = row => {
  deletePlanId.value = row.id;
  deleteDialogVisible.value = true;
};
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 合同支付计划 </span>
      </div>
    </template>
    <el-alert
      style="margin-bottom: 16px"
      title="如有Bug等问题请通过“问题反馈”栏目反馈给开发者。"
      type="info"
      :closable="false"
    />
    <!-- 搜索控件区域 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="合同名称" value="contract_name" />
        <el-option label="备注" value="remark" />
        <el-option label="支付顺序" value="payment_order" />
        <el-option label="应付金额" value="payable_amount" />
        <el-option label="支付月份" value="date" />
      </el-select>

      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />

      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
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
        style="min-width: 120px"
        @page-size-change="onSizeChange"
        @page-current-change="onCurrentChange"
        @row-contextmenu="showMouseMenu"
      >
        <!-- 操作列 -->
        <template #operation="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            修改
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="handleDelete(row)"
          >
            删除
          </el-button>
        </template>
      </pure-table>
    </div>

    <!-- 编辑和删除对话框 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />
    <DeleteDialog
      :visible="deleteDialogVisible"
      :planId="deletePlanId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </el-card>
</template>
