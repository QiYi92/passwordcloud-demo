<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除会议确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除会议 ID 为 {{ meetingId }} 的会议吗?</div>
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
  meetingId: Number // 接收会议 ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

watchEffect(() => {
  localVisible.value = props.visible;
});

const confirmDelete = async () => {
  console.log(`Deleting meeting with ID: ${props.meetingId}`); // 打印 ID 检查

  try {
    // Step 1: 获取该会议关联的附件文件列表
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting/files/${props.meetingId}`
    );
    const files = fileResponse.data.files || [];
    console.log("关联的附件文件列表:", files);

    // Step 2: 删除所有附件文件
    for (const file of files) {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/meeting/deleteFile`,
          { path: file.url }
        );
        console.log(`成功删除文件: ${file.name}`);
      } catch (error) {
        console.error(`删除文件失败: ${file.name}`, error);
      }
    }

    // Step 3: 删除会议记录
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting/${props.meetingId}`
    );

    console.log("服务器返回的响应:", response); // 调试输出服务器响应

    if (response.status === 200 || response.status === 204) {
      // 删除成功，发出事件并关闭对话框
      console.log(`成功删除会议，ID: ${props.meetingId}`);
      emit("deleted"); // 通知父组件删除成功
      emit("update:visible", false); // 关闭对话框
      alert("会议删除成功");
    } else {
      console.error("未预期的响应状态码:", response.status);
      alert("删除失败");
    }
  } catch (error) {
    // 如果返回 404，假定记录已经删除并处理界面更新
    if (error.response && error.response.status === 404) {
      console.warn(`未找到 ID: ${props.meetingId} 的会议，假设它已经被删除。`);
      emit("deleted"); // 通知父组件删除操作
      emit("update:visible", false); // 关闭对话框
      alert("会议已删除");
    } else {
      console.error("删除会议失败:", error);
      console.error(
        "错误响应数据:",
        error.response ? error.response.data : "无响应数据"
      );
      alert("删除失败！");
    }
  }
};

// 取消删除的处理函数
const cancel = () => {
  emit("update:visible", false); // 关闭对话框
};
</script>
