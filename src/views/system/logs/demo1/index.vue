<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import DeleteDialog from "./DeleteDialog.vue";
import ShowDialog from "./ShowDialog.vue";

// 表格和选中行的引用
const tableRef = ref();
const deleteLogId = ref(null);
const deleteDialogVisible = ref(false);
const showDialogVisible = ref(false);
const previewData = ref(null);

// 调用 `useColumns` 处理表格数据
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

// 处理删除日志
const handleDelete = row => {
  deleteLogId.value = row.id;
  deleteDialogVisible.value = true;
};

// 处理日志预览
const handlePreview = row => {
  previewData.value = row;
  showDialogVisible.value = true;
};

// 计算属性：是否使用下拉搜索（仅“操作”字段）
const isDropdownSearch = computed(() => searchField.value === "action");

// “操作”字段的可选值
const currentOptions = computed(() => {
  return [
    { label: "创建", value: "增加记录" },
    { label: "修改", value: "修改记录" },
    { label: "删除", value: "删除记录" },
    { label: "文件上传", value: "文件上传记录" },
    { label: "文件删除", value: "文件删除记录" }
  ];
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
        <el-option label="日志ID" value="id" />
        <el-option label="用户账号" value="user_name" />
        <el-option label="用户名" value="real_name" />
        <el-option label="操作" value="action" />
        <el-option label="操作表单" value="resource" />
      </el-select>

      <!-- 仅当搜索字段为“操作”时使用下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择操作类型"
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

      <!-- 其他字段使用输入框搜索 -->
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>
    </div>

    <!-- 表格容器 -->
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
        <!-- 操作列 -->
        <template #operation="{ row }">
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

    <!-- 删除对话框 -->
    <DeleteDialog
      :visible="deleteDialogVisible"
      :logId="deleteLogId || 0"
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
