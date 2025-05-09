<template>
  <el-dialog
    v-model="localVisible"
    title="预览文档模板数据"
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

const props = defineProps({
  visible: Boolean,
  data: Object
});

const emit = defineEmits(["update:visible"]);

const localVisible = ref(false);
const formattedData = ref([]);
const canDownload = computed(() => !!props.data?.attachment_files);

watchEffect(() => {
  localVisible.value = props.visible;
  if (props.data) {
    formattedData.value = [
      { field: "ID", value: props.data.id },
      { field: "模板名称", value: props.data.template_name },
      { field: "文档说明", value: props.data.template_description },
      {
        field: "最后更新时间",
        value: props.data.updated_time
      },
      {
        field: "附件",
        value: props.data.attachment_files
          ? props.data.attachment_files
          : "无附件"
      }
    ];
  }
});

const formatField = row => {
  return row.field;
};

const handleClose = () => {
  emit("update:visible", false);
};

const handleDownload = () => {
  if (!props.data.attachment_files) return;
  const url = `${import.meta.env.VITE_APP_SERVER}/uploads/file_template/${props.data.attachment_files}`;
  window.open(url, "_blank");
};
</script>
