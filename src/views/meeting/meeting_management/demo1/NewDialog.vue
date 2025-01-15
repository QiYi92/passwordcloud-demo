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

const columns: PlusColumn[] = [
  {
    label: "会议名称",
    labelWidth: 150,
    width: 120,
    prop: "meeting_name",
    valueType: "copy"
  },
  {
    label: "会议地点",
    labelWidth: 150,
    width: 120,
    prop: "meeting_location",
    valueType: "copy"
  },
  {
    label: "会议时间",
    labelWidth: 150,
    prop: "meeting_date",
    valueType: "date-picker"
  },
  {
    label: "会议正文",
    labelWidth: 150,
    width: 120,
    prop: "meeting_body",
    valueType: "textarea",
    fieldProps: {
      maxlength: 5000,
      showWordLimit: true,
      autosize: { minRows: 5, maxRows: 15 }
    }
  },
  {
    label: "摘要",
    labelWidth: 150,
    width: 120,
    prop: "summary",
    valueType: "textarea",
    fieldProps: {
      maxlength: 500,
      showWordLimit: true,
      autosize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    label: "正文附件",
    labelWidth: 150,
    prop: "meeting_files",
    valueType: "input"
  }
];

const visible = ref(false);
const values = ref<FieldValues>({});
const uploadedFiles = ref([]); // 存储已上传的文件
const uploadUrl = ref(`${import.meta.env.VITE_APP_SERVER}/api/meeting/upload`);

// 定义 emit 用于发送事件
const emit = defineEmits(["data-updated"]);

const handleOpen = () => {
  visible.value = true;
};

const handleSubmit = async () => {
  // 格式化日期
  if (values.value.meeting_date) {
    values.value.meeting_date = dayjs(
      values.value.meeting_date as string
    ).format("YYYY-MM-DD");
  }

  // 如果未上传文件，则设置 meeting_files 为 0
  if (uploadedFiles.value.length === 0) {
    values.value.meeting_files = 0;
  }

  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting`,
      values.value
    );
    visible.value = false; // 关闭对话框
    alert("会议添加成功！");
    emit("data-updated"); // 添加成功后发射事件
  } catch (error) {
    console.error("Failed to add meeting:", error);
    alert("会议添加失败！");
  }
};

const handleUploadSuccess = async (response, file, fileList) => {
  const filePath = response.path || file.url; // 确保使用返回的文件路径
  values.value.meeting_files = filePath.split("/").pop(); // 仅保存文件名

  // 更新文件列表
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    url: f.response?.path || f.url
  }));
};

const handleRemoveFile = async file => {
  try {
    await axios.post(
      `${import.meta.env.VITE_APP_SERVER}/api/meeting/deleteFile`,
      { path: file.url }
    );
    uploadedFiles.value = uploadedFiles.value.filter(f => f.url !== file.url);

    // 如果删除后没有文件，更新 meeting_files 为 0
    if (uploadedFiles.value.length === 0) {
      values.value.meeting_files = 0;
    }

    alert("文件删除成功！");
  } catch (error) {
    console.error("删除文件失败:", error);
    alert("删除文件失败！");
  }
};
</script>

<template>
  <el-button type="primary" @click="handleOpen">添加新会议</el-button>
  <PlusDialogForm
    v-model:visible="visible"
    v-model="values"
    :form="{ columns }"
    title="添加新会议"
    confirm-text="确认"
    cancel-text="取消"
    @confirm="handleSubmit"
  >
    <!-- 文件上传的自定义插槽 -->
    <template #plus-field-meeting_files>
      <el-upload
        :action="uploadUrl"
        list-type="text"
        multiple
        :limit="5"
        :file-list="uploadedFiles"
        accept=".doc,.docx,.pdf,.png,.jpg,.jpeg"
        @success="handleUploadSuccess"
        @remove="handleRemoveFile"
      >
        <el-button type="primary">上传附件</el-button>
        <template #tip>
          <div class="el-upload__tip">
            只能上传 Word (doc, docx)、PDF、PNG、JPG、JPEG 文件，且不超过 500kb
          </div>
        </template>
      </el-upload>
    </template>
  </PlusDialogForm>
</template>
