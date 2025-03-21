<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除日志确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="handleVisibleUpdate"
  >
    <template #default>
      <div>确定要删除日志ID为 {{ logId }} 的记录吗？</div>
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
  logId: {
    type: Number,
    required: true
  }
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(props.visible);

// 同步外部传入的 visible 状态
watchEffect(() => {
  localVisible.value = props.visible;
});

const handleVisibleUpdate = value => {
  emit("update:visible", value);
};

const confirmDelete = async () => {
  try {
    // 根据后端接口 /logs/:id 删除日志
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/logs/${props.logId}`
    );
    if (response.status === 200 || response.status === 204) {
      alert("日志删除成功");
      emit("deleted"); // 通知父组件删除成功
      emit("update:visible", false);
    } else {
      alert("删除失败");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败");
  }
};
</script>
