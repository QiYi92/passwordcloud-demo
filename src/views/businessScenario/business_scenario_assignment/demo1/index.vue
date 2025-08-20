<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/businessScenario/business_scenario_assignment/demo1/EditDialog.vue";
import DeleteDialog from "@/views/businessScenario/business_scenario_assignment/demo1/DeleteDialog.vue";
import NewDialog from "@/views/businessScenario/business_scenario_assignment/demo1/NewDialog.vue";
import ShowDialog from "@/views/businessScenario/business_scenario_assignment/demo1/ShowDialog.vue";
import { ProjectRoomOptions } from "@/views/businessScenario/business_scenario_assignment/data"; // 责任科室选项

const tableRef = ref();
const previewData = ref(null);
const showDialogVisible = ref(false);

// 响应式弹窗控制
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
  fetchData,
  editDialogVisible,
  editRowData,
  deleteId,
  deleteDialogVisible
} = useColumns();

// 下拉字段配置：目前只有“责任科室”支持下拉
const isDropdownSearch = computed(() => {
  return searchField.value === "responsible_dept";
});

const currentOptions = computed(() => {
  if (searchField.value === "responsible_dept") {
    return ProjectRoomOptions;
  }
  return [];
});

// 操作按钮行为
const handleDelete = row => {
  deleteId.value = row.id;
  deleteDialogVisible.value = true;
};

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handlePreview = row => {
  previewData.value = row;
  showDialogVisible.value = true;
};
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 业务场景分工 </span>
      </div>
    </template>
    <el-alert
      style="margin-bottom: 16px"
      title="如有Bug等问题请通过“问题反馈”栏目反馈给开发者。"
      type="info"
      :closable="false"
    />
    <!-- 搜索区域 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="业务场景名称" value="scenario_name" />
        <el-option label="责任科室" value="responsible_dept" />
        <el-option label="业务场景说明" value="scenario_description" />
        <el-option label="备注" value="remark" />
      </el-select>

      <!-- 下拉 or 输入框 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
          style="width: 300px; margin-right: 10px"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="option in currentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </template>
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

      <!-- 添加按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格区 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        row-key="id"
        alignWhole="center"
        showOverflowTooltip
        :adaptiveConfig="adaptiveConfig"
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
      </pure-table>
    </div>

    <!-- 弹窗组件 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />
    <DeleteDialog
      :id="deleteId"
      :visible="deleteDialogVisible"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
    <ShowDialog
      :visible="showDialogVisible"
      :data="previewData"
      @update:visible="showDialogVisible = $event"
    />
  </el-card>
</template>
