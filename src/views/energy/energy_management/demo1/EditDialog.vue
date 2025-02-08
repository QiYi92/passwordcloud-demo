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

// 区域选项
const regionOptions = [
  { label: "文昌机房", value: "0", color: "blue" },
  { label: "三中路办公区", value: "1", color: "blue" },
  { label: "其他", value: "2", color: "blue" }
];

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "日期",
    labelWidth: 150,
    prop: "date",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月
      placeholder: "请选择年月"
    }
  },
  {
    label: "区域",
    labelWidth: 150,
    prop: "region",
    valueType: "select", // 修改为下拉选择框
    fieldProps: {
      placeholder: "请选择区域"
    },
    options: regionOptions
  },
  {
    label: "耗电量 (度)",
    labelWidth: 150,
    prop: "electricity_consumption", // 确保字段名与后端匹配
    valueType: "input-number",
    fieldProps: {
      placeholder: "请输入耗电量",
      min: 0
    }
  }
];

// 接收父组件的 props
const props = defineProps({
  visible: Boolean, // 控制弹窗显示状态
  initialData: Object // 传入待编辑的数据
});

// 定义 emit 用于通知父组件事件
const emit = defineEmits(["update:visible", "data-updated"]);

// 控制对话框的显示状态和表单数据
const values = ref<FieldValues>({});
const localVisible = ref(false);

// 反向转换函数：将区域的 label 转换为 value
const reverseConvertRegion = (label: string): string => {
  const option = regionOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.initialData) {
    // 初始化表单数据，将日期转换为 YYYY-MM 格式，并对 region 字段进行反向转换
    values.value = {
      ...props.initialData,
      date: props.initialData.date
        ? dayjs(props.initialData.date).format("YYYY-MM")
        : "",
      region: props.initialData.region
        ? reverseConvertRegion(props.initialData.region)
        : props.initialData.region
    };
  }

  if (!props.visible) {
    values.value = {}; // 清空数据
  }
});

// 提交表单数据
const handleSubmit = async () => {
  // 格式化日期为 `YYYY-MM-01`，确保符合 MySQL DATE 类型
  if (values.value.date) {
    const rawDate = values.value.date as string | Date;
    values.value.date = dayjs(rawDate).isValid()
      ? dayjs(rawDate).format("YYYY-MM-01") // 转换为当前月的第一天
      : "";
  }

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/energy/${values.value.energy_id}`,
      values.value
    );
    console.log("更新成功:", response.data);
    emit("update:visible", false); // 关闭弹窗
    emit("data-updated"); // 通知父组件数据已更新
    alert("能耗记录更新成功！");
  } catch (error) {
    console.error("Failed to update energy record:", error);
    alert("能耗记录更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑能耗记录"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
