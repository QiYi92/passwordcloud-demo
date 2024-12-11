<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit3/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit3/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit3/demo1/NewDialog.vue";

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
  deletePaymentId,
  fetchData
} = useColumns();

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handleDelete = row => {
  deletePaymentId.value = row.pay_id;
  deleteDialogVisible.value = true;
};
</script>

<template>
  <div>
    <!-- 搜索控件区域 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="支付ID" value="pay_id" />
        <el-option label="支付项名称" value="pay_name" />
        <el-option label="合同名称" value="contract_name" />
        <el-option label="支付情况" value="pay_type" />
        <el-option label="支付时间" value="pay_time" />
        <el-option label="支付状态" value="pay_state" />
        <el-option label="支付备注" value="pay_remark" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="pay_id"
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
        <!-- 定义操作列的内容 -->
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
      :payId="deletePaymentId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>
