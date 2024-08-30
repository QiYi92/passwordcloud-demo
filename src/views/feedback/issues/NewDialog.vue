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

const columns: PlusColumn[] = [
  {
    label: "类型",
    prop: "type",
    width: "120",
    valueType: "select",
    options: [
      { label: "BUG提交", value: "0" },
      { label: "新需求", value: "1" },
      { label: "功能完善", value: "2" },
      { label: "其他", value: "3" }
    ]
  },
  {
    label: "权重等级",
    prop: "level",
    width: "120",
    valueType: "select",
    options: [
      { label: "常规", value: "0" },
      { label: "不急", value: "1" },
      { label: "紧急", value: "2" },
      { label: "特急", value: "3" },
      { label: "暂停", value: "4" }
    ]
  },
  { label: "责任人", prop: "principal" },
  { label: "标题", prop: "title" },
  {
    label: "描述",
    prop: "describe",
    valueType: "textarea",
    fieldProps: {
      maxlength: 200,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  {
    label: "完成状态",
    prop: "completion",
    width: "120",
    valueType: "select",
    options: [
      { value: "0", label: "待接收" },
      { value: "1", label: "已接收" },
      { value: "2", label: "已完成" },
      { value: "3", label: "不理解需求" },
      { value: "4", label: "开发中" }
    ]
  },
  {
    label: "完成情况说明",
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 50,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  { label: "时间", prop: "time", valueType: "date-picker" }
];

const visible = ref(false);
const values = ref<FieldValues>({});

// 定义emit用于发送事件
const emit = defineEmits(["data-updated"]);

// 重置表单数据
const resetForm = () => {
  values.value = {};
};

const handleOpen = () => {
  resetForm(); // 每次打开对话框时重置表单数据
  // 设置默认时间为当天
  values.value.time = dayjs().format("YYYY-MM-DD");
  // 设置默认的类型为“BUG提交”
  values.value.type = "0";
  // 设置默认的权重等级为“常规”
  values.value.level = "0"; // 对应“常规”
  // 设置默认的完成状态为“待接收”
  values.value.completion = "0"; // 对应“待接收”
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  // 确保 time 被正确格式化之前发送给后端
  if (values.value.time) {
    values.value.time = dayjs(values.value.time as string).format("YYYY-MM-DD");
    console.log("Formatted time:", values.value.time);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/issues",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("反馈添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add issues:", error);
    alert("反馈添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <!-- /*备注*/ -->
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
