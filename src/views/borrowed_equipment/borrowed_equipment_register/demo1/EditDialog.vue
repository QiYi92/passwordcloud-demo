<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});
const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const localVisible = ref(false);

/** label ➝ value 映射工具 */
const getReverseValue = (options, label) => {
  const match = options.find(opt => opt.label === label);
  return match ? match.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.initialData) {
    values.value = {
      ...props.initialData,
      equipment_type: getReverseValue(
        TypeOptions,
        props.initialData.equipment_type
      ),
      status: getReverseValue(StatusOptions, props.initialData.status),
      responsible_department: getReverseValue(
        DepartmentOptions,
        props.initialData.responsible_department
      )
    };
  }
});

const handleSubmit = async () => {
  if (!values.value.id) {
    console.error("缺少 ID，无法更新记录");
    return;
  }

  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/borrowed-equipment/${values.value.id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("设备信息更新成功！");
  } catch (error) {
    console.error("更新失败:", error);
    alert("更新失败");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑外借设备"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
