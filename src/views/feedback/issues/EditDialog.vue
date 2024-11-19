<template>
  <PlusDialogForm
    v-model:visible="localVisible"
    v-model="values"
    :form="{ columns }"
    title="编辑反馈数据"
    confirm-text="更新"
    cancel-text="取消"
    @confirm="handleSubmit"
    @update:visible="emit('update:visible', $event)"
  >
    <template #plus-field-issues_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
        :limit="5"
        :file-list="uploadedFiles"
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
        :before-upload="beforeUpload"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传</el-button>
        <template v-slot:tip>
          <div class="el-upload__tip">
            只能上传 DOC、DOCX、PDF、PNG、JPG、JPEG 文件，且不超过 500kb
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>

<script setup lang="ts">
import {
  ref,
  defineProps,
  watchEffect,
  defineEmits,
  onMounted,
  computed,
  watch
} from "vue";
import axios from "axios";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 从父组件接收的初始数据和可见性状态
const props = defineProps({
  initialData: Object,
  visible: Boolean,
  editingField: String
});

const emit = defineEmits(["update:visible", "data-updated"]);

const values = ref<FieldValues>({});
const localVisible = ref(false);

// 定义上传 URL
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/issues/upload`);

// 已上传的文件列表
const uploadedFiles = ref([]);

// 加载指定字段的附件列表
const loadUploadedFiles = async () => {
  if (props.initialData && props.initialData.id) {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_APP_SERVER}/api/issues/files/${props.initialData.id}`
      );
      uploadedFiles.value = data.files.map(file => ({
        name: file.name,
        url: file.url
      }));
      console.log("已加载的文件列表:", uploadedFiles.value); // 调试信息
    } catch (error) {
      console.error("加载已上传文件失败:", error);
      uploadedFiles.value = [];
    }
  } else {
    console.log("无有效的初始数据或编辑字段，无法加载文件");
    uploadedFiles.value = [];
  }
};

// 组件初始化时加载数据
onMounted(() => {
  console.log("组件已挂载，visible:", props.visible);
  console.log("初始数据 initialData:", props.initialData); // 打印 initialData
  console.log("编辑字段 editingField:", props.editingField); // 打印 editingField
  if (props.visible) {
    loadUploadedFiles(); // 在组件加载时获取附件
  }
});

// 监视 visible 属性的变化来加载数据
watch(
  () => props.visible,
  newVisible => {
    if (newVisible) {
      loadUploadedFiles(); // 在弹窗打开时加载附件
    } else {
      uploadedFiles.value = []; // 清空列表防止展示错误文件
    }
  }
);

// 监视 props.initialData 变化来更新本地显示状态
watchEffect(() => {
  localVisible.value = props.visible;
  if (props.initialData) {
    values.value = { ...props.initialData };
    console.log("初始数据已更新:", values.value);
  }
});

// 文件上传前检查
const beforeUpload = file => {
  const allowedTypes = [
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/pdf",
    "image/png",
    "image/jpeg"
  ];
  const isAllowedType = allowedTypes.includes(file.type);
  if (!isAllowedType) {
    alert("只能上传 Word (doc, docx)、PDF、PNG、JPG、JPEG 格式的文件！");
  }
  return isAllowedType;
};

// 提交表单的事件处理函数
const handleSubmit = async () => {
  if (!values.value.id) {
    console.error("缺少反馈 ID，无法更新。");
    return;
  }
  if (values.value.time) {
    values.value.time = dayjs(values.value.time as string).format("YYYY-MM-DD");
  }
  try {
    await axios.put(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/${values.value.id}`,
      values.value
    );
    emit("update:visible", false);
    emit("data-updated");
    alert("反馈更新成功！");
  } catch (error) {
    console.error("更新反馈失败:", error);
    alert("反馈更新失败！");
  }
};

// 处理上传成功
const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url; // 确保使用返回的文件路径
  values.value.issues_files = filePath.split("/").pop(); // 仅保存文件名

  // 删除旧文件（假设只保留最新的一个文件）
  if (uploadedFiles.value.length > 0) {
    const oldFile = uploadedFiles.value[0];
    try {
      await axios.post(
        `${import.meta.env.VITE_APP_SERVER}/api/issues/deleteFile`,
        { path: oldFile.url }
      );
    } catch (error) {
      console.error("删除旧文件失败:", error);
    }
  }

  // 更新文件列表
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

// 处理文件移除
const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 更新数据库中的反馈附件栏为 0
    if (uploadedFiles.value.length === 0) {
      values.value.issues_files = 0;
      await axios.put(
        `${import.meta.env.VITE_APP_SERVER}/api/issues/${values.value.id}`,
        { issues_files: 0 }
      );
    }

    alert("文件删除成功");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

// 列的定义
const columns: PlusColumn[] = [
  {
    label: "类型",
    prop: "type",
    width: "120",
    valueType: "select",
    options: [
      { label: "BUG提交", value: "0" },
      { label: "新需求", value: "1" },
      { label: "功能完善", value: "2" },
      { label: "其他", value: "3" },
      { value: "4", label: "设想中" }
    ]
  },
  {
    label: "权重等级",
    prop: "level",
    width: "120",
    valueType: "select",
    options: [
      { label: "常规", value: "0" },
      { label: "不急", value: "1" },
      { label: "紧急", value: "2" },
      { label: "特急", value: "3" },
      { label: "暂停", value: "4" }
    ]
  },
  { label: "责任人", prop: "principal" },
  { label: "标题", prop: "title" },
  {
    label: "描述",
    prop: "describe",
    valueType: "textarea",
    fieldProps: {
      maxlength: 200,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  {
    label: "完成状态",
    prop: "completion",
    width: "120",
    valueType: "select",
    options: [
      { value: "0", label: "⚠待接收" },
      { value: "1", label: "♻已接收" },
      { value: "2", label: "☆已完成未更新" },
      { value: "3", label: "✔已完成已更新" },
      { value: "4", label: "✖不理解需求" },
      { value: "5", label: "⚙开发中" }
    ]
  },
  {
    label: "完成情况说明",
    prop: "remark",
    valueType: "textarea",
    fieldProps: {
      maxlength: 50,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 4 }
    }
  },
  { label: "时间", prop: "time", valueType: "date-picker" },
  {
    label: "附件",
    prop: "issues_files",
    valueType: "input" // 插槽会覆盖这个类型
  }
];
</script>
