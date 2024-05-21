<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import EditDialog from "./EditDialog.vue";
import NewDialog from "./NewDialog.vue";
import DeleteDialog from "./DeleteDialog.vue";
import { TypeOptions, LevelOptions, CompletionOptions } from "./data"; // 引入数据文件
import dayjs from "dayjs";

const tableData = ref([]);
const filteredData = ref([]);
const editDialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const currentEditData = ref({});
const currentDeleteId = ref(null);
const searchField = ref(""); /* 新增部分 */
const searchQuery = ref(""); /* 新增部分 */
const loading = ref(false); /* 新增部分 */

const props = withDefaults(
  defineProps<{
    height?: string;
  }>(),
  {
    height: null
  }
);

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
    label: "是否完成",
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
    formatter: row => dayjs(row.time).format("YYYY年MM月DD日")
  },
  {
    label: "操作",
    width: "150",
    fixed: "right",
    slot: "operation"
  }
];

async function handleDelete(row) {
  currentDeleteId.value = row.id;
  deleteDialogVisible.value = true;
}

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

function handleEdit(row) {
  currentEditData.value = { ...row };
  editDialogVisible.value = true;
}

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

/* 新增部分：搜索数据的函数 */
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

/* 新增部分：监听搜索字段和查询字符串的变化 */
watch([searchField, searchQuery], selectData, { deep: true });

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

  <pure-table :data="filteredData" :columns="columns" :height="props.height">
    <template #operation="{ row }">
      <el-button link type="primary" size="small" @click="handleDelete(row)">
        删除
      </el-button>
      <el-button link type="primary" size="small" @click="handleEdit(row)">
        修改
      </el-button>
    </template>
  </pure-table>

  <EditDialog
    :visible="editDialogVisible"
    :initialData="currentEditData"
    @update:visible="editDialogVisible = $event"
    @data-updated="fetchData"
  />
  <DeleteDialog
    :id="currentDeleteId"
    :visible="deleteDialogVisible"
    @update:visible="deleteDialogVisible = $event"
    @deleted="confirmDelete"
  />
</template>
