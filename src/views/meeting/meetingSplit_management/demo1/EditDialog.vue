<script setup lang="ts">
import axios from "axios";
import {
  ref,
  defineProps,
  defineEmits,
  watchEffect,
  computed,
  onMounted
} from "vue";
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
const computedMeetingOptions = computed(() => meetingOptions.value || []);

// 列的定义
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

// 定义 props 和 emits
const props = defineProps({
  initialData: Object, // 接收初始数据
  visible: Boolean // 控制对话框显示状态
});
const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({
  meeting_name: "",
  meeting_type: "",
  meeting_content: "",
  department_personnel: "",
  time_limit: "",
  progress: "",
  remarks: ""
});
const localVisible = ref(false);

// 监听 props 变化
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
  }
});

// 提交数据
const handleSubmit = async () => {
  if (!values.value.split_id) {
    console.error("No split ID provided for updating.");
    return;
  }

  // 格式化日期字段
  if (values.value.time_limit) {
    values.value.time_limit = dayjs(values.value.time_limit as string).format(
      "YYYY-MM-DD"
    );
  }

  // 处理 select 类型字段，将 label 转换为 value
  const selectFields = ["meeting_name", "meeting_type", "progress"];
  selectFields.forEach(field => {
    if (values.value[field]) {
      // 查找对应的 options
      const options = columns.find(col => col.prop === field)?.options;
      if (Array.isArray(options)) {
        const selectedOption = options.find(
          option => option.label === values.value[field]
        );
        if (selectedOption) {
          values.value[field] = selectedOption.value; // 确保写入数据库的是 value
        }
      }
    }
  });

  // 提交数据到后端
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting-split/${values.value.split_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false); // 关闭对话框
    emit("data-updated"); // 通知父组件数据已更新
    alert("会议拆分记录更新成功！");
  } catch (error) {
    console.error("Failed to update meeting split record:", error);
    alert("会议拆分记录更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑会议拆分记录"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
