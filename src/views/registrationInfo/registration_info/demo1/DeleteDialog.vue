<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除注册信息确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除注册信息 ID 为 {{ projectId }} 的记录吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

const props = defineProps({
  visible: Boolean,
  projectId: Number // 注册信息 ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  try {
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/registration-info/${props.projectId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件
      emit("update:visible", false);
      alert("注册信息删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败，请稍后重试！");
  }
};
</script>
