<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除文档模板确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除文档模板 ID 为 {{ id }} 的记录吗？</div>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";
import { ElMessage } from "element-plus";

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
    console.log(`正在删除文档模板 ID: ${props.id}`);

    // Step 1: 获取附件文件
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates/files/${props.id}`
    );
    const files = fileResponse.data.files || [];

    console.log("关联文件列表:", files);

    // Step 2: 删除有效附件文件
    for (const file of files) {
      if (!file.name || file.name === "0") continue;

      try {
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/file_templates/deleteFile`,
          { path: file.url }
        );
        console.log(`成功删除文件: ${file.name}`);
      } catch (err) {
        console.error(`删除文件失败: ${file.name}`, err);
      }
    }

    // Step 3: 删除数据库记录
    await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/file_templates/${props.id}`
    );
    emit("deleted");
    emit("update:visible", false);
    ElMessage.success("删除成功");
  } catch (error) {
    console.error(error);
    ElMessage.error("删除失败");
  }
};
</script>
