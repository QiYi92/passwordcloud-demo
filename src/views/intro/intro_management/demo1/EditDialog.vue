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
      {
        label: "其他",
        value: "0",
        color: "blue"
      },
      {
        label: "安全科",
        value: "1",
        color: "blue"
      },
      {
        label: "基建科",
        value: "2",
        color: "blue"
      },
      {
        label: "网站科",
        value: "3",
        color: "blue"
      },
      {
        label: "电子政务科",
        value: "4",
        color: "blue"
      },
      {
        label: "资源科",
        value: "5",
        color: "blue"
      }
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
  if (!values.value.intro_id) {
    console.error("No intro ID provided for updating.");
    return;
  }

  // 格式化日期
  if (values.value.update_time) {
    values.value.update_time = dayjs(values.value.update_time as string).format(
      "YYYY-MM-DD"
    );
    console.log("Formatted update_time:", values.value.update_time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/intro/${values.value.intro_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("简介更新成功！");
  } catch (error) {
    console.error("Failed to update intro:", error);
    alert("简介更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑简介数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
