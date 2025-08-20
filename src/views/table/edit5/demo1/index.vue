<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit5/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit5/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit5/demo1/NewDialog.vue";
import ShowDialog from "@/views/table/edit5/demo1/ShowDialog.vue";
import { FilesTypeOptions } from "@/views/table/edit5/data"; // 引入文件类型选项
const fileBaseUrl = import.meta.env.VITE_APP_SERVER + "/uploads/prompts/";

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

// 当搜索字段为“催款函件”时使用下拉菜单
const isDropdownSearch = computed(() => {
  return searchField.value === "prompt_files";
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "prompt_files") {
    return FilesTypeOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 合同催款项登记管理 </span>
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
        <el-option label="催款项ID" value="prompt_id" />
        <el-option label="催款项名称" value="prompt_name" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="合同名称" value="contract_name" />
        <el-option label="催款金额" value="prompt_money" />
        <el-option label="登记时间" value="prompt_time" />
        <el-option label="备注" value="prompt_remark" />
        <!-- 新增搜索字段：催款函件 -->
        <el-option label="催款函件" value="prompt_files" />
      </el-select>

      <!-- 当搜索字段为下拉项（催款函件）时显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
          style="width: 300px; margin-right: 10px"
        >
          <!-- “全部”选项，值为空表示不过滤 -->
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

      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
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
        <!-- 正文附件列插槽（替换原来的 meeting_files 模板）-->
        <template #prompt_files="{ row }">
          <span
            v-if="
              row.prompt_files === 0 ||
              row.prompt_files === '0' ||
              row.prompt_files === null ||
              row.prompt_files === undefined ||
              row.prompt_files === '' ||
              row.prompt_files === '无附件'
            "
          >
            无附件
          </span>

          <!-- 只有有文件名时才渲染链接，并套用 file-link 类 -->
          <a
            v-else
            class="file-link"
            :href="
              fileBaseUrl + String(row.prompt_files).replace(/^\//, '').trim()
            "
            download
            target="_blank"
          >
            {{ row.prompt_files }}
          </a>
        </template>

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
  </el-card>
</template>

<style scoped>
.search-controls {
  display: flex;
  align-items: center;
}

.file-link {
  color: var(
    --el-color-primary
  ); /* Element Plus 主色 —— 与按钮/链接一致 */ /* turn0search1 */
  text-decoration: none; /* 可选：去掉下划线 */
  cursor: pointer; /* 鼠标悬停显示小手 */
}

.file-link:hover {
  text-decoration: underline; /* 悬停时给用户反馈，更易识别 */
}
</style>
