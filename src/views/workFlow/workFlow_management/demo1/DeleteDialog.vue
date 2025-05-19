<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除工作流程确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除工作流程 ID 为 {{ workflowId }} 的记录吗？</div>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";
import { ElMessage } from "element-plus";

/* ---------------- props / emits ---------------- */
const props = defineProps({
  visible: Boolean,
  workflowId: Number
});
const emit = defineEmits(["update:visible", "deleted"]);

/* ---------------- 弹窗可视 ---------------- */
const localVisible = ref(false);
watchEffect(() => (localVisible.value = props.visible));

/* ---------------- 删除逻辑 ---------------- */
const confirmDelete = async () => {
  const base = import.meta.env.VITE_APP_SERVER;

  try {
    /* 1️⃣ 取行数据，收集图片路径 */
    const { data: all } = await axios.get(`${base}/api/workflows`);
    const row = all.find(item => item.id === props.workflowId);

    const pathList = [
      row?.workflow_thumb || "",
      row?.workflow_image || ""
    ].filter(Boolean); // 只保留非空

    /* 2️⃣ 有路径就先物理删除 */
    if (pathList.length) {
      try {
        await axios.post(`${base}/api/workflows/deleteFile`, { pathList });
        console.log("[DeleteDialog] 已请求后端删除文件:", pathList);
      } catch (err) {
        console.warn("[DeleteDialog] 删除图片接口失败，但继续删记录", err);
      }
    }

    /* 3️⃣ 删除数据库记录 */
    await axios.delete(`${base}/api/workflows/${props.workflowId}`);

    ElMessage.success("工作流程删除成功");
    emit("deleted");
    emit("update:visible", false);
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败，请稍后重试！");
  }
};
</script>
