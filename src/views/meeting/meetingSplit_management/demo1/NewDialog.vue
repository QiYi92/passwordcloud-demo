<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted, computed } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 响应式变量，用于存储会议名称选项
const meetingOptions = ref([]);

// 异步函数加载会议名称数据
const loadMeetingNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/meeting"
    );
    meetingOptions.value = data.map(meeting => ({
      label: meeting.meeting_name,
      value: meeting.meeting_name
    }));
  } catch (error) {
    console.error("加载会议名称失败:", error);
  }
};

// 初始化组件时加载会议名称数据
onMounted(loadMeetingNames);

// 确保选项数据类型匹配
const computedMeetingOptions = computed(() => meetingOptions.value);

const columns: PlusColumn[] = [
  {
    label: "选择会议纪要清单",
    labelWidth: 150,
    width: 120,
    prop: "meeting_name",
    valueType: "select",
    options: computedMeetingOptions // 动态绑定选项
  },
  {
    label: "类型",
    labelWidth: 150,
    width: 120,
    prop: "meeting_type",
    valueType: "select",
    options: [
      { label: "决议", value: "0", color: "blue" },
      { label: "工作安排", value: "1", color: "blue" }
    ]
  },
  {
    label: "内容",
    labelWidth: 150,
    width: 120,
    prop: "meeting_content",
    valueType: "textarea",
    fieldProps: {
      maxlength: 2000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 }
    }
  },
  {
    label: "责任科室或人员",
    labelWidth: 150,
    width: 120,
    prop: "department_personnel",
    valueType: "input"
  },
  {
    label: "完成时限",
    labelWidth: 150,
    prop: "time_limit",
    valueType: "date-picker"
  },
  {
    label: "当前进展",
    labelWidth: 150,
    width: 120,
    prop: "progress",
    valueType: "select",
    options: [
      { label: "决议生效", value: "0", color: "blue" },
      { label: "决议取消", value: "1", color: "blue" },
      { label: "工作实施中", value: "2", color: "blue" },
      { label: "工作取消", value: "3", color: "blue" },
      { label: "工作完成", value: "4", color: "blue" },
      { label: "其他", value: "5", color: "blue" }
    ]
  },
  {
    label: "备注",
    labelWidth: 150,
    width: 120,
    prop: "remarks",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 5 }
    }
  }
];

const visible = ref(false);
const values = ref<FieldValues>({});

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  if (values.value.time_limit) {
    values.value.time_limit = dayjs(values.value.time_limit as string).format(
      "YYYY-MM-DD"
    );
    console.log("Formatted time_limit:", values.value.time_limit);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/meeting-split",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("会议拆分记录添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add meeting split record:", error);
    alert("会议拆分记录添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加会议拆分记录</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加会议拆分记录"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
