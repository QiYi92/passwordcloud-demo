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
    label: "会议名称",
    labelWidth: 150,
    width: 120,
    prop: "meeting_name",
    valueType: "copy"
  },
  {
    label: "会议地点",
    labelWidth: 150,
    width: 120,
    prop: "meeting_location",
    valueType: "copy"
  },
  {
    label: "会议时间",
    labelWidth: 150,
    prop: "meeting_date",
    valueType: "date-picker"
  },
  {
    label: "会议正文",
    labelWidth: 150,
    width: 120,
    prop: "meeting_body",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 }
    }
  },
  {
    label: "摘要",
    labelWidth: 150,
    width: 120,
    prop: "summary",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 5 }
    }
  }
];

const visible = ref(false);
const values = ref<FieldValues>({});

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  if (values.value.meeting_date) {
    values.value.meeting_date = dayjs(
      values.value.meeting_date as string
    ).format("YYYY-MM-DD");
    console.log("Formatted meeting_date:", values.value.meeting_date);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/meeting",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("会议添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add meeting:", error);
    alert("会议添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新会议</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新会议"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
