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

// 引入注册信息模块对应的选项
import { RegistrationRoomOptions } from "@/views/registrationInfo/registration_info/data";

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
      placeholder: "选择有效期"
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

// 接收父组件的 props
const props = defineProps({
  visible: Boolean, // 控制对话框显示状态
  initialData: Object // 传入待编辑的数据
});

// 定义 emit 用于通知父组件事件
const emit = defineEmits(["update:visible", "data-updated"]);

// 控制对话框的显示状态和表单数据
const values = ref<FieldValues>({});
const localVisible = ref(false);

// 反向转换函数：将注册科室的 label 转换为 value
const reverseConvertRegistrationDepartment = (label: string): string => {
  const option = RegistrationRoomOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.initialData) {
    // 初始化表单数据，将日期转换为 YYYY-MM-DD 格式，并对注册科室进行反向转换
    values.value = {
      ...props.initialData,
      validity_period: props.initialData.validity_period
        ? dayjs(props.initialData.validity_period).format("YYYY-MM-DD")
        : "",
      registration_department: props.initialData.registration_department
        ? reverseConvertRegistrationDepartment(
            props.initialData.registration_department
          )
        : props.initialData.registration_department
    };
  }

  if (!props.visible) {
    values.value = {}; // 清空数据
  }
});

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
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/registration-info/${values.value.project_id}`,
      values.value
    );
    console.log("更新成功:", response.data);
    emit("update:visible", false); // 关闭弹窗
    emit("data-updated"); // 通知父组件数据已更新
    alert("注册信息更新成功！");
  } catch (error) {
    console.error("Failed to update registration info:", error);
    alert("注册信息更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑注册信息"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
