<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/organizationContact/organization_contact_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/organizationContact/organization_contact_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/organizationContact/organization_contact_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/organizationContact/organization_contact_management/demo1/ShowDialog.vue";

const tableRef = ref();
const previewData = ref(null);
const showDialogVisible = ref(false);

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
  fetchData,
  editDialogVisible,
  editRowData,
  deleteId,
  deleteDialogVisible
} = useColumns();

const isDropdownSearch = computed(() => false); // 暂无下拉搜索字段

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
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 单位信息化联系人 </span>
      </div>
    </template>
    <el-alert
      style="margin-bottom: 16px"
      title="如有Bug等问题请通过“问题反馈”栏目反馈给开发者。"
      type="info"
      :closable="false"
    />
    <!-- 搜索区域 -->
    <div class="search-controls mb-4">
      <el-select
        v-model="searchField"
        placeholder="选择搜索字段"
        style="width: 200px; margin-right: 10px"
      >
        <el-option label="单位名称" value="organization_name" />
        <el-option label="联系人" value="contact_person" />
        <el-option label="联系方式" value="contact_phone" />
        <el-option label="备注" value="remark" />
      </el-select>

      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        row-key="id"
        alignWhole="center"
        showOverflowTooltip
        :adaptiveConfig="adaptiveConfig"
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
