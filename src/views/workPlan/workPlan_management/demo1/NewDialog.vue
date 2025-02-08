<script setup lang="ts">
import axios from "axios";
import { defineEmits, ref } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type FieldValues,
  type PlusColumn,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 获取当前年月对应的 Date 对象
const currentMonth = dayjs().startOf("month").toDate(); // 转换为 Date 类型

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "计划名称",
    labelWidth: 150,
    prop: "plan_name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入计划名称"
    }
  },
  {
    label: "计划目标",
    labelWidth: 150,
    prop: "plan_goal",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 },
      placeholder: "请输入计划目标"
    }
  },
  {
    label: "责任科室",
    labelWidth: 150,
    prop: "responsible_department",
    valueType: "select",
    options: [
      { label: "其他", value: "0", color: "blue" },
      { label: "安全科", value: "1", color: "blue" },
      { label: "基建科", value: "2", color: "blue" },
      { label: "网站科", value: "3", color: "blue" },
      { label: "电子政务科", value: "4", color: "blue" },
      { label: "资源科", value: "5", color: "blue" }
    ],
    fieldProps: {
      placeholder: "请选择责任科室"
    }
  },
  {
    label: "计划开始时间",
    labelWidth: 150,
    prop: "start_month",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月份
      placeholder: "选择开始时间",
      defaultValue: currentMonth // 使用 Date 类型作为默认值
    }
  },
  {
    label: "计划结束时间",
    labelWidth: 150,
    prop: "end_month",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月份
      placeholder: "选择结束时间",
      defaultValue: currentMonth // 使用 Date 类型作为默认值
    }
  },
  {
    label: "当前状态",
    labelWidth: 150,
    prop: "current_status",
    valueType: "select",
    options: [
      { label: "计划中", value: "0", color: "green" },
      { label: "进行中", value: "1", color: "orange" },
      { label: "已完成", value: "2", color: "blue" },
      { label: "取消", value: "3", color: "red" },
      { label: "其他", value: "4", color: "gray" }
    ],
    fieldProps: {
      placeholder: "请选择当前状态"
    }
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 1000,
      showWordLimit: true,
      autosize: { minRows: 3, maxRows: 10 },
      placeholder: "请输入备注"
    }
  }
];

// 控制对话框显示状态
const visible = ref(false);
const values = ref<FieldValues>({
  start_month: currentMonth, // 初始化开始时间为当前月份
  end_month: currentMonth // 初始化结束时间为当前月份
});

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

// 打开对话框
const handleOpen = () => {
  visible.value = true;
};

// 提交表单数据
const handleSubmit = async () => {
  // 检查并确保日期为有效的 string 类型
  if (values.value.start_month) {
    const rawStartDate = values.value.start_month as string | Date;
    values.value.start_month = dayjs(rawStartDate).isValid()
      ? dayjs(rawStartDate).startOf("month").format("YYYY-MM-DD")
      : "";
  }

  if (values.value.end_month) {
    const rawEndDate = values.value.end_month as string | Date;
    values.value.end_month = dayjs(rawEndDate).isValid()
      ? dayjs(rawEndDate).startOf("month").format("YYYY-MM-DD")
      : "";
  }

  try {
    // 发送 POST 请求
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/work-plans",
      values.value
    );
    visible.value = false; // 关闭对话框
    alert("工作计划添加成功！");
    emit("data-updated"); // 发射事件通知父组件刷新数据
  } catch (error) {
    console.error("Failed to add work plan:", error);
    alert("工作计划添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新工作计划</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新工作计划"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
