<script setup lang="ts">
import axios from "axios";
import { defineEmits, ref } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type FieldValues,
  type PlusColumn,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 获取当前日期对应的 Date 对象
const currentDate = dayjs().toDate();

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "项目名称",
    labelWidth: 150,
    prop: "project_name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入项目名称"
    }
  },
  {
    label: "注册机构",
    labelWidth: 150,
    prop: "registration_agency",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入注册机构"
    }
  },
  {
    label: "联系方式",
    labelWidth: 150,
    prop: "contact_info",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入联系方式"
    }
  },
  {
    label: "注册科室",
    labelWidth: 150,
    prop: "registration_department",
    valueType: "select",
    options: [
      { label: "其他", value: "0", color: "blue" },
      { label: "安全科", value: "1", color: "blue" },
      { label: "基建科", value: "2", color: "blue" },
      { label: "网站科", value: "3", color: "blue" },
      { label: "电子政务科", value: "4", color: "blue" },
      { label: "资源科", value: "5", color: "blue" }
    ],
    fieldProps: {
      placeholder: "请选择注册科室"
    }
  },
  {
    label: "有效期",
    labelWidth: 150,
    prop: "validity_period",
    valueType: "date-picker",
    fieldProps: {
      type: "date",
      placeholder: "选择有效期",
      defaultValue: currentDate
    }
  },
  {
    label: "是否需要续费",
    labelWidth: 150,
    prop: "is_renewable",
    valueType: "select",
    options: [
      { label: "是", value: 1, color: "green" },
      { label: "否", value: 0, color: "red" }
    ],
    fieldProps: {
      placeholder: "请选择是否需要续费"
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
      placeholder: "请输入备注"
    }
  }
];

// 控制对话框显示状态
const visible = ref(false);
const values = ref<FieldValues>({
  validity_period: currentDate, // 初始化有效期为当前日期
  is_renewable: 0 // 初始化为“不需要续费”
});

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

// 打开对话框
const handleOpen = () => {
  visible.value = true;
};

// 提交表单数据
const handleSubmit = async () => {
  // 格式化日期为 `YYYY-MM-DD`
  if (values.value.validity_period) {
    const rawDate = values.value.validity_period as string | Date;
    values.value.validity_period = dayjs(rawDate).isValid()
      ? dayjs(rawDate).format("YYYY-MM-DD")
      : "";
  }

  try {
    // 发送 POST 请求
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/registration-info",
      values.value
    );
    visible.value = false; // 关闭对话框
    alert("注册信息添加成功！");
    emit("data-updated"); // 发射事件通知父组件刷新数据
  } catch (error) {
    console.error("Failed to add registration info:", error);
    alert("注册信息添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新注册信息</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新注册信息"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
