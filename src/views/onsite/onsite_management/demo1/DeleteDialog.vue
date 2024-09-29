<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    title="删除驻场人员确认"
    :form="{}"
    confirm-text="确定"
    cancel-text="取消"
    width="300px"
    @confirm="confirmDelete"
    @update:visible="emit('update:visible', $event)"
  >
    <template #default>
      <div>确定要删除驻场人员ID为 {{ personnelId }} 的记录吗?</div>
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
  personnelId: Number // 绑定驻场人员的ID
});

const emit = defineEmits(["update:visible", "deleted"]);
const localVisible = ref(false);

// 监视 props.visible 的变化来同步本地可见状态
watchEffect(() => {
  localVisible.value = props.visible;
});

// 确认删除的处理函数
const confirmDelete = async () => {
  try {
    console.log(`正在删除驻场人员，ID: ${props.personnelId}`); // 输出当前删除的 ID

    // Step 1: 获取该 ID 关联的文件列表
    const fileResponse = await axios.get(
      `${import.meta.env.VITE_APP_SERVER}/api/onsite/files/${props.personnelId}/related_files`
    );
    const files = fileResponse.data.files || [];
    console.log("关联的文件列表:", files);

    // Step 2: 删除所有关联文件
    for (const file of files) {
      try {
        await axios.post(
          `${import.meta.env.VITE_APP_SERVER}/api/onsite/deleteFile`,
          { path: file.url }
        );
        console.log(`成功删除文件: ${file.name}`);
      } catch (error) {
        console.error(`删除文件失败: ${file.name}`, error);
      }
    }

    // Step 3: 删除驻场人员记录
    const response = await axios.delete(
      `${import.meta.env.VITE_APP_SERVER}/api/onsite/${props.personnelId}`
    );

    console.log("服务器返回的响应:", response); // 调试输出服务器响应

    if (response.status === 200 || response.status === 204) {
      // 如果删除成功，发出事件并关闭对话框
      console.log(`成功删除驻场人员，ID: ${props.personnelId}`);
      emit("deleted"); // 通知父组件删除成功
      emit("update:visible", false);
      alert("驻场人员删除成功");
    } else {
      console.error("未预期的响应状态码:", response.status);
      alert("删除失败");
    }
  } catch (error) {
    // 如果返回 404，假定记录已经删除并处理界面更新
    if (error.response && error.response.status === 404) {
      console.warn(
        `未找到 ID: ${props.personnelId} 的驻场人员，假设它已经被删除。`
      );
      emit("deleted"); // 通知父组件删除操作
      emit("update:visible", false);
      alert("驻场人员已删除");
    } else {
      console.error("删除驻场人员失败:", error);
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
  emit("update:visible", false);
};
</script>
