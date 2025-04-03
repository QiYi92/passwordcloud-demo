<script setup lang="ts">
import axios from "axios";
import { defineEmits, ref } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type FieldValues,
  type PlusColumn,
  PlusDialogForm
} from "plus-pro-components";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

const visible = ref(false);
const values = ref<FieldValues>({});

// 表单字段配置
const columns: PlusColumn[] = [
  {
    label: "流程名称",
    labelWidth: 150,
    prop: "name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入流程名称"
    }
  },
  {
    label: "流程类型",
    labelWidth: 150,
    prop: "type",
    valueType: "select",
    options: FlowTypeOptions,
    fieldProps: {
      placeholder: "请选择流程类型"
    }
  },
  {
    label: "状态",
    labelWidth: 150,
    prop: "status",
    valueType: "select",
    options: FlowStatusOptions,
    fieldProps: {
      placeholder: "请选择流程状态"
    }
  },
  {
    label: "流程责任",
    labelWidth: 150,
    prop: "owner",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入流程责任人或责任科室"
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
      placeholder: "请输入备注信息"
    }
  }
];

const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  values.value = {}; // 重置表单
  visible.value = true;
};

const handleSubmit = async () => {
  try {
    await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/workflows",
      values.value
    );
    visible.value = false;
    alert("工作流程添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("添加工作流程失败:", error);
    alert("添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新工作流程</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新工作流程"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
