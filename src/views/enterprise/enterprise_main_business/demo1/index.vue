<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/enterprise/enterprise_main_business/demo1/EditDialog.vue";
import DeleteDialog from "@/views/enterprise/enterprise_main_business/demo1/DeleteDialog.vue";
import NewDialog from "@/views/enterprise/enterprise_main_business/demo1/NewDialog.vue";
import ShowDialog from "@/views/enterprise/enterprise_main_business/demo1/ShowDialog.vue";
import { BusinessOrProductOptions } from "@/views/enterprise/enterprise_main_business/data";

const tableRef = ref();
const selectedRow = ref(null);
const deleteId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

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

// ✅ 当前搜索字段是否下拉搜索（主营业务用下拉）
const isDropdownSearch = computed(() => {
  return searchField.value === "business";
});

// ✅ 当前下拉选项（主营业务用业务字典）
const currentOptions = computed(() => {
  if (searchField.value === "business") {
    return BusinessOrProductOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 企业主营业务 </span>
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
        <el-option label="企业名称" value="enterprise_name" />
        <el-option label="主营业务" value="business" />
        <el-option label="业务&产品名称" value="business_name" />
        <!-- ✅ 新增 -->
        <el-option label="备注" value="remark" />
      </el-select>

      <!-- ✅ 下拉搜索控件 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择主营业务"
          style="width: 300px; margin-right: 10px"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="option in currentOptions"
            :key="option.value"
            :label="option.label"
            :value="option.label"
          />
        </el-select>
      </template>

      <!-- 普通文本搜索控件 -->
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
