<script setup lang="ts">
import {
  ref,
  defineProps,
  defineEmits,
  watchEffect,
  computed,
  onMounted
} from "vue";
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

const contractOptions = ref([]);
const computedContractOptions = computed(() => contractOptions.value);

// 加载合同选项
const loadContractNames = async () => {
  try {
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/contracts`
    );
    contractOptions.value = data.map(contract => ({
      label: contract.contract_name,
      value: contract.contract_name
    }));
  } catch (error) {
    console.error("加载合同名称失败:", error);
  }
};

// 初始化加载合同数据
onMounted(() => {
  loadContractNames();
});

// 控制组件可见性 + 初始化表单值
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = {
      ...props.initialData,
      date: props.initialData.date
        ? dayjs(props.initialData.date).toDate()
        : undefined
    };
  }
});

const handleSubmit = async () => {
  if (!values.value.id) {
    alert("更新失败：缺少 ID");
    return;
  }

  if (values.value.date) {
    values.value.date = dayjs(values.value.date as Date)
      .startOf("month")
      .format("YYYY-MM-DD");
  }

  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/pay-plans/${values.value.id}`,
      values.value
    );
    console.log("更新结果:", response.data);
    emit("update:visible", false);
    emit("data-updated");
    alert("支付计划更新成功！");
  } catch (error) {
    console.error("更新失败:", error);
    alert("支付计划更新失败！");
  }
};

const columns: PlusColumn[] = [
  {
    label: "关联合同名称",
    labelWidth: 120,
    width: 200,
    prop: "contract_name",
    valueType: "select",
    options: computedContractOptions
  },
  {
    label: "约定支付月份",
    labelWidth: 120,
    prop: "date",
    valueType: "date-picker",
    fieldProps: {
      type: "month",
      placeholder: "选择年月"
    }
  },
  {
    label: "应付金额（元）",
    labelWidth: 120,
    prop: "payable_amount",
    valueType: "input-number",
    fieldProps: { precision: 2, step: 100 }
  },
  {
    label: "支付顺序",
    labelWidth: 120,
    prop: "payment_order",
    valueType: "input-number",
    fieldProps: { min: 1, step: 1 }
  },
  {
    label: "备注",
    labelWidth: 120,
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 6 }
    }
  }
];
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑支付计划"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
