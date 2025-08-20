<script setup lang="ts">
import { ref, computed, watchEffect } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/expert/expert_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/expert/expert_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/expert/expert_management/demo1/NewDialog.vue";
import {
  ProjectExpertiseArea,
  LocationOptions
} from "@/views/expert/expert_management/data";

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
  deleteExpertId,
  fetchData,
  selectData
} = useColumns();

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handleDelete = row => {
  deleteExpertId.value = row.expert_id;
  deleteDialogVisible.value = true;
};

// 当搜索字段为专业时使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["expertise_area", "location"].includes(searchField.value);
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "expertise_area") {
    return ProjectExpertiseArea;
  } else if (searchField.value === "location") {
    return LocationOptions;
  }
  return [];
});

// 确保在 `searchQuery` 或 `searchField` 更新时，触发搜索
watchEffect(() => {
  if (searchField.value && searchQuery.value) {
    selectData();
  }
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 专家库管理 </span>
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
        <el-option label="专家ID" value="expert_id" />
        <el-option label="姓名" value="name" />
        <el-option label="专业" value="expertise_area" />
        <el-option label="职称" value="title" />
        <el-option label="联系方式" value="contact_info" />
        <el-option label="工作单位" value="work_unit" />
        <el-option label="所在地" value="location" />
        <el-option label="现任职务" value="current_position" />
        <el-option label="现从事专业" value="current_expertise" />
      </el-select>

      <!-- 当搜索字段为专业时，显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择专业"
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
        row-key="expert_id"
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
      :expertId="deleteExpertId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </el-card>
</template>
