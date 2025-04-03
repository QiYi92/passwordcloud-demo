<template>
  <el-dialog
    v-model="localVisible"
    title="预览业务场景数据"
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
import { ProjectRoomOptions } from "@/views/intro/intro_management/data"; // 或替换为业务路径

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);
const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 显示字段名称映射
const fieldMap = {
  id: "业务场景ID",
  scenario_name: "业务场景名称",
  responsible_dept: "责任科室",
  scenario_description: "业务场景说明",
  remark: "备注"
};

// 转换责任科室 value 为 label
const mapDeptValue = value => {
  const match = ProjectRoomOptions.find(opt => opt.value === value);
  return match ? match.label : value;
};

const formatField = row => fieldMap[row.field] || row.field;

const formatValue = (key, value) => {
  if (key === "responsible_dept") {
    return mapDeptValue(value);
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
