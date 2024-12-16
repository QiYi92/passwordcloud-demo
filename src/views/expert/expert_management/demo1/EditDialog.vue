<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits, onMounted } from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

const props = defineProps({
  initialData: Object,
  visible: Boolean
});

const emit = defineEmits(["update:visible", "data-updated"]);
const values = ref<FieldValues>({});
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
  }
});

const handleSubmit = async () => {
  if (!values.value.id) {
    console.error("No expert ID provided for updating.");
    return;
  }
  try {
    const response = await axios.put(
      import.meta.env.VITE_APP_SERVER + `/api/experts/${values.value.id}`, // 修改为 experts 的 API 路径
      values.value
    );
    console.log(response.data);
    emit("update:visible", false);
    emit("data-updated"); // 新增事件，通知数据已更新
    alert("专家信息更新成功！");
  } catch (error) {
    console.error("Failed to update expert:", error);
    alert("专家信息更新失败！");
  }
};

const columns: PlusColumn[] = [
  {
    label: "专家姓名",
    width: 120,
    labelWidth: 100,
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
        value: "0",
        color: "blue"
      },
      {
        label: "数字经济",
        value: "1",
        color: "blue"
      },
      {
        label: "数字政府",
        value: "2",
        color: "blue"
      },
      {
        label: "数字社会",
        value: "3",
        color: "blue"
      },
      {
        label: "经济管理",
        value: "4",
        color: "blue"
      }
    ]
  },
  {
    label: "职称",
    width: 120,
    labelWidth: 100,
    prop: "title",
    valueType: "input"
  },
  {
    label: "联系方式",
    width: 120,
    labelWidth: 100,
    prop: "contact_info",
    valueType: "input"
  },
  {
    label: "工作单位",
    width: 120,
    labelWidth: 100,
    prop: "work_unit",
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
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑专家信息"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
