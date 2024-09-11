<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除催款项确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <!-- 使用插槽显示自定义内容 -->
    <template #default>
      <div>确定要删除催款项ID为 {{ promptId }} 的记录吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  promptId: Number // 绑定催款项的ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

// 监视 props.visible 的变化来同步本地可见状态
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除的处理函数
const confirmDelete = async () => {
  console.log(`Deleting prompt with ID: ${props.promptId}`); // 打印 ID 检查
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/prompts/${props.promptId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件
      emit("update:visible", false);
      alert("催款项删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};

// 取消删除的处理函数
const cancel = () => {
  emit("update:visible", false);
};
</script>
