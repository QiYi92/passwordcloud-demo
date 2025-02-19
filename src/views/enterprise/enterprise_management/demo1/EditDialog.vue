<script setup lang="ts">
import {
  ref,
  defineProps,
  watch,
  defineEmits,
  computed,
  watchEffect
} from "vue";
import axios from "axios";
import provincesJson from "@/views/enterprise/enterprise_management/provinces.json";
import citiesJson from "@/views/enterprise/enterprise_management/cities.json";
import "plus-pro-components/es/components/dialog-form/style/css";
import { LargeScaleOptions } from "@/views/enterprise/enterprise_management/data";

import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";

// 接收父组件的 props
const props = defineProps({
  visible: Boolean, // 控制弹窗显示状态
  initialData: Object // 传入待编辑的数据
});

// 省份和地市数据
const provinces = provincesJson; // 从provinces.json文件中获取省份数据
const cities = citiesJson; // 从cities.json文件中获取所有城市的数据

// 存储省份和地市的选项
const provinceOptions = ref([]);
const cityOptions = ref([]);

// 表单数据（提前初始化）
const values = ref<FieldValues>({});

// 控制对话框显示状态
const localVisible = ref(false);

// 反向转换函数：将是否上规的 label 转换为 value
const reverseConvertLargeScale = (label: string): string => {
  const option = LargeScaleOptions.find(opt => opt.label === label);
  return option ? option.value : label;
};
const reverseConvertProvince = (label: string): string => {
  const option = provinces.find(province => province.name === label);
  return option ? option.code : label;
};
// 反向转换函数：将地市的 label 转换为 value
const reverseConvertCity = (label: string): string => {
  const option = cities.find(city => city.name === label);
  return option ? option.code : label;
};

// 监听省份的选择变化，动态更新地市的选项
watch(
  () => values.value.province,
  newProvinceCode => {
    console.log("选择的省份代码：", newProvinceCode); // 输出选择的省份代码（用于调试）

    if (newProvinceCode) {
      // 如果选择了省份，就过滤出该省的所有地市
      const filteredCities = cities.filter(
        city => city.provinceCode === newProvinceCode
      );
      cityOptions.value = Array.from(filteredCities); // 更新地市选项
      console.log("更新后的地市选项：", cityOptions.value); // 输出更新后的地市选项（用于调试）
    } else {
      // 如果没有选择省份，可以清空地市选项
      cityOptions.value = [];
      console.log("没有选择省份，清空地市选项");
    }
  }
);

// 初始化时根据当前选择的省份加载地市数据
watchEffect(() => {
  const selectedProvince = values.value.province;

  if (props.visible && props.initialData) {
    values.value = {
      ...props.initialData,
      is_large_scale: props.initialData.is_large_scale
        ? reverseConvertLargeScale(props.initialData.is_large_scale)
        : props.initialData.is_large_scale,
      province: props.initialData.province
        ? reverseConvertProvince(props.initialData.province)
        : props.initialData.province,
      city: props.initialData.city
        ? reverseConvertCity(props.initialData.city)
        : props.initialData.city
    };
  }

  if (selectedProvince) {
    // 如果已经选择了省份
    console.log("初始检查的省份代码：", selectedProvince); // 输出选择的省份代码（用于调试）

    // 如果省份是以名称存储的，可以通过名称查找对应的省份代码
    const newProvinceCode = provinces.find(
      province => province.name === selectedProvince
    )?.code;

    if (newProvinceCode) {
      // 过滤出该省份下的所有地市
      const filteredCities = cities.filter(
        city => city.provinceCode === newProvinceCode
      );
      cityOptions.value = Array.from(filteredCities); // 更新地市选项
      console.log("初始化加载地市选项：", cityOptions.value); // 输出初始化加载后的地市选项（用于调试）
    }
  }
});

// 定义 emit 用于通知父组件事件
const emit = defineEmits(["update:visible", "data-updated"]);

// 控制对话框的显示状态和表单数据
watch(
  () => props.visible,
  newVisible => {
    localVisible.value = newVisible;

    if (newVisible && props.initialData) {
      // 初始化表单数据
      values.value = { ...props.initialData };
    }

    if (!newVisible) {
      values.value = {}; // 清空数据
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
      label: province.name, // 省份名称
      value: province.code // 省份代码
    }))
  },
  {
    label: "地市",
    labelWidth: 150,
    prop: "city",
    valueType: "select", // 改为下拉选择框
    fieldProps: {
      placeholder: "请选择地市"
    },
    options: computed(
      () =>
        cityOptions.value.length > 0
          ? cityOptions.value.map(city => ({
              label: city.name, // 城市名称
              value: city.code // 城市代码
            }))
          : [] // 如果没有城市选项，则返回空数组
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

// 提交表单数据
const handleSubmit = async () => {
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/enterprise/${values.value.enterprise_id}`,
      values.value
    );
    console.log("更新成功:", response.data);
    emit("update:visible", false); // 关闭弹窗
    emit("data-updated"); // 通知父组件数据已更新
    alert("企业信息更新成功！");
  } catch (error) {
    console.error("Failed to update enterprise:", error);
    alert("企业信息更新失败，请稍后重试！");
  }
};
</script>

<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑企业信息"
    confirm-text="保存"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  />
</template>
