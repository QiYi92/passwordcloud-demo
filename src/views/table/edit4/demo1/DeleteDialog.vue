<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除资金确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除资金ID为 {{ passId }} 的记录吗?</div>
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
  passId: Number // 修改为 passId 以匹配资金下达的ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  console.log(`Deleting pass with ID: ${props.passId}`); // 打印 ID 检查
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/passes/${props.passId}` // 修改为 passes 的 API 路径
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件
      emit("update:visible", false);
      alert("资金删除成功");
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};

const cancel = () => {
  emit("update:visible", false);
};
</script>
