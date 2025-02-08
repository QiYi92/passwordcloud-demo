<script setup lang="ts">
/* eslint-disable */
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  onMounted,
  computed
} from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 引入资金类型选项，用于反向转换
import { FundsTypeOptions } from "@/views/table/edit4/data";

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

// 从父组件接收的初始数据和可见性状态
const props = defineProps({
  initialData: Object,
  visible: Boolean
});
// 发射事件到父组件的方法
const emit = defineEmits(["update:visible", "data-updated"]);
// 本地表单值的响应式状态
const values = ref<FieldValues>({});
const localVisible = ref(false);

// 反向转换函数：将资金类型的 label 转换为对应的 value
const reverseConvertMoneyType = (label: string): string => {
  const option = FundsTypeOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 监视 props.visible 变化来更新本地显示状态和表单数据
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    const initialData = { ...props.initialData };
    if (initialData.money_type) {
      initialData.money_type = reverseConvertMoneyType(initialData.money_type);
    }
    values.value = initialData;
  }
});
// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.pass_id) {
    console.error("No pass ID provided for updating.");
    return;
  }
  // 格式化日期，确保 pass_time 被正确格式化后再发送给后端
  if (values.value.pass_time) {
    values.value.pass_time = dayjs(values.value.pass_time as string).format(
      "YYYY-MM-DD"
    );
    console.log("Formatted pass_time:", values.value.pass_time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/passes/${values.value.pass_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("资金下达更新成功！");
  } catch (error) {
    console.error("Failed to update pass:", error);
    alert("资金下达更新失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "资金名称",
    width: 120,
    labelWidth: 100,
    prop: "pass_name",
    valueType: "copy"
  },
  {
    label: "项目名称",
    width: 120,
    labelWidth: 100,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions
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
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑资金下达数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
