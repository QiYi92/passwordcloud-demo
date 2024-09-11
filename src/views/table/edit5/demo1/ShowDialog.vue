<template>
  <el-dialog
    v-model="localVisible"
    title="预览催款项数据"
    width="80%"
    @close="handleClose"
  >
    <div style="padding: 20px">
      <el-table
        :data="formattedData"
        style="width: 100%; border: 1px solid #ebeef5"
        border
        layout="fixed"
      >
        <el-table-column
          prop="field"
          label="字段"
          align="center"
          :formatter="formatField"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="150"
        />
        <el-table-column
          prop="value"
          label="数据"
          align="left"
          header-cell-style="{ backgroundColor: '#f5f7fa', fontWeight: 'bold' }"
          width="600"
        >
          <template #default="scope">
            <div style="white-space: pre-wrap">{{ scope.row.value }}</div>
          </template>
        </el-table-column>
      </el-table>
      <div
        v-if="formattedData.length === 0"
        style=" padding: 20px;text-align: center"
      >
        加载数据失败或数据为空
      </div>
    </div>
    <template #footer>
      <el-button
        type="primary"
        :disabled="!canDownload"
        @click="handleDownload"
      >
        下载附件
      </el-button>
      <el-button type="primary" @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, defineProps, watchEffect, defineEmits, computed } from "vue";

// 接收父组件传递的 props
const props = defineProps({
  visible: Boolean,
  data: Object
});

// 定义 emits 用于向父组件传递事件
const emit = defineEmits(["update:visible"]);

// 本地状态，用于控制对话框的可见性
const localVisible = ref(false);

// 格式化后的数据，用于显示在表格中
const formattedData = ref<Array<{ field: string; value: any }>>([]);

// 字段名称汉化映射表
const fieldMap = {
  prompt_id: "催款项ID",
  prompt_name: "催款项名称",
  project_name: "项目名称",
  contract_name: "合同名称",
  prompt_money: "催款金额",
  prompt_time: "登记时间",
  prompt_remark: "备注",
  prompt_record: "处理情况记录",
  prompt_files: "催款函件"
};

// 用于将英文字段名称转换为中文显示
const formatField = row => {
  return fieldMap[row.field] || row.field; // 如果没有匹配到，显示原字段名称
};

// 计算属性判断是否可以下载
const canDownload = computed(() => {
  const fileField = formattedData.value.find(
    item => item.field === "prompt_files"
  );
  return fileField && fileField.value;
});

// 监视 props.visible 和数据变化来更新本地显示状态
watchEffect(() => {
  localVisible.value = props.visible;

  if (props.visible && props.data && Object.keys(props.data).length > 0) {
    formattedData.value = Object.entries(props.data)
      .map(([key, value]) => ({
        field: key,
        value
      }))
      .filter(item => item.field !== "id"); // 移除 "ID" 行
  } else {
    formattedData.value = [];
  }
});

// 关闭弹窗
const handleClose = () => {
  localVisible.value = false;
  emit("update:visible", false);
};

const handleDownload = () => {
  const fileField = formattedData.value.find(
    item => item.field === "prompt_files"
  );
  if (fileField && fileField.value) {
    const baseUrl = import.meta.env.VITE_APP_SERVER; // 服务器的 base URL
    // 将文件路径调整为以 '/uploads/prompts' 开头
    const fileUrl = `${baseUrl}/uploads/prompts/${fileField.value.replace(/^\//, "")}`;

    console.log("附件下载URL:", fileUrl);

    // 创建一个隐藏的 <a> 元素用于下载
    const link = document.createElement("a");
    link.href = fileUrl; // 设置文件的 URL
    link.target = "_blank"; // 设置 target 为 _blank，在新标签页打开
    link.download = fileField.value.split("/").pop() || "download"; // 设置 download 属性，确保有默认文件名
    link.style.display = "none"; // 隐藏 <a> 元素
    document.body.appendChild(link); // 将 <a> 元素暂时添加到 DOM 中
    link.click(); // 触发点击以在新标签页打开链接
    document.body.removeChild(link); // 下载完成后移除 <a> 元素

    console.log("附件下载开始:", fileUrl);
  } else {
    console.log("没有找到附件或附件为空");
  }
};
</script>

<style scoped>
.el-table th {
  font-weight: bold !important;
  background-color: #f2f6fc !important;
  border-right: 1px solid #ebeef5;
}

.el-table th.is-leaf:last-child,
.el-table td.is-leaf:last-child {
  border-right: 1px solid #ebeef5;
}
</style>
