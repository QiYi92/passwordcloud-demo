<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/workPlan/workPlan_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/workPlan/workPlan_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/workPlan/workPlan_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/workPlan/workPlan_management/demo1/ShowDialog.vue";
import { ProjectRoomOptions } from "@/views/workPlan/workPlan_management/data"; // 导入责任科室选项

const tableRef = ref();
const selectedRow = ref(null); // 响应式变量存储选中的行数据
const deletePlanId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deletePlanId.value = row.plan_id;
  deleteDialogVisible.value = true;
};

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handlePreview = row => {
  previewData.value = row; // 将选中的行数据传递给预览对话框
  showDialogVisible.value = true; // 显示预览对话框
};

// 责任科室映射
const departmentMap = ref(
  ProjectRoomOptions.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {})
);

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
  fetchData
} = useColumns(departmentMap);
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
        <el-option label="计划ID" value="plan_id" />
        <el-option label="计划名称" value="plan_name" />
        <el-option label="责任科室" value="responsible_department" />
        <el-option label="开始时间" value="start_month" />
        <el-option label="结束时间" value="end_month" />
        <el-option label="当前状态" value="current_status" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="plan_id"
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
          <el-button
            link
            type="primary"
            size="small"
            @click="handlePreview(row)"
          >
            预览
          </el-button>
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
        <template #responsible_department="{ row }">
          <span>{{ departmentMap[row.responsible_department] || "未知" }}</span>
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
      :planId="deletePlanId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />

    <ShowDialog
      :visible="showDialogVisible"
      :data="previewData"
      @update:visible="showDialogVisible = $event"
    />
  </div>
</template>
