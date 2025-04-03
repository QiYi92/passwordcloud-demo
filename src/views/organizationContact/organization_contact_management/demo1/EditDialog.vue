<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import axios from "axios";
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

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.initialData) {
    values.value = { ...props.initialData };
  }
});

const handleSubmit = async () => {
  if (!values.value.id) {
    console.error("未提供联系人 ID，无法更新");
    return;
  }

  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER +
        `/api/organization-contact/${values.value.id}`,
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("联系人更新成功！");
  } catch (error) {
    console.error("联系人更新失败:", error);
    alert("联系人更新失败！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑联系人信息"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
