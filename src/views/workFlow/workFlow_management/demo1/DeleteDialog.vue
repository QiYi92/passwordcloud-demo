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

// 接收 props
const props = defineProps({
  visible: Boolean,
  workflowId: Number
});

// emits
const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

// 删除流程
const confirmDelete = async () => {
  try {
    // Step 1: 获取 workflow 数据，拿到 workflow_image
    const { data } = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows`
    );
    const workflow = data.find(item => item.id === props.workflowId);
    const imagePath = workflow?.workflow_image;

    // Step 2: 如果有图片，先请求后端删除图片
    if (imagePath) {
      try {
        const relativePath = new URL(imagePath).pathname;
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/workflows/deleteFile`,
          { path: relativePath }
        );
        console.log(`已删除图片: ${relativePath}`);
      } catch (err) {
        console.warn(`删除图片失败: ${imagePath}`, err);
      }
    }

    // Step 3: 删除数据库记录
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${props.workflowId}`
    );

    if (response.status === 200 || response.status === 204) {
      emit("deleted");
      emit("update:visible", false);
      ElMessage.success("工作流程删除成功");
    } else {
      ElMessage.error("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    ElMessage.error("删除失败，请稍后重试！");
  }
};
</script>
