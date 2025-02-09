<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/meeting/meeting_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/meeting/meeting_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/meeting/meeting_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/meeting/meeting_management/demo1/ShowDialog.vue";

const tableRef = ref();
const selectedRow = ref(null); // 存储选中的行数据
const deleteMeetingId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

// 删除对话框
const handleDelete = row => {
  deleteMeetingId.value = row.meeting_id; // 使用 `meeting_id`
  deleteDialogVisible.value = true;
};

// 编辑对话框
const handleEdit = row => {
  editRowData.value = row; // 设置当前编辑的行数据
  editDialogVisible.value = true;
};

// 预览对话框
const handlePreview = row => {
  previewData.value = row; // 将选中的行数据传递给预览对话框
  showDialogVisible.value = true;
};

// 从 useColumns 中解构需要的响应式变量和方法
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
        <el-option label="会议ID" value="meeting_id" />
        <el-option label="会议名称" value="meeting_name" />
        <el-option label="会议正文" value="meeting_body" />
        <el-option label="会议时间" value="meeting_date" />
        <el-option label="会议地点" value="meeting_location" />
        <el-option label="摘要" value="summary" />
        <el-option label="正文附件" value="meeting_files" />
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
        row-key="meeting_id"
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

    <!-- 编辑对话框 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />

    <!-- 删除对话框 -->
    <DeleteDialog
      :visible="deleteDialogVisible"
      :meetingId="deleteMeetingId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />

    <!-- 预览对话框 -->
    <ShowDialog
      :visible="showDialogVisible"
      :data="previewData"
      @update:visible="showDialogVisible = $event"
    />
  </div>
</template>

<style scoped>
.search-controls {
  display: flex;
  align-items: center;
}
</style>
