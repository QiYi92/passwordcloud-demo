<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除工作专班确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除工作专班 ID 为 {{ id }} 的记录吗？</div>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

// 接收 props
const props = defineProps({
  visible: Boolean,
  id: Number
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  try {
    console.log(`正在删除工作专班 ID: ${props.id}`);

    // Step 1: 获取附件文件
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/files/${props.id}`
    );
    const files = fileResponse.data.files || [];

    console.log("关联文件列表:", files);

    // Step 2: 删除有效附件文件（跳过 0 或空）
    for (const file of files) {
      if (!file.name || file.name === "0") continue; // ✅ 跳过无效文件

      try {
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/taskforces/deleteFile`,
          { path: file.url }
        );
        console.log(`成功删除文件: ${file.name}`);
      } catch (error) {
        console.error(`删除文件失败: ${file.name}`, error);
      }
    }

    // Step 3: 删除数据库记录
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/taskforces/${props.id}`
    );

    if (response.status === 200 || response.status === 204) {
      emit("deleted");
      emit("update:visible", false);
      alert("工作专班删除成功");
    } else {
      console.error("未预期的响应状态码:", response.status);
      alert("删除失败");
    }
  } catch (error) {
    if (error.response?.status === 404) {
      console.warn(`工作专班 ID ${props.id} 不存在，假设已删除`);
      emit("deleted");
      emit("update:visible", false);
      alert("记录已不存在，已同步更新");
    } else {
      console.error("删除失败:", error);
      alert("删除失败！");
    }
  }
};
</script>
