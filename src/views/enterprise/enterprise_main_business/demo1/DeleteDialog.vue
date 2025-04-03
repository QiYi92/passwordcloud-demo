<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除主营业务记录确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除记录 ID 为 {{ id }} 的主营业务信息吗？</div>
    </template>
  </PlusDialogForm>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

// 接收父组件传递的参数
const props = defineProps({
  visible: Boolean,
  id: Number // 主营业务记录的 ID
});

// 定义 emits 向父组件发送事件
const emit = defineEmits(["update:visible", "deleted"]);

// 控制本地弹窗显示状态
const localVisible = ref(false);

// 同步父组件的 visible 状态
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除
const confirmDelete = async () => {
  console.log(`Deleting enterprise_main_business record with ID: ${props.id}`);
  try {
    const response = await axios.delete(
      import.meta.env.VITE_APP_SERVER + `/api/enterprise-business/${props.id}`
    );
    if (response.status === 200 || response.status === 204) {
      emit("deleted"); // 通知父组件刷新数据
      emit("update:visible", false); // 关闭弹窗
      alert("主营业务记录删除成功");
    } else {
      alert("删除失败，请稍后重试");
    }
  } catch (error) {
    console.error("删除失败:", error);
    alert("删除失败，请稍后重试");
  }
};
</script>
