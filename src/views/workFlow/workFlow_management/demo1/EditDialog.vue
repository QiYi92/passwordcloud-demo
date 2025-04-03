<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

// 接收 props 和 emits
const props = defineProps({
  visible: Boolean,
  initialData: Object
});

const emit = defineEmits(["update:visible", "data-updated"]);

const localVisible = ref(false);
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
      placeholder: "请输入流程责任人"
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

// 初始化数据
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.initialData) {
    values.value = {
      ...props.initialData
    };
  }

  if (!props.visible) {
    values.value = {};
  }
});

// 提交更新
const handleSubmit = async () => {
  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${values.value.id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("工作流程更新成功！");
  } catch (error) {
    console.error("更新流程失败:", error);
    alert("更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑工作流程"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
