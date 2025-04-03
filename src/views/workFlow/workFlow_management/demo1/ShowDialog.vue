<template>
  <el-dialog
    v-model="localVisible"
    title="预览工作流程数据"
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
          width="150"
        />
        <el-table-column
          prop="value"
          label="数据"
          align="left"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="600"
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
import dayjs from "dayjs";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段名称映射
const fieldMap = {
  name: "流程名称",
  type: "流程类型",
  status: "流程状态",
  owner: "流程责任",
  remark: "备注"
};

// label 映射函数
const getLabel = (options, value) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : value;
};

// 字段值格式化
const formatValue = (key, value) => {
  if (key === "type") {
    return getLabel(FlowTypeOptions, value);
  }
  if (key === "status") {
    return getLabel(FlowStatusOptions, value);
  }
  return value;
};

// 字段 key 映射为中文 label
const formatField = row => {
  return fieldMap[row.field] || row.field;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data).map(([key, value]) => ({
      field: key,
      value: formatValue(key, value)
    }));
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
