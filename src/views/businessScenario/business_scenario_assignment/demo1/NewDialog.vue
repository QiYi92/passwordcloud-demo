<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

import { ProjectRoomOptions } from "@/views/businessScenario/business_scenario_assignment/data"; // 或替换为业务路径

const columns: PlusColumn[] = [
  {
    label: "业务场景名称",
    labelWidth: 150,
    width: 200,
    prop: "scenario_name",
    valueType: "input"
  },
  {
    label: "责任科室",
    labelWidth: 150,
    width: 150,
    prop: "responsible_dept",
    valueType: "select",
    options: ProjectRoomOptions
  },
  {
    label: "业务场景说明",
    labelWidth: 150,
    width: 200,
    prop: "scenario_description",
    valueType: "textarea",
    fieldProps: {
      maxlength: 2000,
      showWordLimit: true,
      autosize: { minRows: 4, maxRows: 10 }
    }
  },
  {
    label: "备注",
    labelWidth: 150,
    width: 200,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 1000,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 6 }
    }
  }
];

const visible = ref(false);
const values = ref<FieldValues>({});
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  try {
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/business-scenario",
      values.value
    );
    console.log(response.data);
    visible.value = false;
    alert("业务场景添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("添加失败:", error);
    alert("业务场景添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新业务场景</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新业务场景"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
