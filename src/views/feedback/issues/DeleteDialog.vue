<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除反馈确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除反馈ID为 {{ id }} 的反馈吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

const props = defineProps({
  visible: Boolean,
  id: Number // 使用id字段
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  console.log(`Deleting issues with ID: ${props.id}`); // 打印 ID 检查

  // 调试信息：检查环境变量是否正确
  const serverUrl = import.meta.env.VITE_APP_SERVER;
  console.log(`Server URL: ${serverUrl}`);
  const deleteUrl = `${serverUrl}/api/issues/${props.id}`;
  console.log(`DELETE URL: ${deleteUrl}`);

  try {
    const response = await axios.delete(deleteUrl);
    console.log("Response:", response);
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件
      emit("update:visible", false);
      alert("反馈删除成功");
    } else {
      console.error("Unexpected response status:", response.status);
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    console.error(
      "Error response data:",
      error.response ? error.response.data : "No response data"
    );
    alert("删除失败");
  }
};

const cancel = () => {
  emit("update:visible", false);
};
</script>
