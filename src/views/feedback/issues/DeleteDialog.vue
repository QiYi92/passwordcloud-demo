<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除反馈确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除反馈ID为 {{ id }} 的反馈吗?</div>
    </template>
  </PlusDialogForm>
</template>

<script setup>
import { ref, defineProps, defineEmits, watchEffect } from "vue";
import axios from "axios";
import { PlusDialogForm } from "plus-pro-components";
import "plus-pro-components/es/components/dialog-form/style/css";

// 接收组件的 props
const props = defineProps({
  visible: Boolean,
  id: Number // 当前删除的 ID
});

// 定义发射事件的方法
const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false); // 控制本地对话框显示状态

// 监听对话框显示状态的变化
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除函数
const confirmDelete = async () => {
  try {
    console.log(`正在删除反馈，ID: ${props.id}`); // 输出当前删除的 ID

    // Step 1: 获取该 ID 关联的文件列表
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/files/${props.id}`
    );
    const files = fileResponse.data.files;
    console.log("关联的文件列表:", files);

    // Step 2: 删除所有关联文件
    for (const file of files) {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/issues/deleteFile`,
          { path: file.url }
        );
        console.log(`成功删除文件: ${file.name}`);
      } catch (error) {
        console.error(`删除文件失败: ${file.name}`, error);
      }
    }

    // Step 3: 删除反馈记录
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/${props.id}`
    );

    console.log("服务器返回的响应:", response); // 调试输出服务器响应

    if (response.status === 200 || response.status === 204) {
      // 如果删除成功，发出事件并关闭对话框
      console.log(`成功删除反馈，ID: ${props.id}`);
      emit("deleted"); // 通知父组件删除成功
      emit("update:visible", false);
      alert("反馈删除成功");
    } else {
      // 处理非预期的状态码
      console.error("未预期的响应状态码:", response.status);
      alert("删除失败");
    }
  } catch (error) {
    // 如果返回 404，假定记录已经删除并处理界面更新
    if (error.response && error.response.status === 404) {
      console.warn(`未找到 ID: ${props.id} 的反馈，假设它已经被删除。`);
      emit("deleted"); // 通知父组件删除操作
      emit("update:visible", false);
      alert("反馈已删除");
    } else {
      // 其他错误处理
      console.error("删除反馈失败:", error);
      console.error(
        "错误响应数据:",
        error.response ? error.response.data : "无响应数据"
      );
      alert("删除失败！");
    }
  }
};

// 取消操作
const cancel = () => {
  emit("update:visible", false); // 关闭对话框
};
</script>
