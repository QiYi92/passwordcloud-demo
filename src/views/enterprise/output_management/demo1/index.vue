<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/enterprise/output_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/enterprise/output_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/enterprise/output_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/enterprise/output_management/demo1/ShowDialog.vue";

const tableRef = ref();
const selectedRow = ref(null);

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
  deleteRecordId,
  previewData,
  showDialogVisible,
  fetchData
} = useColumns();

const handleDelete = row => {
  deleteRecordId.value = row.record_id;
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

// 搜索字段下拉菜单显示逻辑
const isDropdownSearch = computed(() => {
  return searchField.value === "enterprise_name";
});

const currentOptions = computed(() => {
  if (searchField.value === "enterprise_name") {
    return dataList.value.map(item => ({
      label: item.enterprise_name,
      value: item.enterprise_name
    }));
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 产值记录 </span>
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
        <el-option label="企业名称" value="enterprise_name" />
        <el-option label="年度" value="year" />
        <el-option label="产值" value="output_value" />
        <el-option label="备注" value="remarks" />
      </el-select>

      <!-- 当搜索字段为企业名称时，显示下拉选择 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择企业"
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
      <!-- 否则显示文本输入框 -->
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格区域 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="record_id"
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
      :recordId="deleteRecordId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />

    <!-- 预览对话框 -->
    <ShowDialog
      :visible="showDialogVisible"
      :data="previewData"
      @update:visible="showDialogVisible = $event"
    />
  </el-card>
</template>

<style scoped lang="scss">
.search-controls {
  display: flex;
  align-items: center;
  justify-content: flex-start;
}
</style>
