<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

const columns: PlusColumn[] = [
  {
    label: "单位名称",
    labelWidth: 150,
    width: 120,
    prop: "organization_name",
    valueType: "input"
  },
  {
    label: "联系人",
    labelWidth: 150,
    width: 120,
    prop: "contact_person",
    valueType: "input"
  },
  {
    label: "联系方式",
    labelWidth: 150,
    width: 120,
    prop: "contact_phone",
    valueType: "input"
  },
  {
    label: "备注",
    labelWidth: 150,
    width: 120,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 1000,
      showWordLimit: true,
      autosize: { minRows: 3, maxRows: 10 }
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
      import.meta.env.VITE_APP_SERVER + "/api/organization-contact",
      values.value
    );
    console.log(response.data);
    visible.value = false;
    alert("联系人添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("联系人添加失败:", error);
    alert("联系人添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加联系人</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加联系人"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
