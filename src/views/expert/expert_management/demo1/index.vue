<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/expert/expert_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/expert/expert_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/expert/expert_management/demo1/NewDialog.vue";

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
  deleteExpertId, // 修改变量名
  fetchData
} = useColumns();

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handleDelete = row => {
  deleteExpertId.value = row.expert_id; // 修改为 expert_id
  deleteDialogVisible.value = true;
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
        <el-option label="专家ID" value="expert_id" />
        <el-option label="姓名" value="name" />
        <el-option label="专业" value="expertise_area" />
        <el-option label="职称" value="title" />
        <el-option label="联系方式" value="contact_info" />
        <el-option label="工作单位" value="work_unit" />
      </el-select>
      <el-input
        v-model="searchQuery"
        placeholder="输入搜索内容"
        style="width: 300px; margin-right: 10px"
      />
      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

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
        <!-- 定义操作列的内容 -->
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
  </div>
</template>
