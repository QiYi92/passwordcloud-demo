<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 获取当前年月对应的 Date 对象
const currentMonth = dayjs().startOf("month").toDate(); // 转换为 Date 类型

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "日期",
    labelWidth: 150,
    prop: "date",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月
      placeholder: "选择年月",
      defaultValue: currentMonth // 使用 Date 类型作为默认值
    }
  },
  {
    label: "区域",
    labelWidth: 150,
    prop: "region",
    valueType: "select", // 修改为下拉选择框
    fieldProps: {
      placeholder: "请选择区域"
    },
    options: [
      { label: "文昌机房", value: "0", color: "blue" },
      { label: "三中路办公区", value: "1", color: "blue" },
      { label: "其他", value: "2", color: "blue" }
    ]
  },
  {
    label: "耗电量（度）",
    labelWidth: 150,
    prop: "electricity_consumption", // 使用后端期望的字段名
    valueType: "input-number",
    fieldProps: {
      placeholder: "输入耗电量",
      min: 0
    }
  }
];

// 控制对话框显示状态
const visible = ref(false);
const values = ref<FieldValues>({
  date: currentMonth // 初始化表单值中的日期为当前年月
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
  if (values.value.date) {
    const rawDate = values.value.date as string | Date;
    const formattedDate = dayjs(rawDate).isValid()
      ? dayjs(rawDate).format("YYYY-MM")
      : "";
    values.value.date = formattedDate;
  }

  try {
    // 向后端发送 POST 请求
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/energy",
      values.value
    );
    visible.value = false; // 关闭对话框
    alert("能耗记录添加成功！");
    emit("data-updated"); // 发射事件通知父组件刷新数据
    window.dispatchEvent(new Event("energy-changed"));
  } catch (error) {
    console.error("Failed to add energy record:", error);
    alert("能耗记录添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新能耗记录</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新能耗记录"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
