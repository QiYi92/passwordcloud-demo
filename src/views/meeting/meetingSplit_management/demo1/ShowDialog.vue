<template>
  <el-dialog
    v-model="localVisible"
    title="预览会议拆分数据"
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
          label="当前数据字段"
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
import dayjs from "dayjs"; // 引入 dayjs 用于格式化日期

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  data: Object // 会议拆分数据
});

// 定义 emits，用于向父组件传递事件
const emit = defineEmits(["update:visible"]);

// 本地状态，用于控制对话框的可见性
const localVisible = ref(false);

// 格式化后的数据，用于显示在表格中
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段名称映射表
const fieldMap = {
  split_id: "拆分ID",
  meeting_name: "会议名称",
  meeting_type: "类型",
  meeting_content: "内容",
  department_personnel: "责任科室或人员",
  time_limit: "完成时限",
  progress: "当前进展",
  remarks: "备注"
};

// 用于将英文字段名称转换为中文显示
const formatField = row => {
  return fieldMap[row.field] || row.field; // 如果没有匹配到，显示原字段名称
};

// 监视 props.visible 和数据变化来更新本地显示状态
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value:
          key === "time_limit" ? dayjs(value).format("YYYY年MM月DD日") : value // 格式化时间
      }))
      .filter(item => item.field !== "id" && item.field !== "split_id"); // 过滤掉 "id" 和 "split_id"
  } else {
    formattedData.value = [];
  }
});

// 关闭弹窗
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
