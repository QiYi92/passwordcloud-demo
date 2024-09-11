<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted, computed } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 响应式变量，存储项目名称选项
const projectOptions = ref([]);

// 异步函数加载项目名称数据
const loadProjectNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/projects"
    );
    projectOptions.value = data.map(project => ({
      label: project.project_name,
      value: project.project_name
    }));
  } catch (error) {
    console.error("Failed to load project names:", error);
  }
};
// 初始化组件时加载项目名称数据
onMounted(loadProjectNames);
// 使用computed确保类型匹配
const computedProjectOptions = computed(() => projectOptions.value);

const columns: PlusColumn[] = [
  {
    label: "资金名称",
    labelWidth: 100,
    width: 120,
    prop: "pass_name",
    valueType: "copy"
  },
  {
    label: "项目名称",
    labelWidth: 100,
    width: 120,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions // 动态绑定选项
  },
  {
    label: "资金类型",
    width: 120,
    labelWidth: 100,
    prop: "money_type",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "智慧城市专项资金",
        value: "1",
        color: "blue"
      },
      {
        label: "化债专项资金",
        value: "2",
        color: "blue"
      },
      {
        label: "其他",
        value: "3",
        color: "gray"
      }
    ]
  },
  {
    label: "下达时间",
    labelWidth: 100,
    prop: "pass_time",
    valueType: "date-picker"
  },
  {
    label: "备注",
    labelWidth: 100,
    prop: "pass_remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
    }
  }
];

const visible = ref(false);
const values = ref<FieldValues>({});

// 定义emit用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  // 确保 pass_time 被正确格式化之前发送给后端
  if (values.value.pass_time) {
    values.value.pass_time = dayjs(values.value.pass_time as string).format(
      "YYYY-MM-DD"
    );
    console.log("Formatted pass_time:", values.value.pass_time);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/passes", // 修改为 passes 的 API 路径
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("资金下达添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add pass:", error);
    alert("资金下达添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新数据"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
