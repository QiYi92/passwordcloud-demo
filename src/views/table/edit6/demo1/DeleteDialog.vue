<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除计划确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除计划 ID 为 {{ planId }} 的记录吗？</div>
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
  planId: Number
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/pay-plans/${props.planId}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted");
      emit("update:visible", false);
      alert("计划删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};
</script>
