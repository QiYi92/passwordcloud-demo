<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "./EditDialog.vue";
import DeleteDialog from "./DeleteDialog.vue";
import NewDialog from "./NewDialog.vue";
import ShowDialog from "./ShowDialog.vue";
import { FilesTypeOptions } from "@/views/workTaskForce/workTaskForce_management/data";

// useColumns 引出字段逻辑与方法
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
  deleteId,
  fetchData
} = useColumns();

// 预览弹窗逻辑
const showDialogVisible = ref(false);
const selectedRowData = ref({});

// 修改弹窗
const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

// 删除弹窗
const handleDelete = row => {
  deleteId.value = row.id;
  deleteDialogVisible.value = true;
};

// 预览弹窗
const handlePreview = row => {
  selectedRowData.value = row;
  showDialogVisible.value = true;
};

// 是否下拉搜索
const isDropdownSearch = computed(() => {
  return searchField.value === "taskforce_files";
});

const currentOptions = computed(() => {
  if (searchField.value === "taskforce_files") {
    return FilesTypeOptions;
  }
  return [];
});
</script>

<template>
  <div>
    <!-- 搜索栏 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="ID" value="id" />
        <el-option label="专班名称" value="taskforce_name" />
        <el-option label="人员名称" value="member_name" />
        <el-option label="成立时间" value="established_date" />
        <el-option label="备注" value="remark" />
        <el-option label="附件" value="taskforce_files" />
      </el-select>

      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择附件类型"
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

      <!-- 新增按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格主体 -->
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
        <template #operation="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            修改
          </el-button>
          <el-button
            link
            type="primary"
            size="small"
            @click="handlePreview(row)"
          >
            预览
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

    <!-- 编辑弹窗 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      editingField="taskforce_files"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />

    <!-- 预览弹窗 -->
    <ShowDialog
      :visible="showDialogVisible"
      :data="selectedRowData"
      @update:visible="showDialogVisible = $event"
    />

    <!-- 删除弹窗 -->
    <DeleteDialog
      :id="deleteId"
      :visible="deleteDialogVisible"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>

<style scoped>
.search-controls {
  display: flex;
  align-items: center;
}
</style>
