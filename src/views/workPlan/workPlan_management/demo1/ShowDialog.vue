<template>
  <el-dialog
    v-model="localVisible"
    title="预览工作计划数据"
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

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

const fieldMap = {
  plan_id: "计划ID",
  plan_name: "计划名称",
  plan_goal: "计划目标",
  responsible_department: "责任科室",
  start_month: "计划开始时间",
  end_month: "计划结束时间",
  current_status: "当前状态",
  remark: "备注"
};

// 格式化字段名
const formatField = row => {
  return fieldMap[row.field] || row.field;
};

// 格式化字段值
const formatValue = (key, value) => {
  if ((key === "start_month" || key === "end_month") && value) {
    return dayjs(value).format("YYYY年MM月"); // 格式化年月
  }
  if (key === "current_status") {
    const statusMap = {
      "0": "计划中",
      "1": "进行中",
      "2": "已完成",
      "3": "取消",
      "4": "其他"
    };
    return statusMap[value] || "未知";
  }
  if (key === "responsible_department") {
    const departmentMap = {
      "0": "其他",
      "1": "安全科",
      "2": "基建科",
      "3": "网站科",
      "4": "电子政务科",
      "5": "资源科"
    };
    return departmentMap[value] || "未知";
  }
  return value;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value: formatValue(key, value)
      }))
      .filter(item => item.field !== "plan_id"); // 根据需要过滤字段
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
