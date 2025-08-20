<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
import { useColumns } from "./columns";
import EditDialog from "@/views/onsite/onsite_management/demo1/EditDialog.vue";
import DeleteDialog from "@/views/onsite/onsite_management/demo1/DeleteDialog.vue";
import NewDialog from "@/views/onsite/onsite_management/demo1/NewDialog.vue";
import ShowDialog from "@/views/onsite/onsite_management/demo1/ShowDialog.vue";
import axios from "axios";
import { OnsiteTypeOptions } from "@/views/onsite/onsite_management/data";
const fileBaseUrl = import.meta.env.VITE_APP_SERVER + "/uploads/onsite/";

// 从 useColumns 中解构需要的响应式变量和方法
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
  deleteOnsiteId,
  fetchData
} = useColumns();

// 预览弹窗相关的响应式变量
const showDialogVisible = ref(false);
const selectedRowData = ref({});

// 动态更新时间
const lastUpdateTime = ref("");

// 格式化时间
const formatTime = timestamp => {
  if (!timestamp) return "暂无更新时间"; // 如果时间戳无效，返回占位文本
  const date = new Date(timestamp); // 解析 ISO 格式时间
  if (isNaN(date.getTime())) return "暂无更新时间"; // 检查解析是否成功

  const dayNames = [
    "星期日",
    "星期一",
    "星期二",
    "星期三",
    "星期四",
    "星期五",
    "星期六"
  ];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 ${
    dayNames[date.getDay()]
  } ${date.getHours().toString().padStart(2, "0")}:${date
    .getMinutes()
    .toString()
    .padStart(2, "0")}`;
};

// 获取全表最后更新时间
const fetchLastUpdateTime = async () => {
  try {
    const url = `${import.meta.env.VITE_APP_SERVER}/api/onsite/last-update`;
    console.log("请求 URL:", url); // 打印完整的请求路径
    const response = await axios.get(url);
    lastUpdateTime.value = formatTime(response.data.lastUpdateTime);
  } catch (error) {
    console.error("获取最后更新时间失败：", error);
  }
};

// 数据更新事件
const handleDataUpdated = async () => {
  await fetchData(); // 刷新表格数据
  await fetchLastUpdateTime(); // 获取最新更新时间
};

// 页面加载时获取数据和更新时间
onMounted(async () => {
  await fetchData(); // 获取表格数据
  await fetchLastUpdateTime(); // 获取全表最后更新时间
});

// 修改弹窗
const handleEdit = row => {
  editRowData.value = row;
  editDialogVisible.value = true;
};

// 删除弹窗
const handleDelete = row => {
  deleteOnsiteId.value = row.personnel_id;
  deleteDialogVisible.value = true;
};

// 预览弹窗
const handlePreview = row => {
  selectedRowData.value = row;
  showDialogVisible.value = true;
};

// 搜索控件逻辑
const isDropdownSearch = computed(() => {
  return ["type"].includes(searchField.value); // 判断是否为 type 类型字段
});

const currentOptions = computed(() => {
  if (searchField.value === "type") {
    return OnsiteTypeOptions;
  }
  return [];
});
</script>

<template>
  <el-card shadow="never">
    <template #header>
      <div class="card-header">
        <span class="font-medium"> 驻场人员管理 </span>
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
        <el-option label="驻场人员ID" value="personnel_id" />
        <el-option label="姓名" value="name" />
        <el-option label="公司" value="company" />
        <el-option label="类型" value="type" />
        <el-option label="联系方式" value="contact_info" />
        <el-option label="备注" value="remarks" />
        <el-option label="驻场时间" value="onSite_time" />
      </el-select>

      <!-- 动态切换搜索方式：下拉菜单或文本框 -->
      <template v-if="isDropdownSearch">
        <el-select
          v-model="searchQuery"
          placeholder="请选择搜索内容"
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
      <template v-else>
        <el-input
          v-model="searchQuery"
          placeholder="输入搜索内容"
          style="width: 300px; margin-right: 10px"
        />
      </template>

      <NewDialog @data-updated="handleDataUpdated" />
      <span style="margin-left: 20px; color: gray">
        最后更新时间：{{ lastUpdateTime }}
      </span>
    </div>

    <!-- 表格容器 -->
    <div style="overflow-x: auto">
      <pure-table
        ref="tableRef"
        border
        adaptive
        :adaptiveConfig="adaptiveConfig"
        row-key="personnel_id"
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
        <!-- 正文附件列插槽-->
        <template #related_files="{ row }">
          <span
            v-if="
              row.related_files === 0 ||
              row.related_files === '0' ||
              row.related_files === null ||
              row.related_files === undefined ||
              row.related_files === '' ||
              row.related_files === '无附件'
            "
          >
            无附件
          </span>

          <!-- 只有有文件名时才渲染链接，并套用 file-link 类 -->
          <a
            v-else
            class="file-link"
            :href="
              fileBaseUrl + String(row.related_files).replace(/^\//, '').trim()
            "
            download
            target="_blank"
          >
            {{ row.related_files }}
          </a>
        </template>

        <!-- 操作列 -->
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
      editingField="related_files"
      @update:visible="editDialogVisible = $event"
      @data-updated="handleDataUpdated"
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
      :personnelId="deleteOnsiteId"
      @update:visible="deleteDialogVisible = $event"
      @deleted="handleDataUpdated"
    />
  </el-card>
</template>

<style scoped>
.search-controls {
  display: flex;
  align-items: center;
}

.file-link {
  color: var(--el-color-primary);
  text-decoration: none;
  cursor: pointer;
}

.file-link:hover {
  text-decoration: underline;
}
</style>
