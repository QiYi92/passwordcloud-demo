<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/workPlan/workPlan_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/workPlan/workPlan_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/workPlan/workPlan_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/workPlan/workPlan_management/demo1/ShowDialog.vue";
import {
  ProjectRoomOptions,
  ProjectStatusOptions
} from "@/views/workPlan/workPlan_management/data"; // 导入选项

const tableRef = ref();
const selectedRow = ref(null);
const deletePlanId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deletePlanId.value = row.plan_id;
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

// 构造责任科室映射
const departmentMap = ref(
  ProjectRoomOptions.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {})
);

// 调用模块，并传入部门映射（用于 index.vue 模板中显示部门 label）
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

// 当搜索字段为“责任科室”或“当前状态”时，显示下拉选择
const isDropdownSearch = computed(() => {
  return ["responsible_department", "current_status"].includes(
    searchField.value
  );
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "responsible_department") {
    return ProjectRoomOptions;
  }
  if (searchField.value === "current_status") {
    return ProjectStatusOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 年度工作计划 </span>
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
        <el-option label="计划ID" value="plan_id" />
        <el-option label="计划名称" value="plan_name" />
        <el-option label="责任科室" value="responsible_department" />
        <el-option label="开始时间" value="start_month" />
        <el-option label="结束时间" value="end_month" />
        <el-option label="当前状态" value="current_status" />
        <el-option label="更新人员" value="update_user" />
      </el-select>

      <!-- 当搜索字段为下拉项时，显示下拉选择 -->
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
      <!-- 否则，显示文本输入框 -->
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="plan_id"
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
        <!-- 自定义显示责任科室：通过映射显示 label -->
        <template #responsible_department="{ row }">
          <span>{{ departmentMap[row.responsible_department] || "未知" }}</span>
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
      :visible="deleteDialogVisible"
      :planId="deletePlanId"
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
