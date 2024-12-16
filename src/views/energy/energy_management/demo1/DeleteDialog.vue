<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除能耗记录确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除记录 ID 为 {{ energyId }} 的能耗记录吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

// 定义 props 接收父组件传递的参数
const props = defineProps({
  visible: Boolean,
  energyId: Number // 能耗记录的 ID
});

// 定义 emits 向父组件发送事件
const emit = defineEmits(["update:visible", "deleted"]);

// 本地状态：控制对话框的显示
const localVisible = ref(false);

// 监听 visible 变化，更新本地状态
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除操作
const confirmDelete = async () => {
  console.log(`Deleting energy record with ID: ${props.energyId}`); // 打印 ID 检查
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/energy/${props.energyId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件，通知父组件
      emit("update:visible", false); // 隐藏对话框
      alert("能耗记录删除成功");
    } else {
      alert("删除失败，请稍后重试");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败，请稍后重试");
  }
};

// 取消删除操作
const cancel = () => {
  emit("update:visible", false);
};
</script>
