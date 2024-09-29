<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除专家确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除专家ID为 {{ expertId }} 的记录吗?</div>
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
  expertId: Number // 修改为 expertId 以匹配专家的ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  console.log(`Deleting expert with ID: ${props.expertId}`); // 打印 ID 检查
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/experts/${props.expertId}` // 修改为 experts 的 API 路径
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 发出已删除的事件
      emit("update:visible", false);
      alert("专家删除成功");
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
