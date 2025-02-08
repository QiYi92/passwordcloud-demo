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
// 导入合同类型选项
import { ContractStateOptions } from "@/views/table/edit2/data";

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

// 反向转换函数：将合同类型的 label 转换为 value
const reverseConvertContractType = (label: string): string => {
  const option = ContractStateOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = {
      ...props.initialData,
      contract_type: props.initialData.contract_type
        ? reverseConvertContractType(props.initialData.contract_type)
        : props.initialData.contract_type
    };
  }
  if (!props.visible) {
    values.value = {}; // 清空数据
  }
});
// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.contract_id) {
    console.error("No contract ID provided for updating.");
    return;
  }
  if (values.value.contract_date) {
    values.value.contract_date = dayjs(
      values.value.contract_date as string
    ).format("YYYY-MM-DD"); //报错但是正常运行
    console.log("Formatted project_time:", values.value.contract_date);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/contracts/${values.value.contract_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("项目更新成功！");
  } catch (error) {
    console.error("Failed to update contract:", error);
    alert("项目更新失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "合同名称",
    labelWidth: 150,
    width: 120,
    prop: "contract_name",
    valueType: "copy"
  },
  {
    label: "项目名称",
    labelWidth: 150,
    width: 120,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions // 动态绑定选项
  },
  {
    label: "合同乙方",
    labelWidth: 150,
    width: 120,
    prop: "contract_member",
    valueType: "copy"
  },
  {
    label: "合同类型",
    labelWidth: 150,
    width: 120,
    prop: "contract_type",
    valueType: "select",
    options: [
      {
        label: "其他",
        value: "0",
        color: "yellow"
      },
      {
        label: "设计合同",
        value: "1",
        color: "blue"
      },
      {
        label: "监理合同",
        value: "2",
        color: "blue"
      },
      {
        label: "第三方测评合同",
        value: "3",
        color: "blue"
      },
      {
        label: "施工合同",
        value: "4",
        color: "blue"
      },
      {
        label: "竣工结算合同",
        value: "5",
        color: "blue"
      }
    ]
  },
  {
    label: "合同金额（元）",
    labelWidth: 150,
    prop: "contract_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "合同日期",
    labelWidth: 150,
    prop: "contract_date",
    valueType: "date-picker"
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "contract_remark",
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
    title="编辑合同数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
