<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import EditDialog from "./EditDialog.vue"; // 引入编辑对话框组件
import NewDialog from "./NewDialog.vue"; // 引入新增对话框组件
import DeleteDialog from "./DeleteDialog.vue"; // 引入删除对话框组件
import ShowDialog from "./ShowDialog.vue"; // 引入预览对话框组件
import { TypeOptions, LevelOptions, CompletionOptions } from "./data"; // 引入数据文件
import dayjs from "dayjs"; // 引入日期处理库

// 定义响应式变量
const tableData = ref([]); // 表格数据
const filteredData = ref([]); // 过滤后的数据
const editDialogVisible = ref(false); // 编辑对话框是否可见
const deleteDialogVisible = ref(false); // 删除对话框是否可见
const showDialogVisible = ref(false); // 预览对话框是否可见
const currentEditData = ref({}); // 当前编辑的数据
const currentDeleteId = ref(null); // 当前删除的数据ID
const currentPreviewData = ref({}); // 当前预览的数据
const searchField = ref(""); // 搜索字段
const searchQuery = ref(""); // 搜索关键词
const loading = ref(false); // 加载状态

// 定义组件属性及其默认值
const props = withDefaults(
  defineProps<{
    height?: string;
  }>(),
  {
    height: null
  }
);

// 定义表格列配置
const columns = [
  {
    label: "ID",
    prop: "id",
    width: "100",
    fixed: true
  },
  {
    label: "类型",
    prop: "type",
    width: "150",
    formatter: row =>
      TypeOptions.find(option => option.value === row.type)?.label || row.type // 格式化显示
  },
  {
    label: "等级",
    prop: "level",
    width: "150",
    formatter: row =>
      LevelOptions.find(option => option.value === row.level)?.label ||
      row.level // 格式化显示
  },
  {
    label: "责任人",
    prop: "principal",
    width: "200"
  },
  {
    label: "标题",
    prop: "title",
    width: "250"
  },
  {
    label: "描述",
    prop: "describe",
    width: "300"
  },
  {
    label: "完成状态",
    prop: "completion",
    width: "150",
    formatter: row =>
      CompletionOptions.find(option => option.value === row.completion)
        ?.label || row.completion // 格式化显示
  },
  {
    label: "完成情况说明",
    prop: "remark",
    width: "300"
  },
  {
    label: "时间",
    prop: "time",
    width: "200",
    formatter: row => dayjs(row.time).format("YYYY年MM月DD日") // 格式化显示时间
  },
  {
    label: "问题附件",
    prop: "issues_files",
    width: "200"
  },
  {
    label: "操作",
    width: "200",
    fixed: "right",
    slot: "operation" // 操作列
  }
];

// 处理删除操作
async function handleDelete(row) {
  currentDeleteId.value = row.id;
  deleteDialogVisible.value = true;
}

// 确认删除操作
async function confirmDelete() {
  try {
    await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/${currentDeleteId.value}`
    );
    tableData.value = tableData.value.filter(
      item => item.id !== currentDeleteId.value
    );
    filteredData.value = filteredData.value.filter(
      item => item.id !== currentDeleteId.value
    );
    console.log(`Deleted row with id: ${currentDeleteId.value}`);
    deleteDialogVisible.value = false;
  } catch (error) {
    console.error("Error deleting issues data:", error);
  }
}

// 处理编辑操作
function handleEdit(row) {
  currentEditData.value = { ...row };
  editDialogVisible.value = true;
}

// 处理预览操作
function handlePreview(row) {
  currentPreviewData.value = { ...row };
  showDialogVisible.value = true;
}

// 获取数据
function fetchData() {
  axios
    .get(`${import.meta.env.VITE_APP_SERVER}/api/issues`)
    .then(response => {
      tableData.value = response.data;
      filteredData.value = response.data;
    })
    .catch(error => {
      console.error("Error fetching issues data:", error);
    });
}

// 新增部分：搜索数据的函数
const selectData = async () => {
  loading.value = true;
  try {
    filteredData.value = tableData.value.filter(item =>
      (item[searchField.value] || "")
        .toString()
        .toLowerCase()
        .includes(searchQuery.value.toLowerCase())
    );
  } catch (error) {
    console.error("Failed to filter data:", error);
  } finally {
    loading.value = false;
  }
};

// 新增部分：监听搜索字段和查询字符串的变化
watch([searchField, searchQuery], selectData, { deep: true });

// 组件挂载时获取数据
onMounted(fetchData);
</script>

<template>
  <!-- 搜索控件区域 -->
  <div class="search-controls mb-4">
    <el-select
      v-model="searchField"
      placeholder="选择搜索字段"
      style="width: 200px; margin-right: 10px"
    >
      <el-option label="类型" value="type" />
      <el-option label="等级" value="level" />
      <el-option label="责任人" value="principal" />
      <el-option label="标题" value="title" />
      <el-option label="描述" value="describe" />
      <el-option label="是否完成" value="completion" />
      <el-option label="完成情况说明" value="remark" />
      <el-option label="时间" value="time" />
    </el-select>
    <el-input
      v-model="searchQuery"
      placeholder="输入搜索内容"
      style="width: 300px; margin-right: 10px"
    />
    <!-- 添加新数据的按钮 -->
    <NewDialog @data-updated="fetchData" />
  </div>

  <!-- 表格显示区域 -->
  <pure-table :data="filteredData" :columns="columns" :height="props.height">
    <template #operation="{ row }">
      <el-button link type="primary" size="small" @click="handleEdit(row)">
        修改
      </el-button>
      <el-button link type="primary" size="small" @click="handlePreview(row)">
        预览
      </el-button>
      <el-button link type="primary" size="small" @click="handleDelete(row)">
        删除
      </el-button>
    </template>
  </pure-table>

  <!-- 编辑对话框 -->
  <EditDialog
    :visible="editDialogVisible"
    :initialData="currentEditData"
    @update:visible="editDialogVisible = $event"
    @data-updated="fetchData"
  />

  <!-- 删除对话框 -->
  <DeleteDialog
    :id="currentDeleteId"
    :visible="deleteDialogVisible"
    @update:visible="deleteDialogVisible = $event"
    @deleted="confirmDelete"
  />

  <!-- 预览对话框 -->
  <ShowDialog
    :visible="showDialogVisible"
    :data="currentPreviewData"
    @update:visible="showDialogVisible = $event"
  />
</template>

<style scoped>
.search-controls {
  display: flex;
  align-items: center;
}
</style>
