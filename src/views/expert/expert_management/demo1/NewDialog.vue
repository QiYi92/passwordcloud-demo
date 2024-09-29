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
    labelWidth: 100,
    width: 120,
    prop: "expertise_area",
    valueType: "input"
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
    label: "备注",
    labelWidth: 100,
    prop: "remark",
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
