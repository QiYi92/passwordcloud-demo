<script setup lang="ts">
import axios from "axios";
import { ref, defineEmits, watch, computed } from "vue";
import provincesJson from "@/views/enterprise/enterprise_management/provinces.json";
import citiesJson from "@/views/enterprise/enterprise_management/cities.json";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 省份和地市数据
const provinces = provincesJson; // 省份数据
const cities = citiesJson; // 所有地市数据

// 存储省份和地市的选项
const provinceOptions = ref([]);
const cityOptions = ref([]);

// 控制对话框显示状态
const visible = ref(false);

// 表单数据（提前初始化）
const values = ref<FieldValues>({
  enterprise_name: "", // 默认值为空
  contact_person: "", // 默认值为空
  is_large_scale: "", // 默认值为空
  province: "",
  city: "",
  remarks: ""
});

// 动态更新地市选项
// 监听省份的选择变化，动态更新地市的选项
watch(
  () => values.value.province,
  newProvinceCode => {
    console.log("选择的省份代码：", newProvinceCode); // 输出选择的省份代码（用于调试）

    // 每次选择新的省份时，清空已经选中的地市
    values.value.city = "";

    if (newProvinceCode) {
      // 如果选择了省份，就过滤出该省的所有地市
      const filteredCities = cities.filter(
        city => city.provinceCode === newProvinceCode
      );
      cityOptions.value = Array.from(filteredCities); // 更新地市选项
      console.log("更新后的地市选项：", cityOptions.value); // 输出更新后的地市选项（用于调试）
    } else {
      // 如果没有选择省份，则清空地市选项
      cityOptions.value = [];
      console.log("没有选择省份，清空地市选项");
    }
  }
);

// 表单列配置
const columns: PlusColumn[] = [
  {
    label: "企业名称",
    labelWidth: 150,
    prop: "enterprise_name",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入企业名称"
    }
  },
  {
    label: "联系人",
    labelWidth: 150,
    prop: "contact_person",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入联系人"
    }
  },
  {
    label: "是否上规",
    labelWidth: 150,
    prop: "is_large_scale",
    valueType: "select", // 下拉选择框
    fieldProps: {
      placeholder: "请选择是否上规"
    },
    options: [
      { label: "否", value: "0" },
      { label: "是", value: "1" }
    ]
  },
  {
    label: "省份",
    labelWidth: 150,
    prop: "province",
    valueType: "select", // 改为下拉选择框
    fieldProps: {
      placeholder: "请选择省份"
    },
    options: provinces.map(province => ({
      label: province.name,
      value: province.code
    }))
  },
  {
    label: "地市",
    labelWidth: 150,
    prop: "city",
    valueType: "select",
    fieldProps: {
      placeholder: "请选择地市"
    },
    options: computed(
      () =>
        cityOptions.value.length > 0
          ? cityOptions.value.map(city => ({
              label: city.name,
              value: city.code
            }))
          : [] // 确保传递的是普通数组
    )
  },
  {
    label: "备注",
    labelWidth: 150,
    prop: "remarks",
    valueType: "input",
    fieldProps: {
      placeholder: "请输入备注"
    }
  }
];

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

// 打开对话框
const handleOpen = () => {
  visible.value = true;
};

// 提交表单数据
const handleSubmit = async () => {
  try {
    // 向后端发送 POST 请求
    const response = await axios.post(
      import.meta.env.VITE_APP_SERVER + "/api/enterprise",
      values.value
    );
    visible.value = false; // 关闭对话框
    alert("企业信息添加成功！");
    emit("data-updated"); // 发射事件通知父组件刷新数据
  } catch (error) {
    console.error("Failed to add enterprise:", error);
    alert("企业信息添加失败，请稍后重试！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新企业</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新企业"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  />
</template>
