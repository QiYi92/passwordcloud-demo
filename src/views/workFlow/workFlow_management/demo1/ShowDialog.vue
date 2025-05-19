<template>
  <!-- 主对话框：字段数据预览 -->
  <el-dialog
    v-model="localVisible"
    title="预览工作流程数据"
    width="80%"
    @close="handleClose"
  >
    <div style="padding: 20px">
      <el-table
        :data="formattedData"
        border
        layout="fixed"
        style="width: 100%; border: 1px solid #ebeef5"
      >
        <el-table-column
          prop="field"
          label="字段"
          align="center"
          :formatter="formatField"
          header-cell-style="{ backgroundColor:'#f5f7fa', fontWeight:'bold' }"
          width="150"
        />
        <el-table-column
          prop="value"
          label="数据"
          align="left"
          header-cell-style="{ backgroundColor:'#f5f7fa', fontWeight:'bold' }"
          width="600"
        >
          <template #default="scope">
            <div style="white-space: pre-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="formattedData.length === 0"
        style="padding: 20px; color: #999; text-align: center"
      >
        加载数据失败或数据为空
      </div>
    </div>
    <template #footer>
      <el-button type="primary" plain :disabled="!imageUrl" @click="openViewer">
        预览流程图
      </el-button>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>

  <!-- SVG 预览对话框 -->
  <el-dialog
    v-model="imagePreviewVisible"
    width="70%"
    top="5vh"
    :show-close="true"
    title="流程图预览"
  >
    <img
      v-if="imageUrl"
      :src="imageUrl"
      alt="流程图 SVG 预览"
      style=" display: block;width: 100%; height: auto; margin: 0 auto"
    />
    <div v-else style=" padding: 20px; color: #999;text-align: center">
      无可用 SVG 预览
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import {
  FlowTypeOptions,
  FlowStatusOptions
} from "@/views/workFlow/workFlow_management/data";

/* props & emits */
const props = defineProps<{
  visible: boolean;
  data: Record<string, any> | null;
}>();
const emit = defineEmits(["update:visible"]);

/* 状态 */
const localVisible = ref(false);
const imagePreviewVisible = ref(false);
const imageUrl = ref(""); // 后端存的 .svg 链接
const formattedData = ref<{ field: string; value: any }[]>([]);

/* 点击“预览流程图”只打开对话框 */
function openViewer() {
  imagePreviewVisible.value = true;
}

/* 字段映射 & 格式化 */
const fieldMap: Record<string, string> = {
  name: "流程名称",
  type: "流程类型",
  status: "流程状态",
  owner: "流程责任",
  remark: "备注"
};
const hiddenFields = ["workflow_image", "workflow_thumb", "workflow_xml"];
const getLabel = (opts: any[], v: any) =>
  opts.find(o => o.value === v)?.label || v;
const formatValue = (k: string, v: any) =>
  k === "type"
    ? getLabel(FlowTypeOptions, v)
    : k === "status"
      ? getLabel(FlowStatusOptions, v)
      : v;
const formatField = (r: { field: string }) => fieldMap[r.field] || r.field;

/* 初始化数据 & imageUrl */
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.visible && props.data) {
    imageUrl.value = props.data.workflow_image || "";
    formattedData.value = Object.entries(props.data)
      .filter(([k]) => !hiddenFields.includes(k))
      .map(([k, v]) => ({ field: k, value: formatValue(k, v) }));
  } else {
    formattedData.value = [];
    imageUrl.value = "";
  }
});

/* 关闭主弹窗 */
function handleClose() {
  localVisible.value = false;
  emit("update:visible", false);
}
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
