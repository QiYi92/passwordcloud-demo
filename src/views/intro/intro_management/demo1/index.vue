<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/intro/intro_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/intro/intro_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/intro/intro_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/intro/intro_management/demo1/ShowDialog.vue";
import {
  ProjectRoomOptions,
  IntroTypeOptions
} from "@/views/intro/intro_management/data";

const tableRef = ref();
const selectedRow = ref(null);
const deleteIntroId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deleteIntroId.value = row.intro_id;
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

// 责任科室映射
const departmentMap = ref(
  ProjectRoomOptions.reduce((map, option) => {
    map[option.value] = option.label;
    return map;
  }, {})
);

// 当搜索字段为“责任科室”或“情况类型”时使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["intro_department", "intro_type"].includes(searchField.value);
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "intro_department") {
    return ProjectRoomOptions;
  }
  if (searchField.value === "intro_type") {
    return IntroTypeOptions;
  }
  return [];
});

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
        <el-option label="简介ID" value="intro_id" />
        <el-option label="简介名称" value="intro_name" />
        <el-option label="责任科室" value="intro_department" />
        <el-option label="情况类型" value="intro_type" />
        <el-option label="更新时间" value="update_time" />
        <el-option label="简介内容" value="intro_content" />
        <el-option label="信息来源" value="info_source" />
        <el-option label="更新周期" value="update_cycle" />
      </el-select>

      <!-- 当搜索字段为下拉项时显示下拉选择 -->
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

      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="intro_id"
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
        <!-- 使用 departmentMap 映射显示责任科室 -->
        <template #intro_department="{ row }">
          <span>{{ departmentMap[row.intro_department] || "未知" }}</span>
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
      :introId="deleteIntroId"
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
