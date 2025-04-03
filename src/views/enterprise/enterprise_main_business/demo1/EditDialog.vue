<script setup lang="ts">
import {
  ref,
  defineProps,
  defineEmits,
  watch,
  watchEffect,
  computed,
  onMounted
} from "vue";
import axios from "axios";
import dayjs from "dayjs";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import { BusinessOrProductOptions } from "@/views/enterprise/enterprise_main_business/data";

// 接收 props
const props = defineProps({
  visible: Boolean,
  initialData: Object
});

// 控制弹窗
const localVisible = ref(false);

// 表单数据
const values = ref<FieldValues>({});

// 企业下拉选项（动态加载）
const enterpriseOptions = ref([]);
const loadEnterpriseNames = async () => {
  try {
    const { data } = await axios.get(
      import.meta.env.VITE_APP_SERVER + "/api/enterprise"
    );
    enterpriseOptions.value = data.map(item => ({
      label: item.enterprise_name,
      value: item.enterprise_name
    }));
  } catch (error) {
    console.error("加载企业名称失败:", error);
  }
};
onMounted(loadEnterpriseNames);

const computedEnterpriseOptions = computed(() => enterpriseOptions.value);

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "企业名称",
    labelWidth: 150,
    prop: "enterprise_name",
    valueType: "select",
    fieldProps: {
      placeholder: "请选择企业名称"
    },
    options: computedEnterpriseOptions
  },
  {
    label: "业务&产品名称",
    labelWidth: 150,
    prop: "business_name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入业务或产品名称"
    }
  },
  {
    label: "业务类型",
    labelWidth: 150,
    prop: "business",
    valueType: "select",
    fieldProps: {
      placeholder: "请选择主营业务"
    },
    options: BusinessOrProductOptions
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      placeholder: "请输入备注",
      maxlength: 300,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 6 }
    }
  }
];

// 同步弹窗显示状态
watch(
  () => props.visible,
  newVal => {
    localVisible.value = newVal;

    if (newVal && props.initialData) {
      values.value = { ...props.initialData };
    }

    if (!newVal) {
      values.value = {};
    }
  }
);

// 用于通知父组件事件
const emit = defineEmits(["update:visible", "data-updated"]);

// 提交表单
const handleSubmit = async () => {
  try {
    const payload = {
      ...values.value,
      update_time: dayjs().format("YYYY-MM-DD HH:mm:ss")
    };

    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/enterprise-business/${values.value.id}`,
      payload
    );

    emit("update:visible", false);
    emit("data-updated");
    alert("主营业务信息更新成功！");
  } catch (error) {
    console.error("更新失败:", error);
    alert("更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑主营业务记录"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
