<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除会议拆分确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除会议拆分 ID 为 {{ splitId }} 的记录吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

const props = defineProps({
  visible: Boolean, // 控制对话框显示状态
  splitId: Number // 会议拆分的 ID
});

const emit = defineEmits(["update:visible", "deleted"]); // 发出关闭对话框和删除完成事件
const localVisible = ref(false);

// 监听 props.visible 变化
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除
const confirmDelete = async () => {
  console.log(`Deleting meeting split record with ID: ${props.splitId}`); // 打印 ID 检查
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/meeting-split/${props.splitId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 通知父组件已删除
      emit("update:visible", false); // 关闭对话框
      alert("会议拆分记录删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};

// 取消删除
const cancel = () => {
  emit("update:visible", false);
};
</script>
