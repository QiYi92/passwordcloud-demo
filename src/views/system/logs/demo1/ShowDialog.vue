<template>
  <el-dialog
    v-model="localVisible"
    title="日志信息预览"
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
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import dayjs from "dayjs";

const props = defineProps({
  visible: Boolean,
  // 日志数据对象，包含各字段数据，如 id、timestamp、user_name、real_name、action、resource、record_id、details 等
  data: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 定义日志字段映射，用于转换为中文显示名称
const fieldMap: Record<string, string> = {
  id: "日志ID",
  timestamp: "时间",
  user_name: "用户账号",
  real_name: "用户名",
  action: "操作",
  resource: "操作表单",
  record_id: "受影响记录ID",
  details: "详情"
};

// 格式化字段名称
const formatField = (row: { field: string; value: any }) => {
  return fieldMap[row.field] || row.field;
};

// 格式化字段值，如时间格式转换
const formatValue = (key: string, value: any) => {
  if (key === "timestamp" && value) {
    return dayjs(value).format("YYYY-MM-DD HH:mm:ss");
  }
  return value;
};

// 监听 visible 与 data 属性变化，生成格式化后的数据列表
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
