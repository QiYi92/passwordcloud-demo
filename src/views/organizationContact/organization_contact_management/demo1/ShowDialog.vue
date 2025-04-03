<template>
  <el-dialog
    v-model="localVisible"
    title="预览联系人数据"
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

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段映射（可按需调整顺序）
const fieldMap = {
  id: "联系人ID",
  organization_name: "单位名称",
  contact_person: "联系人",
  contact_phone: "联系方式",
  remark: "备注"
};

const formatField = row => {
  return fieldMap[row.field] || row.field;
};

const formatValue = (key, value) => {
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
      .filter(item => item.field !== "id"); // 可隐藏 ID
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
