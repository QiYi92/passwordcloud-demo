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
    label: "专家姓名",
    labelWidth: 100,
    width: 120,
    prop: "name",
    valueType: "input"
  },
  {
    label: "专业领域",
    width: 120,
    labelWidth: 100,
    prop: "expertise_area",
    valueType: "select",
    options: [
      {
        label: "数字设施",
        value: "数字设施",
        color: "blue"
      },
      {
        label: "数字经济",
        value: "数字经济",
        color: "blue"
      },
      {
        label: "数字政府",
        value: "数字经济",
        color: "blue"
      },
      {
        label: "数字社会",
        value: "数字经济",
        color: "blue"
      },
      {
        label: "经济管理",
        value: "数字经济",
        color: "blue"
      }
    ]
  },
  {
    label: "职称",
    labelWidth: 100,
    width: 120,
    prop: "title",
    valueType: "input"
  },
  {
    label: "联系方式",
    labelWidth: 100,
    width: 120,
    prop: "contact_info",
    valueType: "input"
  },
  {
    label: "工作单位",
    labelWidth: 100,
    width: 120,
    prop: "work_unit",
    valueType: "input"
  },
  {
    label: "所在地",
    width: 120,
    labelWidth: 100,
    prop: "location",
    valueType: "select",
    options: [
      { label: "柳州市", value: "柳州市" },
      { label: "本地", value: "本地" },
      { label: "外地", value: "外地" }
    ]
  },
  {
    label: "现任职务",
    width: 120,
    labelWidth: 100,
    prop: "current_position",
    valueType: "input"
  },
  {
    label: "现从事专业",
    width: 120,
    labelWidth: 100,
    prop: "current_expertise",
    valueType: "input"
  },
  {
    label: "备注",
    labelWidth: 100,
    prop: "remarks",
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
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/experts", // 修改为 experts 的 API 路径
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("专家信息添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add expert:", error);
    alert("专家信息添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新专家"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
