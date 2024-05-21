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

const columns: PlusColumn[] = [
  {
    label: "支付项名称",
    width: 120,
    prop: "pay_name",
    valueType: "copy"
  },
  {
    label: "合同名称",
    width: 120,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions // 动态绑定选项
  },
  {
    label: "支付项类型",
    width: 120,
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
    prop: "pay_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "支付时间",
    prop: "pay_time",
    valueType: "date-picker"
  },
  {
    label: "支付状态",
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
    prop: "pay_remark",
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
  // 格式化日期
  // 确保 pay_time 被正确格式化之前发送给后端
  if (values.value.pay_time) {
    values.value.pay_time = dayjs(values.value.pay_time as string).format(
      "YYYY-MM-DD"
    ); //报错但是正常运行,勿动！
    console.log("Formatted pay_time:", values.value.pay_time);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/payments",
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
