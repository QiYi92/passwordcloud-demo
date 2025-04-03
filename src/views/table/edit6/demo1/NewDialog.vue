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

const contractOptions = ref([]);
const allContracts = ref([]);

const values = ref<FieldValues>({});
const visible = ref(false);
const emit = defineEmits(["data-updated"]);

const currentMonth = dayjs().startOf("month").toDate();

// 异步函数加载合同名称数据
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
    contractOptions.value = allContracts.value; // 初始化合同选项
  } catch (error) {
    console.error("加载合同名称失败:", error);
  }
};

onMounted(() => {
  loadContractNames();
});

// 使用computed确保项目和合同名称选项正确
const computedContractOptions = computed(() => contractOptions.value);

const columns: PlusColumn[] = [
  {
    label: "关联合同名称",
    labelWidth: 120,
    width: 200,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions
  },
  {
    label: "约定支付月份",
    labelWidth: 120,
    prop: "date",
    valueType: "date-picker",
    fieldProps: {
      type: "month",
      placeholder: "选择年月",
      defaultValue: currentMonth
    }
  },
  {
    label: "应付金额（元）",
    labelWidth: 120,
    prop: "payable_amount",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "支付顺序",
    labelWidth: 120,
    prop: "payment_order",
    valueType: "input-number",
    fieldProps: { min: 1, step: 1 }
  },
  {
    label: "备注",
    labelWidth: 120,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 6 }
    }
  }
];

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 将 date 转换为字符串后处理，或先用 instanceof Date 判断
  if (values.value.date) {
    values.value.date = dayjs(values.value.date as Date)
      .startOf("month")
      .format("YYYY-MM-DD");
  }

  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/pay-plans",
      values.value
    );
    console.log("新增结果:", response.data);
    visible.value = false;
    alert("支付计划添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("添加失败:", error);
    alert("添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加支付计划"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
