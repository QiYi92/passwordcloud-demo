<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 列的定义
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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.initialData) {
    values.value = { ...props.initialData };
  }
});

const handleSubmit = async () => {
  if (!values.value.meeting_id) {
    console.error("No meeting ID provided for updating.");
    return;
  }

  // 格式化日期
  if (values.value.meeting_date) {
    values.value.meeting_date = dayjs(
      values.value.meeting_date as string
    ).format("YYYY-MM-DD");
    console.log("Formatted meeting_date:", values.value.meeting_date);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/meeting/${values.value.meeting_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("会议更新成功！");
  } catch (error) {
    console.error("Failed to update meeting:", error);
    alert("会议更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑会议数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
