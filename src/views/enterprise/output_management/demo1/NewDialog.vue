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

// 响应式变量，存储企业名称选项
const enterpriseOptions = ref([]);

// 异步函数加载企业名称数据
const loadEnterpriseNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/enterprise"
    );
    enterpriseOptions.value = data.map(enterprise => ({
      label: enterprise.enterprise_name,
      value: enterprise.enterprise_name
    }));
  } catch (error) {
    console.error("加载企业名称失败：", error);
  }
};

// 初始化组件时加载企业名称数据
onMounted(loadEnterpriseNames);

// 使用computed确保类型匹配
const computedEnterpriseOptions = computed(() => enterpriseOptions.value);

// 获取当前年份
const currentYear = dayjs().startOf("year").toDate(); // 获取当前年初

const columns: PlusColumn[] = [
  {
    label: "企业名称",
    labelWidth: 150,
    width: 120,
    prop: "enterprise_name",
    valueType: "select",
    options: computedEnterpriseOptions // 动态绑定企业名称选项
  },
  {
    label: "年度",
    labelWidth: 150,
    width: 120,
    prop: "year",
    valueType: "date-picker",
    fieldProps: {
      type: "year", // 设置日期选择类型为年
      placeholder: "选择年度",
      defaultValue: currentYear // 使用当前年初作为默认值
    }
  },
  {
    label: "产值",
    labelWidth: 150,
    width: 120,
    prop: "output_value",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "remarks",
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
  // 格式化年度字段
  if (values.value.year) {
    values.value.year = dayjs(values.value.year as string)
      .startOf("year")
      .format("YYYY-MM-DD");
  }
  console.log("格式化年份:", values.value.year); // 打印格式化后的年份

  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/output-record",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("产值记录添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add output record:", error);
    alert("产值记录添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加产值记录"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
