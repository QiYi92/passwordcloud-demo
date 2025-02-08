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

// 导入对应的选项数据，用于反向转换
import {
  ProjectRoomOptions,
  ProjectStateOptions,
  ProjectTypeOptions
} from "@/views/table/edit/data";

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "项目名称",
    labelWidth: 150,
    width: 120,
    prop: "project_name",
    valueType: "copy"
  },
  {
    label: "项目科室",
    labelWidth: 150,
    width: 120,
    prop: "project_room",
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
    label: "项目立项总投资（元）",
    labelWidth: 150,
    width: 120,
    prop: "project_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "计划总投资（元）",
    labelWidth: 150,
    width: 120,
    prop: "project_money_plan",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "项目状态",
    labelWidth: 150,
    width: 120,
    prop: "project_state",
    valueType: "select",
    options: [
      {
        label: "在建",
        value: "0",
        color: "yellow"
      },
      {
        label: "竣工",
        value: "1",
        color: "blue"
      }
    ]
  },
  {
    label: "项目负责人",
    labelWidth: 150,
    width: 120,
    prop: "project_head",
    valueType: "copy"
  },
  {
    label: "类型",
    labelWidth: 150,
    width: 120,
    prop: "project_type",
    valueType: "select",
    options: [
      {
        label: "暂定",
        value: "0",
        color: "yellow"
      },
      {
        label: "建设型",
        value: "1",
        color: "blue"
      },
      {
        label: "服务型",
        value: "2",
        color: "blue"
      }
    ]
  },
  {
    label: "项目立项完成时间",
    labelWidth: 150,
    prop: "project_time",
    valueType: "date-picker"
  },
  {
    label: "备注",
    labelWidth: 150,
    width: 120,
    prop: "project_remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 10 }
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

// 反向转换函数：将项目科室的 label 转换为 value
const reverseConvertRoom = (label: string): string => {
  const option = ProjectRoomOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 反向转换函数：将项目状态的 label 转换为 value
const reverseConvertState = (label: string): string => {
  const option = ProjectStateOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

// 反向转换函数：将类型的 label 转换为 value
const reverseConvertType = (label: string): string => {
  const option = ProjectTypeOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.initialData) {
    values.value = {
      ...props.initialData,
      project_room: props.initialData.project_room
        ? reverseConvertRoom(props.initialData.project_room)
        : props.initialData.project_room,
      project_state: props.initialData.project_state
        ? reverseConvertState(props.initialData.project_state)
        : props.initialData.project_state,
      project_type: props.initialData.project_type
        ? reverseConvertType(props.initialData.project_type)
        : props.initialData.project_type
    };
  }
});

const handleSubmit = async () => {
  if (!values.value.project_id) {
    console.error("No project ID provided for updating.");
    return;
  }
  // 保证 select 类型字段的原始 value 不变
  values.value.project_room ||= props.initialData.project_room;
  values.value.project_state ||= props.initialData.project_state;
  values.value.project_type ||= props.initialData.project_type;

  // 格式化日期
  // 确保 project_time 被正确格式化之前发送给后端
  if (values.value.project_time) {
    values.value.project_time = dayjs(
      values.value.project_time as string
    ).format("YYYY-MM-DD"); //报错但是正常运行
    console.log("Formatted project_time:", values.value.project_time);
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/projects/${values.value.project_id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("项目更新成功！");
  } catch (error) {
    console.error("Failed to update project:", error);
    alert("项目更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑项目数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
