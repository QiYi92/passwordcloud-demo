<script setup lang="ts">
/* eslint-disable */
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  onMounted,
  computed
} from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 响应式变量，存储企业名称选项
const enterpriseOptions = ref([]);

// 异步函数加载企业名称数据
const loadEnterpriseNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/enterprise"
    );
    enterpriseOptions.value = data.map(enterprise => ({
      label: enterprise.enterprise_name,
      value: enterprise.enterprise_name
    }));
  } catch (error) {
    console.error("加载企业名称失败：", error);
  }
};

// 初始化组件时加载企业名称数据
onMounted(loadEnterpriseNames);

// 使用computed确保类型匹配
const computedEnterpriseOptions = computed(() => enterpriseOptions.value);

// 从父组件接收的初始数据和可见性状态
const props = defineProps({
  initialData: Object,
  visible: Boolean
});
// 发射事件到父组件的方法
const emit = defineEmits(["update:visible", "data-updated"]);
// 本地表单值的响应式状态
const values = ref<FieldValues>({});
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    // 将初始数据加载到表单中
    values.value = { ...props.initialData };
    // 如果有年份字段，确保格式化为日期
    if (props.initialData.year) {
      values.value.year = dayjs(props.initialData.year).format("YYYY-MM-DD");
    }
  }
  if (!props.visible) {
    values.value = {}; // 清空数据
  }
});

// 提交表单的事件处理函数
const handleSubmit = async () => {
  // 格式化年度字段
  if (values.value.year) {
    values.value.year = dayjs(values.value.year as string)
      .startOf("year")
      .format("YYYY-MM-DD");
  }

  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/output-record/${values.value.record_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("产值记录更新成功！");
  } catch (error) {
    console.error("Failed to update output record:", error);
    alert("产值记录更新失败！");
  }
};

// 表单列的定义
const columns: PlusColumn[] = [
  {
    label: "企业名称",
    labelWidth: 150,
    width: 120,
    prop: "enterprise_name",
    valueType: "select",
    options: computedEnterpriseOptions // 动态绑定企业名称选项
  },
  {
    label: "年度",
    labelWidth: 150,
    width: 120,
    prop: "year",
    valueType: "date-picker",
    fieldProps: {
      type: "year", // 设置日期选择类型为年
      placeholder: "选择年度"
    }
  },
  {
    label: "产值",
    labelWidth: 150,
    width: 120,
    prop: "output_value",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "remarks",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
    }
  }
];
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑产值记录"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
