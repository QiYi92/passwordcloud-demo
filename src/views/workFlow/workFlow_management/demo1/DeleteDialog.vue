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

// 接收 props
const props = defineProps({
  visible: Boolean,
  workflowId: Number
});

// emits
const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

// 监听 visible 同步控制内部弹窗状态
watchEffect(() => {
  localVisible.value = props.visible;
});

// 删除流程
const confirmDelete = async () => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/workflows/${props.workflowId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted");
      emit("update:visible", false);
      alert("工作流程删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败，请稍后重试！");
  }
};
</script>
