<script setup lang="ts">
/* eslint-disable */
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  onMounted,
  computed,
  watch
} from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 引入支付项模块对应的选项数据
import {
  PaymentTypeOptions,
  PaymentStateOptions
} from "@/views/table/edit3/data";

// 响应式变量，存储项目名称和合同名称选项
const projectOptions = ref([]);
const contractOptions = ref([]);
const allContracts = ref([]); // 保存所有合同数据，包括对应项目名称

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

// 初始化组件时加载项目名称数据和合同名称数据
const loadProjectNames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/projects`
    );
    projectOptions.value = data.map(project => ({
      label: project.project_name,
      value: project.project_name
    }));
  } catch (error) {
    console.error("加载项目名称失败:", error);
  }
};

const loadContractNames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/contracts`
    );
    allContracts.value = data.map(contract => ({
      label: contract.contract_name,
      value: contract.contract_name,
      project_name: contract.project_name
    }));
    contractOptions.value = allContracts.value;
  } catch (error) {
    console.error("加载合同名称失败:", error);
  }
};

// 加载数据
onMounted(() => {
  loadProjectNames();
  loadContractNames();
});

// 监视 props.visible 变化来加载数据
watch(
  () => props.visible,
  newVisible => {
    if (newVisible) {
      // 可见时加载相关数据
      loadContractNames();
    } else {
      // 不可见时清空合同名称
      contractOptions.value = [];
    }
  }
);

// 反向转换函数：将支付项类型的 label 转换为 value
const reverseConvertPayType = (label: string): string => {
  const option = PaymentTypeOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 反向转换函数：将支付状态的 label 转换为 value
const reverseConvertPayState = (label: string): string => {
  const option = PaymentStateOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 监视 props.initialData 变化来更新本地显示状态，并进行反向转换
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = {
      ...props.initialData,
      pay_type: props.initialData.pay_type
        ? reverseConvertPayType(props.initialData.pay_type)
        : props.initialData.pay_type,
      pay_state: props.initialData.pay_state
        ? reverseConvertPayState(props.initialData.pay_state)
        : props.initialData.pay_state
    };
  }
});

// 动态筛选合同选项并清空合同选择
watch(
  () => values.value.project_name,
  newProjectName => {
    contractOptions.value = allContracts.value.filter(
      contract => contract.project_name === newProjectName
    );
    values.value.contract_name = ""; // 清空已有的合同选择
  }
);

// 使用 computed 确保类型匹配
const computedProjectOptions = computed(() => projectOptions.value);
const computedContractOptions = computed(() => contractOptions.value);

// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.pay_id) {
    console.error("No payments ID provided for updating.");
    return;
  }
  // 格式化日期
  if (values.value.pay_time) {
    values.value.pay_time = dayjs(values.value.pay_time as string).format(
      "YYYY-MM-DD"
    );
    console.log("Formatted pay_time:", values.value.pay_time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/payments/${values.value.pay_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("项目更新成功！");
  } catch (error) {
    console.error("Failed to update payments:", error);
    alert("项目更新失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "关联项目名称",
    width: 120,
    labelWidth: 100,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions // 动态绑定项目选项
  },
  {
    label: "关联合同名称",
    width: 120,
    labelWidth: 100,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions // 动态绑定合同选项
  },
  {
    label: "支付项类型",
    width: 120,
    labelWidth: 100,
    prop: "pay_type",
    valueType: "select",
    options: [
      {
        label: "其他",
        value: "0",
        color: "yellow"
      },
      {
        label: "已支付并到账",
        value: "1",
        color: "blue"
      },
      {
        label: "已支付在财政",
        value: "2",
        color: "blue"
      },
      {
        label: "已支付中心流程中",
        value: "3",
        color: "blue"
      },
      {
        label: "未支付",
        value: "4",
        color: "blue"
      }
    ]
  },
  {
    label: "支付金额（元）",
    labelWidth: 100,
    prop: "pay_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "支付时间",
    labelWidth: 100,
    prop: "pay_time",
    valueType: "date-picker"
  },
  {
    label: "支付状态",
    labelWidth: 100,
    width: 120,
    prop: "pay_state",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "已支付",
        value: "1",
        color: "blue"
      },
      {
        label: "未支付",
        value: "2",
        color: "blue"
      }
    ]
  },
  {
    label: "备注",
    labelWidth: 100,
    prop: "pay_remark",
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
    title="编辑支付项数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
