<script setup lang="ts">
import { ref } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/registrationInfo/registration_info/demo1/EditDialog.vue";
import DeleteDialog from "@/views/registrationInfo/registration_info/demo1/DeleteDialog.vue";
import NewDialog from "@/views/registrationInfo/registration_info/demo1/NewDialog.vue";
import ShowDialog from "@/views/registrationInfo/registration_info/demo1/ShowDialog.vue";
import { RegistrationRoomOptions } from "@/views/registrationInfo/registration_info/data"; // 导入注册科室选项

const tableRef = ref();
const selectedRow = ref(null); // 存储选中的行数据
const deleteProjectId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deleteProjectId.value = row.project_id;
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

// 注册科室映射
const departmentMap = ref(
  RegistrationRoomOptions.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {})
);

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
} = useColumns(departmentMap);
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
        <el-option label="项目ID" value="project_id" />
        <el-option label="项目名称" value="project_name" />
        <el-option label="注册机构" value="registration_agency" />
        <el-option label="联系方式" value="contact_info" />
        <el-option label="注册科室" value="registration_department" />
        <el-option label="有效期" value="validity_period" />
        <el-option label="是否续费" value="is_renewable" />
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
        row-key="project_id"
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
        <template #registration_department="{ row }">
          <span>{{
            departmentMap[row.registration_department] || "未知"
          }}</span>
        </template>
      </pure-table>
    </div>

    <!-- 弹窗组件 -->
    <EditDialog
      :visible="editDialogVisible"
      :initialData="editRowData"
      @update:visible="editDialogVisible = $event"
      @data-updated="fetchData"
    />
    <DeleteDialog
      :visible="deleteDialogVisible"
      :projectId="deleteProjectId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="fetchData"
    />
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
