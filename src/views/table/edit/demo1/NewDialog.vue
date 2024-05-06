<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

const columns: PlusColumn[] = [
  {
    label: "项目名称",
    width: 120,
    prop: "project_name",
    valueType: "copy"
  },
  {
    label: "项目科室",
    width: 120,
    prop: "project_room",
    valueType: "copy"
  },
  {
    label: "项目批复资金",
    prop: "project_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "类型",
    width: 120,
    prop: "project_type",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "建设型",
        value: "1",
        color: "blue"
      },
      {
        label: "服务型",
        value: "2",
        color: "blue"
      }
    ]
  },
  {
    label: "备注",
    prop: "project_remark",
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
  try {
    const response = await axios.post(
      "http://localhost:3000/api/projects",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("项目添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add project:", error);
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
