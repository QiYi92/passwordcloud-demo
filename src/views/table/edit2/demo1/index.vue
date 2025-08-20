<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit2/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit2/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit2/demo1/NewDialog.vue";
import { ContractStateOptions } from "@/views/table/edit2/data";

const tableRef = ref();
const selectedRow = ref(null);

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
  deleteContractId,
  fetchData
} = useColumns();

const handleDelete = row => {
  deleteContractId.value = row.contract_id;
  deleteDialogVisible.value = true;
};

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

// 当搜索字段为 "contract_type" 时，显示下拉菜单
const isDropdownSearch = computed(() => {
  return searchField.value === "contract_type";
});

// 根据当前搜索字段返回对应的下拉选项（本模块只有 "contract_type" 使用下拉）
const currentOptions = computed(() => {
  if (searchField.value === "contract_type") {
    return ContractStateOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 项目合同管理 </span>
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
        <el-option label="合同ID" value="contract_id" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="合同乙方" value="contract_member" />
        <el-option label="合同类型" value="contract_type" />
        <el-option label="合同金额" value="contract_money" />
        <el-option label="合同日期" value="contract_date" />
        <el-option label="合同备注" value="contract_remark" />
      </el-select>

      <!-- 当搜索字段为 contract_type 时，显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
          style="width: 300px; margin-right: 10px"
        >
          <!-- “全部”选项：值为空，表示不过滤 -->
          <el-option label="全部" value="" />
          <el-option
            v-for="option in currentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>
      <!-- 否则显示文本输入框 -->
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

      <NewDialog @data-updated="fetchData" />
    </div>
    <!-- 表格区域 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="contract_id"
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
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />
    <DeleteDialog
      :visible="deleteDialogVisible"
      :contractId="deleteContractId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </el-card>
</template>
