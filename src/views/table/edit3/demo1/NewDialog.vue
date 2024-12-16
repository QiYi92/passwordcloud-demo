<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted, computed, watch, nextTick } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 响应式变量，存储项目名称和合同名称选项
const projectOptions = ref([]);
const contractOptions = ref([]);
const allContracts = ref([]);
const loading = ref(true); // 用于控制加载状态
const values = ref<FieldValues>({}); // 初始化 values

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

// 初始化组件时加载项目名称和合同名称数据
onMounted(() => {
  loadProjectNames();
  loadContractNames();
});

// 使用 nextTick 确保 values 已经初始化
onMounted(() => {
  nextTick(() => {
    // 在组件加载完毕后，开始监视 values
    watch(
      () => values.value.project_name,
      newProjectName => {
        contractOptions.value = allContracts.value.filter(
          contract => contract.project_name === newProjectName
        );
        values.value.contract_name = ""; // 清空合同名称
      }
    );
  });
});

// 使用computed确保项目和合同名称选项正确
const computedProjectOptions = computed(() => projectOptions.value);
const computedContractOptions = computed(() => contractOptions.value);

const columns: PlusColumn[] = [
  {
    label: "关联项目名称",
    labelWidth: 100,
    width: 120,
    prop: "project_name",
    valueType: "select",
    options: computedProjectOptions // 使用动态加载的项目名称选项
  },
  {
    label: "关联合同名称",
    labelWidth: 100,
    width: 120,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions // 根据选中的项目名称筛选合同名称选项
  },
  {
    label: "支付项类型",
    width: 120,
    labelWidth: 100,
    prop: "pay_type",
    valueType: "select",
    options: [
      { label: "其他", value: "0", color: "yellow" },
      { label: "已支付并到账", value: "1", color: "blue" },
      { label: "已支付在财政", value: "2", color: "blue" },
      { label: "已支付中心流程中", value: "3", color: "blue" },
      { label: "未支付", value: "4", color: "blue" }
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
      { label: "暂定", value: "0", color: "yellow" },
      { label: "已支付", value: "1", color: "blue" },
      { label: "未支付", value: "2", color: "blue" }
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

const visible = ref(false);

// 定义emit用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 如果用户没有选择支付时间，则默认填入当前日期
  if (!values.value.pay_time) {
    values.value.pay_time = dayjs().format("YYYY-MM-DD"); // 设置为当前日期
  } else {
    // 如果选择了日期，格式化为指定格式
    values.value.pay_time = dayjs(values.value.pay_time as string).format(
      "YYYY-MM-DD"
    );
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
