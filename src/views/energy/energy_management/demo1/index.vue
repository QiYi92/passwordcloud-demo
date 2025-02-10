<script setup lang="ts">
import { ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/energy/energy_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/energy/energy_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/energy/energy_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/energy/energy_management/demo1/ShowDialog.vue";
import { RegionOptions } from "@/views/energy/energy_management/data"; // 引入区域选项

const tableRef = ref();
const selectedRow = ref(null); // 响应式变量存储选中的行数据
const deleteEnergyId = ref(null);
const deleteDialogVisible = ref(false);
const editDialogVisible = ref(false);
const editRowData = ref(null);
const showDialogVisible = ref(false);
const previewData = ref(null);

const handleDelete = row => {
  deleteEnergyId.value = row.energy_id;
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
  fetchData
} = useColumns();

// 当搜索字段为区域时使用下拉菜单
const isDropdownSearch = computed(() => {
  return ["region"].includes(searchField.value);
});

// 根据当前搜索字段返回对应的下拉选项
const currentOptions = computed(() => {
  if (searchField.value === "region") {
    return RegionOptions;
  }
  return [];
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
        <el-option label="记录ID" value="energy_id" />
        <el-option label="日期" value="date" />
        <el-option label="区域" value="region" />
        <el-option label="耗电量" value="electricity_consumption" />
      </el-select>

      <!-- 当搜索字段为区域时，显示下拉选择 -->
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

      <!-- 添加新数据的按钮 -->
      <NewDialog @data-updated="fetchData" />
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="energy_id"
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
      :energyId="deleteEnergyId"
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
