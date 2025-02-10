<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit3/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit3/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit3/demo1/NewDialog.vue";
import {
  PaymentTypeOptions,
  PaymentStateOptions
} from "@/views/table/edit3/data";

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

// 当搜索字段为支付情况或支付状态时使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["pay_type", "pay_state"].includes(searchField.value);
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "pay_type") {
    return PaymentTypeOptions;
  }
  if (searchField.value === "pay_state") {
    return PaymentStateOptions;
  }
  return [];
});
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

      <!-- 当搜索字段为下拉项时，显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
          style="width: 300px; margin-right: 10px"
        >
          <!-- “全部”选项，值为空表示不过滤 -->
          <el-option label="全部" value="" />
          <el-option
            v-for="option in currentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>
      <!-- 否则，显示文本输入框 -->
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

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
      :payId="deletePaymentId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>
