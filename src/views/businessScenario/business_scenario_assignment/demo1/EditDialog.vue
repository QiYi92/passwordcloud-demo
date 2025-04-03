<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
import dayjs from "dayjs";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

import { ProjectRoomOptions } from "@/views/businessScenario/business_scenario_assignment/data"; // 或换成 businessScenario 路径

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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);

// 反向转换：label -> value
const reverseConvertDept = (label: string): string => {
  const match = ProjectRoomOptions.find(opt => opt.label === label);
  return match ? match.value : label;
};

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.initialData) {
    values.value = {
      ...props.initialData,
      responsible_dept: props.initialData.responsible_dept
        ? reverseConvertDept(props.initialData.responsible_dept)
        : props.initialData.responsible_dept
    };
  }
});

const handleSubmit = async () => {
  if (!values.value.id) {
    console.error("无 ID，无法更新业务场景");
    return;
  }

  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/business-scenario/${values.value.id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("业务场景更新成功！");
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
    title="编辑业务场景"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
