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
    label: "简介名称",
    labelWidth: 150,
    width: 120,
    prop: "intro_name",
    valueType: "copy"
  },
  {
    label: "责任科室",
    labelWidth: 150,
    width: 120,
    prop: "intro_department",
    valueType: "select",
    options: [
      { label: "其他", value: "0", color: "blue" },
      { label: "安全科", value: "1", color: "blue" },
      { label: "基建科", value: "2", color: "blue" },
      { label: "网站科", value: "3", color: "blue" },
      { label: "电子政务科", value: "4", color: "blue" },
      { label: "资源科", value: "5", color: "blue" }
    ]
  },
  {
    label: "更新时间",
    labelWidth: 150,
    prop: "update_time",
    valueType: "date-picker"
  },
  {
    label: "简介内容",
    labelWidth: 150,
    width: 120,
    prop: "intro_content",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 }
    }
  },
  {
    label: "更新周期",
    labelWidth: 150,
    width: 120,
    prop: "update_cycle",
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
  // 如果未选择时间，设置为今天
  if (!values.value.update_time) {
    values.value.update_time = dayjs().format("YYYY-MM-DD");
  } else {
    values.value.update_time = dayjs(values.value.update_time as string).format(
      "YYYY-MM-DD"
    );
  }

  console.log("Formatted update_time:", values.value.update_time);

  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/intro",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("简介添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add intro:", error);
    alert("简介添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新简介</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新简介"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
