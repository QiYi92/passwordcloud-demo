<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

import {
  DepartmentOptions,
  TypeOptions,
  StatusOptions
} from "@/views/borrowed_equipment/borrowed_equipment_register/data";

const columns: PlusColumn[] = [
  {
    label: "设备名称",
    labelWidth: 120,
    width: 200,
    prop: "equipment_name",
    valueType: "input"
  },
  {
    label: "品牌型号",
    labelWidth: 120,
    width: 200,
    prop: "brand_model",
    valueType: "input"
  },
  {
    label: "数量",
    labelWidth: 120,
    width: 100,
    prop: "quantity",
    valueType: "input-number",
    fieldProps: { min: 1 }
  },
  {
    label: "类型",
    labelWidth: 120,
    width: 150,
    prop: "equipment_type",
    valueType: "select",
    options: TypeOptions
  },
  {
    label: "固定资产编号",
    labelWidth: 120,
    width: 200,
    prop: "asset_number",
    valueType: "input"
  },
  {
    label: "价值（元）",
    labelWidth: 120,
    width: 150,
    prop: "equipment_value",
    valueType: "input-number",
    fieldProps: { min: 0, step: 100 }
  },
  {
    label: "存放位置",
    labelWidth: 120,
    width: 200,
    prop: "storage_location",
    valueType: "input"
  },
  {
    label: "状态",
    labelWidth: 120,
    width: 150,
    prop: "status",
    valueType: "select",
    options: StatusOptions
  },
  {
    label: "责任科室",
    labelWidth: 120,
    width: 200,
    prop: "responsible_department",
    valueType: "select",
    options: DepartmentOptions
  },
  {
    label: "联系人",
    labelWidth: 120,
    width: 150,
    prop: "contact_person",
    valueType: "input"
  },
  {
    label: "电话",
    labelWidth: 120,
    width: 150,
    prop: "phone_number",
    valueType: "input"
  },
  {
    label: "备注",
    labelWidth: 120,
    width: 250,
    prop: "remarks",
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
      import.meta.env.VITE_APP_SERVER + "/api/borrowed-equipment",
      values.value
    );
    console.log("添加成功：", response.data);
    visible.value = false;
    alert("外借设备添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("添加失败:", error);
    alert("外借设备添加失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加外借设备</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加外借设备"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
