<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit5/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit5/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit5/demo1/NewDialog.vue";
import ShowDialog from "@/views/table/edit5/demo1/ShowDialog.vue";

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
  editDialogVisible,
  editRowData,
  deleteDialogVisible,
  deletePromptId,
  fetchData
} = useColumns();

// 预览弹窗相关的响应式变量
const showDialogVisible = ref(false);
const selectedRowData = ref({});

// 修改弹窗
const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

// 删除弹窗
const handleDelete = row => {
  deletePromptId.value = row.prompt_id;
  deleteDialogVisible.value = true;
};

// 预览弹窗
const handlePreview = row => {
  selectedRowData.value = row;
  showDialogVisible.value = true;
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
        <el-option label="催款项ID" value="prompt_id" />
        <el-option label="催款项名称" value="prompt_name" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="合同名称" value="contract_name" />
        <el-option label="催款金额" value="prompt_money" />
        <el-option label="登记时间" value="prompt_time" />
        <el-option label="备注" value="prompt_remark" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
      <!-- 确保捕获 data-updated 事件 -->
    </div>

    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="prompt_id"
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

    <!-- 编辑对话框 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      editingField="prompt_files"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />

    <!-- 预览对话框 -->
    <ShowDialog
      :visible="showDialogVisible"
      :data="selectedRowData"
      @update:visible="showDialogVisible = $event"
    />

    <!-- 删除对话框 -->
    <DeleteDialog
      :visible="deleteDialogVisible"
      :promptId="deletePromptId"
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
