<template>
  <el-dialog
    v-model="localVisible"
    title="预览简介数据"
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
  ProjectRoomOptions,
  IntroTypeOptions
} from "@/views/intro/intro_management/data"; // 引入映射数据

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

const fieldMap = {
  intro_id: "简介ID",
  intro_name: "简介名称",
  intro_department: "责任科室",
  update_time: "更新时间",
  intro_content: "简介内容",
  update_cycle: "更新周期",
  info_source: "信息来源",
  intro_type: "情况类型"
};

// 通用的映射函数
const mapValueToLabel = (value, options) => {
  const option = options.find(opt => opt.value === value);
  return option ? option.label : "未知";
};

const formatField = row => {
  return fieldMap[row.field] || row.field; // 显示字段名
};

// 格式化值
const formatValue = (key, value) => {
  if (key === "update_time" && value) {
    return dayjs(value).format("YYYY年MM月DD日"); // 格式化日期
  }
  if (key === "intro_department") {
    return mapValueToLabel(value, ProjectRoomOptions); // 映射责任科室
  }
  if (key === "intro_type") {
    return mapValueToLabel(value, IntroTypeOptions); // 映射情况类型
  }
  return value;
};

watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value: formatValue(key, value) // 格式化值
      }))
      .filter(item => item.field !== "intro_id"); // 根据需要过滤字段
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
