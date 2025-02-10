<script setup lang="ts">
import { computed, ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit/demo1/NewDialog.vue";
import {
  ProjectRoomOptions,
  ProjectStateOptions,
  ProjectTypeOptions
} from "@/views/table/edit/data";

const tableRef = ref();
const selectedRow = ref(null); // 响应式变量存储选中的行数据

const handleDelete = row => {
  deleteProjectId.value = row.project_id;
  deleteDialogVisible.value = true;
};

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

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

// 当搜索字段为以下几种时，使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["project_room", "project_type", "project_state"].includes(
    searchField.value
  );
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "project_room") {
    return ProjectRoomOptions;
  }
  if (searchField.value === "project_type") {
    return ProjectTypeOptions;
  }
  if (searchField.value === "project_state") {
    return ProjectStateOptions;
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
        <el-option label="项目ID" value="project_id" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="责任科室" value="project_room" />
        <el-option label="项目状态" value="project_state" />
        <el-option label="项目负责人" value="project_head" />
        <el-option label="项目类型" value="project_type" />
        <el-option label="项目时间" value="project_time" />
        <el-option label="项目备注" value="project_remark" />
      </el-select>

      <!-- 当搜索字段为 data.ts 定义的项时，显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
          style="width: 300px; margin-right: 10px"
        >
          <!-- “全部”选项，值为空，表示不过滤 -->
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

      <NewDialog @data-updated="fetchData" />
    </div>
    <!-- 表格容器 -->
    <div style="overflow-x: auto">
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
      :projectId="deleteProjectId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>
