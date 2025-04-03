<template>
  <el-dialog
    v-model="localVisible"
    title="预览设备信息"
    width="80%"
    @close="handleClose"
  >
    <div style="padding: 20px">
      <el-table
        :data="formattedData"
        style="width: 100%; border: 1px solid #ebeef5"
        border
        layout="fixed"
      >
        <el-table-column
          prop="field"
          label="字段"
          align="center"
          :formatter="formatField"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="180"
        />
        <el-table-column
          prop="value"
          label="数据"
          align="left"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
        >
          <template #default="scope">
            <div style="white-space: pre-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
      </el-table>

      <div
        v-if="formattedData.length === 0"
        style="padding: 20px; text-align: center"
      >
        加载数据失败或数据为空
      </div>
    </div>

    <template #footer>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits } from "vue";
import {
  DepartmentOptions,
  TypeOptions,
  StatusOptions
} from "@/views/borrowed_equipment/borrowed_equipment_register/data";

const props = defineProps({
  visible: Boolean,
  data: Object
});
const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段显示名称映射
const fieldMap = {
  equipment_name: "设备名称",
  brand_model: "品牌型号",
  quantity: "数量",
  equipment_type: "类型",
  asset_number: "固定资产编号",
  equipment_value: "价值（元）",
  storage_location: "存放位置",
  status: "状态",
  responsible_department: "责任科室",
  contact_person: "联系人",
  phone_number: "电话",
  remarks: "备注"
};

// 转换字段值（value → label）
const getLabel = (options, value) => {
  const match = options.find(opt => opt.value === value);
  return match ? match.label : value;
};

const formatField = row => fieldMap[row.field] || row.field;

const formatValue = (key, value) => {
  if (key === "equipment_type") {
    return getLabel(TypeOptions, value);
  }
  if (key === "status") {
    return getLabel(StatusOptions, value);
  }
  if (key === "responsible_department") {
    return getLabel(DepartmentOptions, value);
  }
  return value ?? "（空）";
};

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value: formatValue(key, value)
      }))
      .filter(item => item.field !== "id");
  } else {
    formattedData.value = [];
  }
});

const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false);
};
</script>

<style scoped>
.el-table th {
  font-weight: bold !important;
  background-color: #f2f6fc !important;
  border-right: 1px solid #ebeef5;
}

.el-table th.is-leaf:last-child,
.el-table td.is-leaf:last-child {
  border-right: 1px solid #ebeef5;
}
</style>
