<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/meeting/meetingSplit_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/meeting/meetingSplit_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/meeting/meetingSplit_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/meeting/meetingSplit_management/demo1/ShowDialog.vue";
import {
  MeetingProgressOptions,
  MeetingTypeOptions
} from "@/views/meeting/meetingSplit_management/data";

const tableRef = ref();
const selectedRow = ref(null);
const deleteMeetingId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deleteMeetingId.value = row.split_id;
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
} = useColumns();

// 当搜索字段为以下几种时，使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["progress", "meeting_type"].includes(searchField.value);
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "progress") {
    return MeetingProgressOptions;
  }
  if (searchField.value === "meeting_type") {
    return MeetingTypeOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 会议纪要拆分 </span>
      </div>
    </template>
    <el-alert
      style="margin-bottom: 16px"
      title="如有Bug等问题请通过“问题反馈”栏目反馈给开发者。"
      type="info"
      :closable="false"
    />
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="拆分ID" value="split_id" />
        <el-option label="选择会议纪要清单" value="meeting_name" />
        <el-option label="类型" value="meeting_type" />
        <el-option label="内容" value="meeting_content" />
        <el-option label="责任科室或人员" value="department_personnel" />
        <el-option label="当前进展" value="progress" />
      </el-select>
      <!-- 当搜索字段为 data.ts 定义的项时，显示下拉选择 -->
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

    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="split_id"
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
            >预览</el-button
          >
          <el-button link type="primary" size="small" @click="handleEdit(row)"
            >修改</el-button
          >
          <el-button link type="primary" size="small" @click="handleDelete(row)"
            >删除</el-button
          >
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
      :splitId="deleteMeetingId"
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
