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
// 响应式变量，存储项目名称选项
const contractOptions = ref([]);

// 异步函数加载合同名称数据
const loadContractNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/contracts"
    );
    contractOptions.value = data.map(contract => ({
      label: contract.contract_name,
      value: contract.contract_name
    }));
  } catch (error) {
    console.error("Failed to load contract names:", error);
  }
};
// 初始化组件时加载项目名称数据
onMounted(loadContractNames);
// 使用computed确保类型匹配
const computedContractOptions = computed(() => contractOptions.value);

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
// 监视props.visible变化来更新本地显示状态
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
  }
});
// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.pay_id) {
    console.error("No payments ID provided for updating.");
    return;
  }
  // 格式化日期
  // 确保 pay_time 被正确格式化之前发送给后端
  if (values.value.pay_time) {
    values.value.pay_time = dayjs(values.value.pay_time as string).format(
      "YYYY-MM-DD"
    ); //报错但是正常运行
    console.log("Formatted pay_time:", values.value.pay_time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/payments/${values.value.pay_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("项目更新成功！");
  } catch (error) {
    console.error("Failed to update payments:", error);
    alert("项目更新失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "支付项名称",
    width: 120,
    labelWidth: 100,
    prop: "pay_name",
    valueType: "copy"
  },
  {
    label: "合同名称",
    width: 120,
    labelWidth: 100,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions // 动态绑定选项
  },
  {
    label: "支付项类型",
    width: 120,
    labelWidth: 100,
    prop: "pay_type",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "A类支付项",
        value: "1",
        color: "blue"
      },
      {
        label: "B类支付项",
        value: "2",
        color: "blue"
      }
    ]
  },
  {
    label: "支付金额",
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
