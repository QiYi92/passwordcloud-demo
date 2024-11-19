<template>
  <el-button type="primary" @click="handleOpen">添加新数据</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新数据"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
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
import axios from "axios";
import { ref, defineEmits } from "vue";
import "plus-pro-components/es/components/dialog-form/style/css";
import {
  type PlusColumn,
  type FieldValues,
  PlusDialogForm
} from "plus-pro-components";
import dayjs from "dayjs";

// 定义列配置
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
      { label: "设想中", value: "4" }
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

const visible = ref(false);
const values = ref<FieldValues>({});
const uploadedFiles = ref([]); // 已上传的文件列表
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/issues/upload`); // 定义上传 URL

// 定义emit用于发送事件
const emit = defineEmits(["data-updated"]);

// 重置表单数据
const resetForm = () => {
  values.value = {};
  uploadedFiles.value = []; // 重置文件列表
};

const handleOpen = () => {
  resetForm(); // 每次打开对话框时重置表单数据
  // 设置默认时间为当天
  values.value.time = dayjs().format("YYYY-MM-DD");
  // 设置默认的类型为“BUG提交”
  values.value.type = "0";
  // 设置默认的权重等级为“常规”
  values.value.level = "0"; // 对应“常规”
  // 设置默认的完成状态为“待接收”
  values.value.completion = "0"; // 对应“待接收”
  visible.value = true;
};

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

// 处理上传成功
const handleUploadSuccess = (response, file, fileList) => {
  const fileName = file.response?.path.split("/").pop(); // 提取规范化后的文件名
  uploadedFiles.value = fileList.map(f => ({
    name: fileName, // 更新文件名为规范化后的文件名
    url: f.response?.path || f.url // 使用规范化后的路径
  }));
  // 更新文件字段，确保使用新的文件名格式
  values.value.issues_files = uploadedFiles.value.map(f => f.name).join(",");
};

// 处理文件移除
const handleRemoveFile = async file => {
  try {
    // 使用规范化后的文件路径删除文件
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/issues/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 如果没有剩余文件，将 issues_files 字段更新为 0
    if (uploadedFiles.value.length === 0) {
      values.value.issues_files = "0"; // 更新为字符串 '0'
    }

    alert("文件删除成功");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};

const handleSubmit = async () => {
  // 格式化日期
  if (values.value.time) {
    values.value.time = dayjs(values.value.time as string).format("YYYY-MM-DD");
  }
  try {
    const response = await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/issues`,
      values.value
    );
    console.log(response.data);
    visible.value = false; // 关闭对话框
    alert("反馈添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add issues:", error);
    alert("反馈添加失败！");
  }
};
</script>
