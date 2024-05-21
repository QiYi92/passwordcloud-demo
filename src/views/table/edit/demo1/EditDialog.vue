<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

// 列的定义
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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
  }
});

const handleSubmit = async () => {
  if (!values.value.project_id) {
    console.error("No project ID provided for updating.");
    return;
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/projects/${values.value.project_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("项目更新成功！");
  } catch (error) {
    console.error("Failed to update project:", error);
    alert("项目更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑项目数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
