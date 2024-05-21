<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted, computed } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

// 响应式变量，存储项目名称选项
const projectOptions = ref([]);

// 异步函数加载项目名称数据
const loadProjectNames = async () => {
  try {
    const { data } = await axios.get("http://localhost:3000/api/projects");
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
    label: "合同名称",
    width: 120,
    prop: "contract_name",
    valueType: "copy"
  },
  {
    label: "项目名称",
    width: 120,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions // 动态绑定选项
  },
  {
    label: "合同乙方",
    width: 120,
    prop: "contract_member",
    valueType: "copy"
  },
  {
    label: "合同类型",
    width: 120,
    prop: "contract_type",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "设计合同",
        value: "1",
        color: "blue"
      },
      {
        label: "指标合同",
        value: "2",
        color: "blue"
      },
      {
        label: "监理合同",
        value: "3",
        color: "blue"
      }
    ]
  },
  {
    label: "合同金额",
    prop: "contract_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "备注",
    prop: "contract_remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 10,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
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
  try {
    const response = await axios.post(
      "http://localhost:3000/api/contracts",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("项目添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add contract:", error);
    alert("项目添加失败！");
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
