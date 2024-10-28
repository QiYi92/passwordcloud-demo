<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

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
    label: "项目立项总投资（万元）",
    labelWidth: 150,
    width: 120,
    prop: "project_money",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "计划总投资（万元）",
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

const visible = ref(false);
const values = ref<FieldValues>({});

// 定义emit用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  // 确保 project_time 被正确格式化之前发送给后端
  if (values.value.project_time) {
    values.value.project_time = dayjs(
      values.value.project_time as string
    ).format("YYYY-MM-DD"); //报错但是正常运行
    console.log("Formatted project_time:", values.value.project_time);
  }
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/projects",
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("项目添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add project:", error);
    alert("项目添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新数据"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
