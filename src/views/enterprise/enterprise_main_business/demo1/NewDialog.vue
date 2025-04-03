<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, onMounted, computed } from "vue";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import { BusinessOrProductOptions } from "@/views/enterprise/enterprise_main_business/data";
import dayjs from "dayjs";

// 控制弹窗显示
const visible = ref(false);

// 表单数据
const values = ref<FieldValues>({
  enterprise_name: "",
  business_name: "",
  business: "",
  remark: ""
});

// 企业名称选项（动态加载）
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

// 表单配置项
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
      placeholder: "请选择业务类型"
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

// 提交和事件绑定
const emit = defineEmits(["data-updated"]);
const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  try {
    const payload = {
      ...values.value,
      update_time: dayjs().format("YYYY-MM-DD HH:mm:ss") // 自动填入时间
    };

    await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/enterprise-business",
      payload
    );

    visible.value = false;
    alert("业务类型添加成功！");
    emit("data-updated");
  } catch (error) {
    console.error("业务类型添加失败:", error);
    alert("添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加主营业务</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加业务类型记录"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
