<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/table/edit4/demo1/EditDialog.vue";
import DeleteDialog from "@/views/table/edit4/demo1/DeleteDialog.vue";
import NewDialog from "@/views/table/edit4/demo1/NewDialog.vue";

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
  deletePassId, // 修改变量名
  fetchData
} = useColumns();

const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

const handleDelete = row => {
  deletePassId.value = row.pass_id; // 修改为 pass_id
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
        <el-option label="资金下达ID" value="pass_id" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="资金类型" value="money_type" />
        <el-option label="下达时间" value="pass_time" />
        <el-option label="备注" value="pass_remark" />
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
        row-key="pass_id"
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
      :passId="deletePassId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
  </div>
</template>
