<template>
  <el-dialog
    v-model="localVisible"
    title="预览工作专班数据"
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
      <el-button
        type="primary"
        :disabled="!canDownload"
        @click="handleDownload"
      >
        下载附件
      </el-button>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits, computed } from "vue";

// 接收 props
const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);
const localVisible = ref(false);
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段中文映射
const fieldMap = {
  id: "ID",
  taskforce_name: "工作专班名称",
  member_name: "人员名称",
  established_date: "成立时间",
  remark: "备注",
  taskforce_files: "附件"
};

// 字段格式化
const formatField = row => fieldMap[row.field] || row.field;

// 是否可下载
const canDownload = computed(() => {
  const fileField = formattedData.value.find(
    item => item.field === "taskforce_files"
  );
  return fileField && fileField.value && fileField.value !== "0";
});

// 数据变化监听
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data && Object.keys(props.data).length > 0) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value
      }))
      .filter(item => item.field !== "id"); // 可以选择是否显示 ID
  } else {
    formattedData.value = [];
  }
});

// 关闭对话框
const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false);
};

// 下载附件
const handleDownload = () => {
  const fileField = formattedData.value.find(
    item => item.field === "taskforce_files"
  );
  if (fileField && fileField.value && fileField.value !== "0") {
    const baseUrl = import.meta.env.VITE_APP_SERVER;
    const fileUrl = `${baseUrl}/uploads/work_taskforce/${fileField.value.replace(/^\//, "")}`;

    const link = document.createElement("a");
    link.href = fileUrl;
    link.target = "_blank";
    link.download = fileField.value.split("/").pop() || "download";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
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
