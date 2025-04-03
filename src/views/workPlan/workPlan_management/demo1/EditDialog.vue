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

// 引入工作计划模块对应的选项
import {
  ProjectRoomOptions,
  ProjectStatusOptions
} from "@/views/workPlan/workPlan_management/data";

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "计划名称",
    labelWidth: 150,
    prop: "plan_name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入计划名称"
    }
  },
  {
    label: "计划目标",
    labelWidth: 150,
    prop: "plan_goal",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 },
      placeholder: "请输入计划目标"
    }
  },
  {
    label: "责任科室",
    labelWidth: 150,
    prop: "responsible_department",
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
      placeholder: "请选择责任科室"
    }
  },
  {
    label: "计划开始时间",
    labelWidth: 150,
    prop: "start_month",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月份
      placeholder: "选择开始时间"
    }
  },
  {
    label: "计划结束时间",
    labelWidth: 150,
    prop: "end_month",
    valueType: "date-picker",
    fieldProps: {
      type: "month", // 设置日期选择类型为月份
      placeholder: "选择结束时间"
    }
  },
  {
    label: "当前状态",
    labelWidth: 150,
    prop: "current_status",
    valueType: "select",
    options: [
      { label: "计划中", value: "0", color: "green" },
      { label: "进行中", value: "1", color: "orange" },
      { label: "已完成", value: "2", color: "blue" },
      { label: "取消", value: "3", color: "red" },
      { label: "其他", value: "4", color: "gray" }
    ],
    fieldProps: {
      placeholder: "请选择当前状态"
    }
  },
  {
    label: "更新人员",
    labelWidth: 150,
    prop: "update_user",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入更新人员"
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

// 反向转换函数：将责任科室的 label 转换为 value
const reverseConvertDepartment = (label: string): string => {
  const option = ProjectRoomOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 反向转换函数：将当前状态的 label 转换为 value
const reverseConvertStatus = (label: string): string => {
  const option = ProjectStatusOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.initialData) {
    // 初始化表单数据，将日期转换为 YYYY-MM 格式，并对 select 字段进行反向转换
    values.value = {
      ...props.initialData,
      start_month: props.initialData.start_month
        ? dayjs(props.initialData.start_month).format("YYYY-MM")
        : "",
      end_month: props.initialData.end_month
        ? dayjs(props.initialData.end_month).format("YYYY-MM")
        : "",
      responsible_department: props.initialData.responsible_department
        ? reverseConvertDepartment(props.initialData.responsible_department)
        : props.initialData.responsible_department,
      current_status: props.initialData.current_status
        ? reverseConvertStatus(props.initialData.current_status)
        : props.initialData.current_status
    };
  }

  if (!props.visible) {
    values.value = {}; // 清空数据
  }
});

// 提交表单数据
const handleSubmit = async () => {
  // 格式化日期为 `YYYY-MM-01`，确保符合 MySQL DATE 类型
  if (values.value.start_month) {
    const rawStartDate = values.value.start_month as string | Date;
    values.value.start_month = dayjs(rawStartDate).isValid()
      ? dayjs(rawStartDate).format("YYYY-MM-01")
      : "";
  }

  if (values.value.end_month) {
    const rawEndDate = values.value.end_month as string | Date;
    values.value.end_month = dayjs(rawEndDate).isValid()
      ? dayjs(rawEndDate).format("YYYY-MM-01")
      : "";
  }

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/work-plans/${values.value.plan_id}`,
      values.value
    );
    console.log("更新成功:", response.data);
    emit("update:visible", false); // 关闭弹窗
    emit("data-updated"); // 通知父组件数据已更新
    alert("工作计划更新成功！");
  } catch (error) {
    console.error("Failed to update work plan:", error);
    alert("工作计划更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑工作计划"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
