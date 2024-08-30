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
  // 格式化日期
  // 确保 pay_time 被正确格式化之前发送给后端
  if (values.value.time) {
    values.value.time = dayjs(values.value.time as string).format("YYYY-MM-DD"); //报错但是正常运行
    console.log("Formatted pay_time:", values.value.time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/issues/${values.value.id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("反馈更新成功！");
  } catch (error) {
    console.error("Failed to update issues:", error);
    if (error.response) {
      console.error("Error response data:", error.response.data);
    }
    alert("反馈更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑反馈数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
